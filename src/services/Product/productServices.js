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
    // isPrimary,
    description,
    size,
    type,
    // purchasePrice,
    // HST,
    barcode,
    // purchaseDate,
    quantityInStock,
    price,
    reorderLevel,
    discountPercentage,
    images,
  } = input;
  const categoryId = input.categoryId || null;

  const imageTag = input.imageTag.toUpperCase();
  // Step 1: Insert the product and capture `insertId` for `product_id`
  if (!productId) {
    const verifiyProduct = `SELECT * FROM product WHERE name = ?`;
    db.query(verifiyProduct, [productName], (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else {
        if (result.length > 0) {
          output(null, { message: "Product Already exists" });
        } else {
          const insertProduct = `
          INSERT INTO product (name, brand, category_id, status, best_seller, deleted) 
          VALUES (?, ?, ?, True, False, 'N');
        `;

          db.query(
            insertProduct,
            [productName, brandName, categoryId],
            async (err, result) => {
              if (err) {
                return output({ error: { description: err.message } }, null);
              }
              const last_product_id = result.insertId;

              // Step 2: Insert into productvariant using `last_product_id`
              const insertVariant = `
            INSERT INTO productvariant (product_id, description, size, type, barcode, status, best_seller, deleted)
            VALUES (?, ?, ?, ?, ?, True, False, 'N');
          `;

              db.query(
                insertVariant,
                [
                  last_product_id,
                  description,
                  size,
                  type,
                  barcode,
                ],
                (err, result) => {
                  if (err) {
                    return output(
                      { error: { description: err.message } },
                      null
                    );
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
                        return output(
                          { error: { description: err.message } },
                          null
                        );
                      }

                      // Step 4: Insert images
                      const insertImage = `
                INSERT INTO productimage (image_id, image_url, image_tag, alt_text, is_primary) 
                VALUES (?, ?, ?, ?, ?);
              `;

                      try {
                        // Insert all images related to the product
                        await Promise.all(
                          images.map((image, i) => {
                            return new Promise((resolve, reject) => {
                              db.query(
                                insertImage,
                                [
                                  last_product_id,
                                  image,
                                  imageTag,
                                  productName,
                                  i === 0 ? "Y" : "N",
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
            }
          );
        }
      }
    });
  } else {
    const insertVariant = `
    INSERT INTO productvariant (product_id, description, size, type, barcode, status, best_seller, deleted)
    VALUES (?, ?, ?, ?, ?, True, False, 'N');
  `;
    db.query(
      insertVariant,
      [
        productId,
        description,
        size,
        type,
        barcode,
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

  const categoryProdect = `SELECT * FROM product WHERE category_id = ? AND deleted = "N" AND status = True`;

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
      p.deleted,
      pv.description, 
      pv.size,
      pv.type,
      pv.barcode, 
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
    WHERE p.category_id = ? AND pi.image_tag = "product" OR pi.image_tag = "PRODUCT" AND p.deleted = "N" AND p.status = True
  `;
  db.query(selectQuery, [categoryId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      const productList = {};
      result.forEach((list) => {
        if (!productList[list.product_id]) {
          productList[list.product_id] = {
            total_count: list.total_count,
            product_id: list.product_id,
            productName: list.name,
            brandName: list.brand,
            category_id: list.category_id,
            status: list.status,
            variant_id: list.variant_id,
            description: list.description,
            price: list.price,
            size: list.size,
            type: list.type,
            barcode: list.barcode,
            // purchase_price: list.purchase_price,
            // HST: list.HST,
            // purchase_date: list.purchase_date,
            image: [],
          };
        }
        productList[list.product_id].image.push({
          id: list.id,
          image_id: list.image_id,
          image_url: list.image_url,
          image_tag: list.image_tag,
          alt_text: list.alt_text,
          is_primary: list.is_primary,
        });
      });

      const productArray = Object.values(productList);
      output(null, productArray);
    }
  });
};

const getProductByProductIdService = async (ProductId, output) => {
  // const getProductById = `SELECT * FROM product WHERE product_id = ? AND deleted = "N" AND status = True`;
  const getProductById = `
    SELECT 
      p.product_id, 
      p.name, 
      p.brand,
      p.category_id, 
      p.status, 
      p.deleted,
      pv.description, 
      pv.size,
      pv.type,
      pv.barcode, 
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
    WHERE p.product_id = ? AND (pi.image_tag = "product" OR pi.image_tag = "PRODUCT") AND p.deleted = "N" AND p.status = True
  `;
  db.query(getProductById, [ProductId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      const productList = {};
      result.forEach((list) => {
        if (!productList[list.product_id]) {
          productList[list.product_id] = {
            total_count: list.total_count,
            product_id: list.product_id,
            productName: list.name,
            brandName: list.brand,
            category_id: list.category_id,
            status: list.status,
            variant_id: list.variant_id,
            description: list.description,
            price: list.price,
            size: list.size,
            type: list.type,
            barcode: list.barcode,
            // purchase_price: list.purchase_price,
            // HST: list.HST,
            // purchase_date: list.purchase_date,
            image: [],
          };
        }
        productList[list.product_id].image.push({
          id: list.id,
          image_id: list.image_id,
          image_url: list.image_url,
          image_tag: list.image_tag,
          alt_text: list.alt_text,
          is_primary: list.is_primary,
        });
      });

      const productArray = Object.values(productList);
      output(null, productArray);
    }
  });
};

// const getAllProductService = async (input, output) => {
//   const { limit, offset } = input;
//   const GetAllProduct = `
//   SELECT
//     p.product_id,
//     p.name AS productName,
//     p.brand AS brandName,
//     p.category_id,
//     p.status,
//     p.deleted,
//     pv.variant_id,
//     pv.description,
//     pv.size,
//     pv.type,
//     pv.purchase_price,
//     pv.HST,
//     pv.barcode,
//     pv.purchase_date,
//     pi.id AS image_id,
//     pi.image_url,
//     pi.image_tag,
//     pi.alt_text,
//     pi.is_primary
// FROM product p
// JOIN productimage pi ON pi.image_id = p.product_id
// JOIN productvariant pv ON pv.product_id = p.product_id
// WHERE (pi.image_tag = 'product' OR pi.image_tag = 'PRODUCT')
//   AND p.deleted = 'N'
//   AND p.status = True
// LIMIT ? OFFSET ?;

// `;

//   db.query(
//     GetAllProduct,
//     [parseInt(limit), parseInt(offset)],
//     (err, result) => {
//       if (err) {
//         output({ error: { description: err.message } }, null);
//       } else {
//         const productList = {};
//         result.forEach((list) => {
//           if (!productList[list.product_id]) {
//             productList[list.product_id] = {
//               total_count: list.total_count,
//               product_id: list.product_id,
//               productName: list.name,
//               brandName: list.brand,
//               category_id: list.category_id,
//               status: list.status,
//               variant_id: list.variant_id,
//               description: list.description,
//               price: list.price,
//               size: list.size,
//               type: list.type,
//               barcode: list.barcode,
//               purchase_price: list.purchase_price,
//               HST: list.HST,
//               purchase_date: list.purchase_date,
//               image: [],
//             };
//           }
//           productList[list.product_id].image.push({
//             id: list.id,
//             image_id: list.image_id,
//             image_url: list.image_url,
//             image_tag: list.image_tag,
//             alt_text: list.alt_text,
//             is_primary: list.is_primary,
//           });
//         });

//         const productArray = Object.values(productList);
//         output(null, productArray);
//       }
//     }
//   );
// };

const getAllProductService = async (input, output) => {
  const { limit, offset } = input;

  const getProductVariantsQuery = `
    SELECT
    COUNT(*) OVER() AS total_count,
      pv.product_id,
      pv.variant_id,
      pv.description, 
      pv.size,
      pv.type,
      pv.barcode,
      c.category_id,
      c.name AS category_name,
      c.parent_category_id,
      ca.name AS parent_category_name,
      p.product_id, 
      p.name AS productName, 
      p.brand AS brandName,
      p.status, 
      p.deleted
    FROM productvariant pv
    JOIN product p ON p.product_id = pv.product_id
    JOIN category c ON c.category_id = p.category_id
    LEFT JOIN category ca ON ca.category_id = c.parent_category_id
    LIMIT ? OFFSET ?;
  `;
  const getProductImagesQuery = `
    SELECT 
      pi.id,
      pi.image_url, 
      pi.image_tag, 
      pi.alt_text, 
      pi.is_primary,
      pi.image_id
    FROM productimage pi
    WHERE (pi.image_tag = 'product' OR pi.image_tag = 'PRODUCT');
  `;
  db.query(
    getProductVariantsQuery,
    [parseInt(limit), parseInt(offset)],
    (err, productResult) => {
      if (err) {
        return output({ error: { description: err.message } }, null);
      }
      if (productResult.length === 0) {
        return output(null, []);
      }

      db.query(getProductImagesQuery, (err, imageResult) => {
        if (err) {
          output({ error: { description: err.message } }, null);
        } else {
          const products = productResult.map((i) => {
            const image = imageResult.filter(
              (j) => j.image_id === i.product_id
            );
            return {
              ...i,
              image,
            };
          });

          output(null, products);
        }
      });
    }
  );
};

const getFilterProductService = async (input, output) => {
  const { categoryId, productName, limit, offset } = input;
  const getProductVariantsQuery = `
  SELECT
  COUNT(*) OVER() AS total_count,
    pv.product_id,
    pv.variant_id,
    pv.description, 
    pv.size,
    pv.type,
    pv.barcode,
    c.category_id,
    c.name AS category_name,
    ca.name AS parent_category_name,
    p.product_id, 
    p.name AS productName, 
    p.brand AS brandName,
    p.status, 
    p.deleted
  FROM productvariant pv
  JOIN product p ON p.product_id = pv.product_id
  JOIN category c ON c.category_id = p.category_id
  LEFT JOIN category ca ON ca.category_id = c.parent_category_id
  WHERE c.category_id = ? OR p.name LIKE ?
  LIMIT ? OFFSET ?;
`;
  const getProductImagesQuery = `
  SELECT 
    pi.id AS image_id,
    pi.image_url, 
    pi.image_tag, 
    pi.alt_text, 
    pi.is_primary,
    pi.image_id
  FROM productimage pi
  WHERE (pi.image_tag = 'product' OR pi.image_tag = 'PRODUCT');
`;
  db.query(
    getProductVariantsQuery,
    [categoryId, [`${productName}`], parseInt(limit), parseInt(offset)],
    (err, productResult) => {
      if (err) {
        return output({ error: { description: err.message } }, null);
      }
      if (productResult.length === 0) {
        return output(null, []);
      }

      db.query(getProductImagesQuery, (err, imageResult) => {
        if (err) {
          output({ error: { description: err.message } }, null);
        } else {
          const products = productResult.map((i) => {
            const image = imageResult.filter(
              (j) => j.image_id === i.product_id
            );
            return {
              ...i,
              image,
            };
          });

          output(null, products);
        }
      });
    }
  );
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
    barcode,
  } = input;

  const UpdateProduct = `UPDATE product SET name = ?, brand = ?, category_id = ? WHERE product_id = ?;
  UPDATE productvariant SET description = ?, size = ?, type = ?, barcode = ? WHERE variant_id = ?;
  `;
  db.query(
    UpdateProduct,
    [
      productName,
      productBrand,
      categoryId,
      productId,
      description,
      size,
      type,
      barcode,
      variantId,
    ],
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
  const Image = `/uploads/${image}`;
  const updateimage = `UPDATE productimage SET image_url = ? WHERE id = ?`;
  db.query(updateimage, [Image, id], (err, result) => {
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
  const updateQuery = `UPDATE product SET deleted = "Y" WHERE product_id = ?`;
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
      p.deleted,
      pv.description, 
      pv.size,
      pv.type,
      pv.barcode,
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
      AND p.deleted = "N" 
      AND p.status = True 
      AND p.best_Seller = 1
      `;

  db.query(getProductByBarcode, [barCode], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else if (result.length === 0) {
      output(null, null); // No product found
    } else {
      const productList = {};
      result.forEach((list) => {
        if (!productList[list.product_id]) {
          productList[list.product_id] = {
            total_count: list.total_count,
            product_id: list.product_id,
            productName: list.name,
            brandName: list.brand,
            category_id: list.category_id,
            status: list.status,
            variant_id: list.variant_id,
            description: list.description,
            price: list.price,
            size: list.size,
            type: list.type,
            barcode: list.barcode,
            // purchase_price: list.purchase_price,
            // HST: list.HST,
            // purchase_date: list.purchase_date,
            image: [],
          };
        }
        productList[list.product_id].image.push({
          id: list.id,
          image_id: list.image_id,
          image_url: list.image_url,
          image_tag: list.image_tag,
          alt_text: list.alt_text,
          is_primary: list.is_primary,
        });
      });

      const productArray = Object.values(productList);
      output(null, productArray);
    }
  });
};

const getBestSellerProductService = async (input, output) => {
  const { limit, offset } = input;
  const GetAllProduct = `
    SELECT 
      p.product_id, 
      p.name, 
      p.category_id, 
      p.status, 
      p.deleted,
      pv.description, 
      pv.size,
      pv.type,
      pv.barcode, 
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
      AND p.deleted = "N" 
      AND p.status = True 
      AND p.best_Seller = 1
      LIMIT ? OFFSET ?
  `;

  db.query(
    GetAllProduct,
    [parseInt(limit), parseInt(offset)],
    (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
      } else {
        const productList = {};
        result.forEach((list) => {
          if (!productList[list.product_id]) {
            productList[list.product_id] = {
              total_count: list.total_count,
              product_id: list.product_id,
              productName: list.name,
              brandName: list.brand,
              category_id: list.category_id,
              status: list.status,
              variant_id: list.variant_id,
              description: list.description,
              price: list.price,
              size: list.size,
              type: list.type,
              barcode: list.barcode,
              // purchase_price: list.purchase_price,
              // HST: list.HST,
              // purchase_date: list.purchase_date,
              image: [],
            };
          }
          productList[list.product_id].image.push({
            id: list.id,
            image_id: list.image_id,
            image_url: list.image_url,
            image_tag: list.image_tag,
            alt_text: list.alt_text,
            is_primary: list.is_primary,
          });
        });

        const productArray = Object.values(productList);
        output(null, productArray);
      }
    }
  );
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
    WHERE deleted = "N" 
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

const getProductByProductNameService = async (productName, output) => {
  const getQuery = `
  SELECT p.product_id, p.name, p.brand, p.category_id, pv.description, pv.type, pv.variant_id
  FROM product p
  JOIN productvariant pv ON pv.product_id = p.product_id
  WHERE p.name LIKE ?`;
  db.query(getQuery, [`%${productName}%`], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, result);
    }
  });
};

const updateProductAndCategoryMapService = async (input, output) => {
  const { categoryId, productId } = input;
  const updateQuery = `UPDATE product SET category_id = ? WHERE product_id = ?;`;
  db.query(updateQuery, [categoryId, productId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, {
        message: "Product And Category mapping Successfully completed",
      });
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
  getProductByProductNameService,
  updateProductAndCategoryMapService,
  getFilterProductService,
};
