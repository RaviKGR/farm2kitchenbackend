const { db } = require("../../confic/db");

const SearchProduct = async (input, output) => {
  const SearchName = input.query.SearchName;
  const SearchProductWithCategory = `
    SELECT 
        p.product_id, p.name AS product_name, p.description, p.price, p.barcode,
        c.category_id, c.name AS category_name, c.description AS category_description
      FROM 
        Product p
      JOIN 
        Category c ON p.category_id = c.category_id
      WHERE 
        p.name LIKE ? OR c.name LIKE ?
  `;
  db.query(
    SearchProductWithCategory,
    [`%${SearchName}%`, `%${SearchName}%`],
    (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else {
        output(null, result);
      }
    }
  );
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

  const insertProduct = `INSERT INTO product (name, description, price, category_id, barcode, status, product_deleted) 
  VALUES (?, ?, ?, ?, ?, True, "N");`;

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
  const category_id = input.query.categoryId;
  const categoryProdect = `SELECT * FROM product WHERE category_id LIKE ? AND product_deleted = "N" AND status = True`;

  db.query(categoryProdect, [category_id], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, result);
    }
  });
};

const getProductByProductIdService = async (ProductId, output) => {
  const getProductById = `SELECT * FROM product WHERE product_id = ? AND product_deleted = "N" AND status = True`;
  db.query(getProductById, [ProductId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, result);
    }
  });
};

const getAllProductService = async (input, output) => {
  const GetAllProduct = `SELECT * FROM product WHERE product_deleted = "N" AND status = True`;
  db.query(GetAllProduct, (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, result);
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

  const status = productStatus == "true" ? true : false;

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

module.exports = {
  SearchProduct,
  GetCategoryIdProdect,
  addNewProductService,
  getProductByProductIdService,
  getAllProductService,
  updateProductService,
  updateProductStatusService,
  deleteProductService,
};