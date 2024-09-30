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
    productId,
    productName,
    brandName,
    categoryId,
    isPrimary,
    description,
    size,
    type,
    purchasePrice,
    HST,
    barcode,
    purchaseDate,
    quantityInStock,
    price,
    reorderLevel,
    discountPercentage,
    images,
  } = input;
  const imageTag = input.imageTag.toUpperCase();
  // Step 1: Insert the product and capture `insertId` for `product_id`
  if (!productId) {
    const insertProduct = `
    INSERT INTO product (name, brand, category_id, status, best_seller, product_deleted) 
    VALUES (?, ?, True, False, 'N');
  `;

    db.query(insertProduct, [productName, brandName, categoryId], async (err, result) => {
      if (err) {
        return output({ error: { description: err.message } }, null);
      }
      const last_product_id = result.insertId;

      // Step 2: Insert into productvariant using `last_product_id`
      const insertVariant = `
      INSERT INTO productvariant (product_id, description, size, type, purchase_price, HST, barcode, purchase_date, status, best_seller, deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, True, False, 'N');
    `;

      db.query(
        insertVariant,
        [
          last_product_id,
          description,
          size,
          type,
          purchasePrice,
          HST,
          barcode,
          purchaseDate,
        ],
        (err, result) => {
          if (err) {
            return output({ error: { description: err.message } }, null);
          }
          const last_variant_id = result.insertId; // Get the last inserted variant ID

          // Step 3: Insert into inventory using `last_variant_id`
          const insertInventory = `
        INSERT INTO inventory (variant_id, quantity_in_stock, price, reorder_level, discount_percentage) 
        VALUES (?, ?, ?, ?, ?);
      `;
          db.query(
            insertInventory,
            [
              last_variant_id,
              quantityInStock,
              price,
              reorderLevel,
              discountPercentage,
            ],
            async (err, result) => {
              if (err) {
                return output({ error: { description: err.message } }, null);
              }

              // Step 4: Insert images
              const insertImage = `
          INSERT INTO productimage (product_id, image_url, image_tag, alt_text, is_primary) 
          VALUES (?, ?, ?, ?, ?);
        `;

              try {
                // Insert all images related to the product
                await Promise.all(
                  images.map((image) => {
                    return new Promise((resolve, reject) => {
                      db.query(
                        insertImage,
                        [
                          last_product_id,
                          image,
                          imageTag,
                          productName,
                          isPrimary,
                        ],
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
                output(null, { message: "Product added successfully" });
              } catch (err) {
                output({ error: { description: err.message } }, null);
              }
            }
          );
        }
      );
    });
  } else {
    const insertVariant = `
    INSERT INTO productvariant (product_id, description, size, type, purchase_price, HST, barcode, purchase_date, status, best_seller, deleted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, True, False, 'N');
  `;
    db.query(
      insertVariant,
      [
        productId,
        description,
        size,
        type,
        purchasePrice,
        HST,
        barcode,
        purchaseDate,
      ],
      (err, result) => {
        if (err) {
          output({ error: { description: err.message } }, null);
        } else {
          const last_variant_id = result.insertId;

          const insertInventory = ` INSERT INTO inventory (variant_id, quantity_in_stock, price, reorder_level, discount_percentage) VALUES (?, ?, ?, ?, ?);`;

          db.query(
            insertInventory,
            [
              last_variant_id,
              quantityInStock,
              price,
              reorderLevel,
              discountPercentage,
            ],
            (err, result) => {
              if (err) {
                output({ error: { description: err.message } }, null);
              } else {
                output(null, { message: "Product added successfully" });
              }
            }
          );
        }
      }
    );
  }
};

const GetCategoryIdProduct = async (input, output) => {
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

const getProductByCategoryIdService = async (categoryId, output) => {
  const selectQuery = `
    SELECT 
      p.product_id, 
      p.name, 
      p.brand,
      p.category_id, 
      p.status, 
      p.product_deleted,
      pv.description, 
      pv.size,
      pv.type,
      pv.purchase_price,
      pv.HST,
      pv.barcode,
      pv.purchase_date, 
      pi.id,
      pi.image_id, 
      pi.image_url, 
      pi.image_tag, 
      pi.alt_text, 
      pi.is_primary
    FROM product p
    JOIN productimage pi
    ON pi.image_id = p.product_id
    JOIN productvariant pv
    ON pv.product_id = p.product_id
    WHERE p.category_id = ? AND pi.image_tag = "product" OR pi.image_tag = "PRODUCT" AND p.product_deleted = "N" AND p.status = True
  `;
  db.query(selectQuery, [categoryId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      const products = result.reduce((acc, row) => {
        if (!acc[row.product_id]) {
          // If not, create a new product object with an empty images array
          acc[row.product_id] = {
            product_id: row.product_id,
            productName: row.name,
            brandName: row.brand,
            description: row.description,
            price: row.price,
            category_id: row.category_id,
            barcode: row.barcode,
            size: row.size,
            type: row.type,
            purchase_price: row.purchase_price,
            HST: row.HST,
            purchase_date: row.purchase_date,
            price: row.price,
            quantity_in_stock: row.quantity_in_stock,
            status: row.status,
            product_deleted: row.product_deleted,
            images: [],
          };
        }

        // Add each image to the corresponding product's images array
        acc[row.product_id].images.push({
          id: row.id,
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

const getProductByProductIdService = async (ProductId, output) => {
  // const getProductById = `SELECT * FROM product WHERE product_id = ? AND product_deleted = "N" AND status = True`;
  const getProductById = `
    SELECT 
      p.product_id, 
      p.name, 
      p.brand,
      p.category_id, 
      p.status, 
      p.product_deleted,
      pv.description, 
      pv.size,
      pv.type,
      pv.purchase_price,
      pv.HST,
      pv.barcode,
      pv.purchase_date,  
      pi.id,
      pi.image_id, 
      pi.image_url, 
      pi.image_tag, 
      pi.alt_text, 
      pi.is_primary
    FROM product p
    JOIN productimage pi
    ON pi.image_id = p.product_id
    JOIN productvariant pv
    ON pv.product_id = p.product_id
    WHERE p.product_id = ? AND (pi.image_tag = "product" OR pi.image_tag = "PRODUCT") AND p.product_deleted = "N" AND p.status = True
  `;
  db.query(getProductById, [ProductId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      const product = result.reduce((acc, row) => {
        if (!acc.product_id) {
          acc = {
            product_id: row.product_id,
            productName: row.name,
            brandName: row.brand,
            description: row.description,
            price: row.price,
            category_id: row.category_id,
            barcode: row.barcode,
            size: row.size,
            type: row.type,
            purchase_price: row.purchase_price,
            HST: row.HST,
            purchase_date: row.purchase_date,
            price: row.price,
            quantity_in_stock: row.quantity_in_stock,
            status: row.status,
            product_deleted: row.product_deleted,
            images: [],
          };
        }

        // Add each image to the images array
        acc.images.push({
          id: row.id,
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
      p.product_id, 
      p.name, 
      p.brand,
      p.category_id, 
      p.status, 
      p.product_deleted,
      pv.description, 
      pv.size,
      pv.type,
      pv.purchase_price,
      pv.HST,
      pv.barcode,
      pv.purchase_date, 
      pi.id,
      pi.image_id, 
      pi.image_url, 
      pi.image_tag, 
      pi.alt_text, 
      pi.is_primary
    FROM product p
    JOIN productimage pi
      ON pi.image_id = p.product_id
    JOIN productvariant pv
      ON pv.product_id = p.product_id
    WHERE (pi.image_tag = "product" OR pi.image_tag = "PRODUCT")
      AND p.product_deleted = "N" 
      AND p.status = True
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
            productName: row.name,
            brandName: row.brand,
            description: row.description,
            price: row.price,
            category_id: row.category_id,
            barcode: row.barcode,
            size: row.size,
            type: row.type,
            purchase_price: row.purchase_price,
            HST: row.HST,
            purchase_date: row.purchase_date,
            price: row.price,
            quantity_in_stock: row.quantity_in_stock,
            status: row.status,
            product_deleted: row.product_deleted,
            images: [],
          };
        }

        // Add each image to the corresponding product's images array
        acc[row.product_id].images.push({
          id: row.id,
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
    productBrand,
    categoryId,
    variantId,
    description,
    size,
    type,
    purchasePrice,
    HST,
    barcode,
    purchaseDate,
  } = input;

  const UpdateProduct = `UPDATE product SET name = ?, brand = ?, category_id = ? WHERE product_id = ?;
  UPDATE productvariant SET description = ?, size = ?, type = ?, purchase_price = ?, HST = ?, barcode = ?, purchase_date = ? WHERE variant_id = ?;
  `;
  db.query(
    UpdateProduct,
    [productName, productBrand, categoryId, productId, description, size, type, purchasePrice, HST, barcode, purchaseDate, variantId],
    (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else {
        output(null, { message: "Product updated successfully", result });
      }
    }
  );
};

const updateProductImageService = async (id, image, output) => {
  const updateimage = `UPDATE productimage SET image_url = ? WHERE id = ?`;
  db.query(updateimage, [image, id], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, { message: "Product iamge updated successfully" });
    }
  });
};

const updateProductStatusService = async (input, output) => {
  const { productId, productStatus } = input;

  const status =
    productStatus == "true" || productStatus == "True" ? true : false;

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
  const getProductByBarcode = `
    SELECT 
      p.product_id, 
      p.name, 
      p.category_id, 
      p.status, 
      p.product_deleted,
      pv.description, 
      pv.size,
      pv.type,
      pv.purchase_price,
      pv.HST,
      pv.barcode,
      pv.purchase_date, 
      pi.id,
      pi.image_id, 
      pi.image_url, 
      pi.image_tag, 
      pi.alt_text, 
      pi.is_primary
    FROM product p
    JOIN productimage pi
      ON pi.image_id = p.product_id
    JOIN productvariant pv
      ON pv.product_id = p.product_id
    WHERE pv.barcode = ? AND (pi.image_tag = "product" OR pi.image_tag = "PRODUCT") 
      AND p.product_deleted = "N" 
      AND p.status = True 
      AND p.best_Seller = 1
      `;

  db.query(getProductByBarcode, [barCode], (err, result) => {
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
            size: row.size,
            type: row.type,
            purchase_price: row.purchase_price,
            HST: row.HST,
            purchase_date: row.purchase_date,
            price: row.price,
            quantity_in_stock: row.quantity_in_stock,
            status: row.status,
            product_deleted: row.product_deleted,
            images: [],
          };
        }

        // Add each image to the images array
        acc.images.push({
          id: row.id,
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
      p.product_id, 
      p.name, 
      p.category_id, 
      p.status, 
      p.product_deleted,
      pv.description, 
      pv.size,
      pv.type,
      pv.purchase_price,
      pv.HST,
      pv.barcode,
      pv.purchase_date, 
      pi.id,
      pi.image_id, 
      pi.image_url, 
      pi.image_tag, 
      pi.alt_text, 
      pi.is_primary
    FROM product p
    JOIN productimage pi
      ON pi.image_id = p.product_id
    JOIN productvariant pv
      ON pv.product_id = p.product_id
    WHERE (pi.image_tag = "product" OR pi.image_tag = "PRODUCT") 
      AND p.product_deleted = "N" 
      AND p.status = True 
      AND p.best_Seller = 1
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
            size: row.size,
            type: row.type,
            purchase_price: row.purchase_price,
            HST: row.HST,
            purchase_date: row.purchase_date,
            price: row.price,
            quantity_in_stock: row.quantity_in_stock,
            status: row.status,
            product_deleted: row.product_deleted,
            images: [],
          };
        }

        // Add each image to the corresponding product's images array
        acc[row.product_id].images.push({
          id: row.id,
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
  const BestSeller =
    bestSeller == "true" || bestSeller == "True" ? true : false;

  const UpdateBestSeller = `UPDATE product SET best_Seller = ? WHERE product_id = ?`;
  db.query(UpdateBestSeller, [BestSeller, productId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, { message: "BestSeller updated successfully", result });
    }
  });
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
  GetCategoryIdProduct,
  getProductByCategoryIdService,
  addNewProductService,
  getProductByProductIdService,
  getAllProductService,
  updateProductService,
  updateProductImageService,
  updateProductStatusService,
  deleteProductService,
  getProductBarCodeService,
  getBestSellerProductService,
  updateBestSellerProductService,
  getProductsToCSVService,
};
