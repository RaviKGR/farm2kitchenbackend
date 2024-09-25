const { db } = require("../../confic/db");

const SearchProduct = (input) => {
  const SearchName = input.query.SearchName;
  const SearchProductWithCategory = `
  SELECT 
      p.product_id, 
      p.name AS product_name, 
      pv.description AS variant_description, 
      pv.size, 
      pv.type, 
      pv.barcode, 
      c.category_id, 
      c.name AS category_name, 
      c.description AS category_description,
      i.quantity_in_stock,
      CASE 
          WHEN i.quantity_in_stock = 0 THEN 'Out of Stock' 
          ELSE 'In Stock' 
      END AS stock_status
  FROM 
      Product p
  INNER JOIN 
      Category c ON p.category_id = c.category_id
  INNER JOIN
      productVariant pv ON pv.product_id = p.product_id
  INNER JOIN
      Inventory i ON i.variant_id = pv.variant_id
  WHERE 
      p.name LIKE ? OR c.name LIKE ?
`;


  return new Promise((resolve, reject) => {
    db.query(
      SearchProductWithCategory,
      [`%${SearchName}%`, `%${SearchName}%`],
      (err, result) => {
        if (err) {
          reject({ description: err.message, status: 400 });
        } else {
          resolve(result);
        }
      }
    );
  });
};


const addNewProductService = async (input, output) => {
  const {
    productName,
    description,
    price,
    categoryId,
    barcode,
    images,
    isPrimary,
  } = input;

  const insertProduct = `INSERT INTO product (name, description, price, category_id, barcode, status, best_Seller, product_deleted) 
  VALUES (?, ?, ?, ?, ?, True, False, "N");`;

  db.query(
    insertProduct,
    [productName, description, price, categoryId, barcode],
    async (err, result) => {
      if (err) {
        return output({ error: { description: err.message } }, null);
      }

      const last_product_id = result.insertId;
      const insertImage = `INSERT INTO productimage (image_id, image_url, image_tag, alt_text, is_primary) 
    VALUES (?, ?, "product", ?, ?);`;

      try {
        // Use Promise.all to execute all insert queries for images
        await Promise.all(
          images.map((image) => {
            return new Promise((resolve, reject) => {
              db.query(
                insertImage,
                [last_product_id, image, productName, isPrimary],
                (err, result) => {
                  if (err) {
                    return reject(err);
                  }
                  resolve(result);
                }
              );
            });
          })
        );

        output(null, { message: "Product added successfully", result });
      } catch (err) {
        output({ error: { description: err.message } }, null);
      }
    }
  );
};

const GetCategoryIdProdect = async (input, output) => {
  const category_id = input.query.category_Id;

  const categoryProdect = `SELECT * FROM product WHERE category_id = ? AND product_deleted = "N" AND status = True`;

  db.query(categoryProdect, [category_id], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, result);
    }
  });
};

const getProductByProductIdService = async (ProductId, output) => {
  // const getProductById = `SELECT * FROM product WHERE product_id = ? AND product_deleted = "N" AND status = True`;
  const getProductById = `
    SELECT 
      product.product_id, 
      product.name, 
      product.description, 
      product.price, 
      product.category_id, 
      product.barcode, 
      product.status, 
      product.product_deleted,
      productimage.id AS image_id, 
      productimage.image_url, 
      productimage.image_tag, 
      productimage.alt_text, 
      productimage.is_primary
    FROM product
    JOIN productimage 
    ON productimage.image_id = product.product_id
    WHERE product_id = ? AND image_tag = "product" AND product_deleted = "N" AND status = True
  `;
  db.query(getProductById, [ProductId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      const product = result.reduce((acc, row) => {
        if (!acc.product_id) {
          acc = {
            product_id: row.product_id,
            name: row.name,
            description: row.description,
            price: row.price,
            category_id: row.category_id,
            barcode: row.barcode,
            status: row.status,
            product_deleted: row.product_deleted,
            images: [],
          };
        }

        // Add each image to the images array
        acc.images.push({
          image_id: row.image_id,
          image_url: row.image_url,
          image_tag: row.image_tag,
          alt_text: row.alt_text,
          is_primary: row.is_primary,
        });

        return acc;
      }, {});

      output(null, product);
    }
  });
};

const getAllProductService = async (input, output) => {
  // const GetAllProduct = `SELECT * FROM product WHERE product_deleted = "N" AND status = True`;
  const GetAllProduct = `
    SELECT 
      product.product_id, 
      product.name, 
      product.description, 
      product.price, 
      product.category_id, 
      product.barcode, 
      product.status, 
      product.product_deleted,
      productimage.id AS image_id, 
      productimage.image_url, 
      productimage.image_tag, 
      productimage.alt_text, 
      productimage.is_primary
    FROM product
    JOIN productimage 
    ON productimage.image_id = product.product_id
    WHERE image_tag = "product" AND product_deleted = "N" AND status = True
  `;
  db.query(GetAllProduct, (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      const products = result.reduce((acc, row) => {
        if (!acc[row.product_id]) {
          // If not, create a new product object with an empty images array
          acc[row.product_id] = {
            product_id: row.product_id,
            name: row.name,
            description: row.description,
            price: row.price,
            category_id: row.category_id,
            barcode: row.barcode,
            status: row.status,
            product_deleted: row.product_deleted,
            images: [],
          };
        }

        // Add each image to the corresponding product's images array
        acc[row.product_id].images.push({
          image_id: row.image_id,
          image_url: row.image_url,
          image_tag: row.image_tag,
          alt_text: row.alt_text,
          is_primary: row.is_primary,
        });

        return acc;
      }, {});

      const productArray = Object.values(products);

      output(null, productArray);
    }
  });
};

const updateProductService = async (input, output) => {
  const {
    productId,
    productName,
    description,
    price,
    categoryId,
    barcode,
    images,
    isPrimary,
  } = input;

  const UpdateProduct = `UPDATE product SET name = ?, description = ?, price = ?, category_id = ?, barcode = ? WHERE product_id = ?`;
  db.query(
    UpdateProduct,
    [productName, description, price, categoryId, barcode, productId],
    (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else {
        const UpdatedData = `SELECT * FROM product WHERE product_id = ? AND product_deleted = "N" AND status = True`;
        db.query(UpdatedData, [productId], (err, result) => {
          if (err) {
            output({ error: { description: err.message } }, null);
          } else {
            output(null, { message: "Product updated successfully", result });
          }
        });
      }
    }
  );
};

const updateProductStatusService = async (input, output) => {
  const { productId, productStatus } = input;

  const status = productStatus == "true" || productStatus == "True" ? true : false;

  const updateAndSelectQuery = `
    UPDATE product SET status = ? WHERE product_id = ?;
    SELECT * FROM product WHERE product_id = ?;
  `;

  db.query(
    updateAndSelectQuery,
    [status, productId, productId],
    (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else {
        const updatedProduct = result[1];
        output(null, {
          message: "Product updated successfully",
          result: updatedProduct,
        });
      }
    }
  );
};

const deleteProductService = async (productId, output) => {
  const updateQuery = `UPDATE product SET product_deleted = "Y" WHERE product_id = ?`;
  db.query(updateQuery, [productId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, { message: "Product Deleted successfully" });
    }
  });
};

const getProductBarCodeService = async (barCode, output) => {
  const selectQuery = `
    SELECT 
      product.product_id, 
      product.name, 
      product.description, 
      product.price, 
      product.category_id, 
      product.barcode, 
      product.status, 
      product.product_deleted,
      productimage.id AS image_id, 
      productimage.image_url, 
      productimage.image_tag, 
      productimage.alt_text, 
      productimage.is_primary
    FROM product
    JOIN productimage 
    ON productimage.image_id = product.product_id
    WHERE barcode = ? AND image_tag = "product" AND product_deleted = "N" AND status = True
  `;

  db.query(selectQuery, [barCode], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else if (result.length === 0) {
      output(null, null); // No product found
    } else {
      const product = result.reduce((acc, row) => {
        if (!acc.product_id) {
          acc = {
            product_id: row.product_id,
            name: row.name,
            description: row.description,
            price: row.price,
            category_id: row.category_id,
            barcode: row.barcode,
            status: row.status,
            product_deleted: row.product_deleted,
            images: [],
          };
        }

        // Add each image to the images array
        acc.images.push({
          image_id: row.image_id,
          image_url: row.image_url,
          image_tag: row.image_tag,
          alt_text: row.alt_text,
          is_primary: row.is_primary,
        });

        return acc;
      }, {});

      output(null, product);
    }
  });
};

const getBestSellerProductService = async (output) => {
  const GetAllProduct = `
  SELECT 
    product.product_id, 
    product.name, 
    product.description, 
    product.price, 
    product.category_id, 
    product.barcode, 
    product.status, 
    product.product_deleted,
    productimage.id AS image_id, 
    productimage.image_url, 
    productimage.image_tag, 
    productimage.alt_text, 
    productimage.is_primary
  FROM product
  JOIN productimage 
  ON productimage.image_id = product.product_id
  WHERE image_tag = "product" AND product_deleted = "N" AND status = True AND best_Seller = 1
`;
  db.query(GetAllProduct, (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      const products = result.reduce((acc, row) => {
        if (!acc[row.product_id]) {
          // If not, create a new product object with an empty images array
          acc[row.product_id] = {
            product_id: row.product_id,
            name: row.name,
            description: row.description,
            price: row.price,
            category_id: row.category_id,
            barcode: row.barcode,
            status: row.status,
            product_deleted: row.product_deleted,
            images: [],
          };
        }

        // Add each image to the corresponding product's images array
        acc[row.product_id].images.push({
          image_id: row.image_id,
          image_url: row.image_url,
          image_tag: row.image_tag,
          alt_text: row.alt_text,
          is_primary: row.is_primary,
        });

        return acc;
      }, {});

      const productArray = Object.values(products);

      output(null, productArray);
    }
  });
};

const updateBestSellerProductService = async (input, output) => {
  const { productId, bestSeller } = input;
  const BestSeller = bestSeller == "true" || bestSeller == "True" ? true : false;

  const UpdateBestSeller = `UPDATE product SET best_Seller = ? WHERE product_id = ?`;
  db.query(UpdateBestSeller, [BestSeller, productId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, { message: "BestSeller updated successfully", result })
    }
  })
};

const getProductsToCSVService = (callback) => {
  // SQL query to fetch products by category_id
  const ProductQuery = `
    SELECT * 
    FROM product 
    WHERE product_deleted = "N" 
    AND status = True
  `;

  // Executing the query
  db.query(ProductQuery, (err, result) => {
    if (err) {
      // If there's an error, pass it to the callback with an error description
      return callback({ error: { description: err.message } }, null);
    } else {
      // If query is successful, pass the result to the callback
      return callback(null, result);
    }
  });
};

module.exports = {
  SearchProduct,
  GetCategoryIdProdect,
  addNewProductService,
  getProductByProductIdService,
  getAllProductService,
  updateProductService,
  updateProductStatusService,
  deleteProductService,
  getProductBarCodeService,
  getBestSellerProductService,
  updateBestSellerProductService,
  getProductsToCSVService
};
