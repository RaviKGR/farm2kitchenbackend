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
    description,
    size,
    type,
    barcode,
    quantityInStock,
    discountPercentage,
    images,
  } = input;

  const categoryId = input.categoryId || null;
  const price = input.price || null;
  const reorderLevel = input.reorderLevel || null;
  const imageTag = input.imageTag.toUpperCase();

  try {
    // Step 1: Check for existing product if no productId is provided
    if (!productId) {
      const verifyProduct = `SELECT * FROM product WHERE name = ?`;
      const productResult = await query(verifyProduct, [productName]);

      if (productResult.length > 0) {
        return output({ status: 400, message: "Product Already exists" }, null);
      }

      const insertProduct = `
        INSERT INTO product (name, brand, category_id, status, best_seller, deleted) 
        VALUES (?, ?, ?, True, False, 'N');
      `;
      const productInsertResult = await query(insertProduct, [
        productName,
        brandName,
        categoryId,
      ]);
      const lastProductId = productInsertResult.insertId;

      // Step 2: Insert into productvariant using `lastProductId`
      const insertVariant = `
        INSERT INTO productvariant (product_id, description, size, type, barcode, is_primary, status, best_seller, deleted)
        VALUES (?, ?, ?, ?, ?, "Y", True, False, 'N');
      `;
      const variantInsertResult = await query(insertVariant, [
        lastProductId,
        description,
        size,
        type,
        barcode,
      ]);
      const lastVariantId = variantInsertResult.insertId;

      // Step 3: Insert into inventory using `lastVariantId`
      const insertInventory = `
        INSERT INTO inventory (variant_id, quantity_in_stock, price, reorder_level, discount_percentage) 
        VALUES (?, ?, ?, ?, ?);
      `;
      await query(insertInventory, [
        lastVariantId,
        quantityInStock,
        price,
        reorderLevel,
        discountPercentage,
      ]);

      // Step 4: Insert images
      await Promise.all(
        images.map((image, index) => {
          return query(
            `
            INSERT INTO productimage (image_id, image_url, image_tag, alt_text, is_primary) 
            VALUES (?, ?, ?, ?, ?);
          `,
            [lastVariantId, image.name, imageTag, productName, image.is_primary]
          );
        })
      );
      output(null, { message: "Product added successfully" });
    } else {
      // Logic for adding variant to an existing product
      const insertVariant = `
        INSERT INTO productvariant (product_id, description, size, type, barcode, is_primary, status, best_seller, deleted)
        VALUES (?, ?, ?, ?, ?, "N", True, False, 'N');
      `;
      const variantInsertResult = await query(insertVariant, [
        productId,
        description,
        size,
        type,
        barcode,
      ]);
      const lastVariantId = variantInsertResult.insertId;

      const insertInventory = `
        INSERT INTO inventory (variant_id, quantity_in_stock, price, reorder_level, discount_percentage) 
        VALUES (?, ?, ?, ?, ?);
      `;
      await query(insertInventory, [
        lastVariantId,
        quantityInStock,
        price,
        reorderLevel,
        discountPercentage,
      ]);

      // Insert images for the existing product
      await Promise.all(
        images.map((image, index) => {
          return query(
            `
            INSERT INTO productimage (image_id, image_url, image_tag, alt_text, is_primary) 
            VALUES (?, ?, ?, ?, ?);
          `,
            [lastVariantId, image.name, imageTag, productName, image.is_primary]
          );
        })
      );

      output(null, { message: "Product added successfully" });
    }
  } catch (err) {
    output({ error: { description: err.message } }, null);
  }
};

// Helper function to execute queries
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
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

const getProductByCategoryIdService = async (category_Id) => {

  //   const query = `
  //   SELECT o.offer_id, o.name, o.description, o.discountType, o.discountValue, o.start_date, o.end_date, o.deleted
  //   FROM Offer o
  //   JOIN Offer_Details od ON od.offer_id = o.offer_id
  //   WHERE od.tag_id = ?
  //     AND CURDATE() BETWEEN o.start_date AND o.end_date;
  // `;


  //   const [results] = await db.promise().query(query, [category_Id]);
  //   if (results.length > 0) {
  //     const offer = results[0];  // Assuming you want the first offer from the results
  //     const discountType = offer.discountType;
  //     const discountValue = parseFloat(offer.discountValue);  // Parse discountValue to a float

  //     console.log(discountType, discountValue);

  //     // Assuming filteredCartData is already defined somewhere
  //     filteredCartData = filteredCartData.map(product => {
  //       const originalPrice = parseFloat(product.price);  // Parse the product price
  //       const discountedPrice = Math.max(0, originalPrice - discountValue);  // Apply the discount

  //       return {
  //         ...product,
  //         discountValue,         // Add the discount value to the product
  //         originalPrice,         // Keep the original price
  //         price: discountedPrice.toFixed(2)  // Update the price with the discounted value, rounded to 2 decimal places
  //       };
  //     });

  //     return filteredCartData;  // Return the updated filteredCartData array
  //   } else {
  //     console.log("No offers found.");
  //     return [];
  //   }



  const getProductsQuery = `
  SELECT
    p.product_id, 
    p.name AS productName, 
    p.brand AS brandName,
    p.category_id
  FROM product p
  WHERE p.category_id = ?`;

  const [productResult] = await db
    .promise()
    .query(getProductsQuery, [category_Id]);

  if (productResult.length > 0) {
    const variantResult = await Promise.all(
      productResult.map(async (product) => {
        const getQuery = `
      SELECT
        pv.*,
        i.*,
        c.cart_id,
        c.quantity_count
      FROM productvariant pv
      JOIN inventory i ON pv.variant_id = i.variant_id
      LEFT JOIN cart c ON c.variant_id = pv.variant_id
      WHERE pv.product_id = ?`;

        const [variants] = await db
          .promise()
          .query(getQuery, [product.product_id]);

        const variantsWithDetails = await Promise.all(
          variants.map(async (variant) => {
            // Fetch offer details
            const offerQuery = `
          SELECT o.offer_id, o.name, o.description, o.discountType, o.discountValue, o.start_date, o.end_date, o.deleted
          FROM Offer o
          JOIN Offer_Details od ON od.offer_id = o.offer_id
          WHERE od.tag_id = ?
            AND CURDATE() BETWEEN o.start_date AND o.end_date;`;

            const [offerResults] = await db.promise().query(offerQuery, [category_Id]);
            let discountValue = 0;

            if (offerResults.length > 0) {
              const offer = offerResults[0];
              discountValue = parseFloat(offer.discountValue);
            } else {
              console.log("No offers found.");
            }

            // Adjust the price based on the discount
            const originalPrice = parseFloat(variant.price);
            const discountedPrice = Math.max(0, originalPrice - discountValue);
            variant.price = discountedPrice.toFixed(2);

            // Fetch product images
            const getProductImagesQuery = `
          SELECT
            pi.id,
            pi.image_url,
            pi.image_tag,
            pi.alt_text,
            pi.is_primary,
            pi.image_id
          FROM productimage pi
          WHERE pi.image_id = ? 
            AND (pi.image_tag = 'variant' OR pi.image_tag = 'VARIANT')
            AND pi.is_primary = 'Y';`;

            const [imageResult] = await db
              .promise()
              .query(getProductImagesQuery, [variant.variant_id]);

            return {
              ...variant,
              discountValue, // Include discount details
              originalPrice, // Keep original price for reference
              images: imageResult || [],
            };
          })
        );

        return {
          ...product,
          variants: variantsWithDetails || [],
        };
      })
    );

    return variantResult;
  } else {
    return [];
  }
}

const getProductByProductIdService = async (ProductId) => {
  try {
    const getProductsQuery = `
      SELECT
        p.product_id, 
        p.name AS productName, 
        p.brand AS brandName,
        p.category_id, 
        p.status, 
        p.deleted
      FROM product p
      WHERE p.product_id = ? AND p.deleted = 'N' 
        AND p.status = True
    `;
    const [productResult] = await db
      .promise()
      .query(getProductsQuery, [ProductId]);

    if (productResult.length > 0) {
      let productData = {
        product_id: productResult[0].product_id,
        productName: productResult[0].productName,
        brandName: productResult[0].brandName,
        category_id: productResult[0].category_id,
        status: productResult[0].status,
        variants: [],
        images: [],
      };

      const getProductVariantsQuery = `
        SELECT
          pv.product_id,
          pv.variant_id,
          pv.description, 
          pv.size,
          pv.type,
          pv.barcode,
          pv.is_primary,
          i.variant_id,
          i.quantity_in_stock,
          i.price,
          i.discount_percentage
        FROM productvariant pv
        JOIN inventory i ON i.variant_id = pv.variant_id
        WHERE pv.product_id IN (?);
      `;
      const [variantResult] = await db
        .promise()
        .query(getProductVariantsQuery, [ProductId]);
      const getProductImagesQuery = `
        SELECT 
          pi.id,
          pi.image_url, 
          pi.image_tag, 
          pi.alt_text, 
          pi.is_primary,
          pi.image_id
        FROM productimage pi
        WHERE pi.image_id IN (?)
          AND (pi.image_tag = ? OR pi.image_tag = ?);
      `;
      if (variantResult.length > 0) {
        for (let variant of variantResult) {
          const [imageQuery] = await db
            .promise()
            .query(getProductImagesQuery, [
              variant.variant_id,
              "variant",
              "VARIANT",
            ]);
          // Add images to the variant
          variant.images = imageQuery.length > 0 ? imageQuery : [];

          productData.variants.push(variant);
        }
      }

      const [productImageQuery] = await db
        .promise()
        .query(getProductImagesQuery, [ProductId, "product", "PRODUCT"]);

      productData.images =
        productImageQuery.length > 0 ? productImageQuery : [];

      return [productData];
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return { success: false, message: "Database error" };
  }
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
      pv.is_primary,
      i.variant_id,
      i.quantity_in_stock,
      i.price,
      i.discount_percentage,
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
    JOIN inventory i ON i.variant_id = pv.variant_id
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
    WHERE (pi.image_tag = 'variant' OR pi.image_tag = 'VARIANT');
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
              (j) => j.image_id === i.variant_id
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

  let whereClause = "WHERE 1=1"; // Default WHERE clause to append conditions
  const queryParams = [];

  if (categoryId) {
    whereClause += " AND p.category_id = ?";
    queryParams.push(categoryId);
  }

  if (productName) {
    whereClause += " AND p.name LIKE ?";
    queryParams.push(`%${productName}%`);
  }

  const getProductVariantsQuery = `
    SELECT
      COUNT(*) OVER() AS total_count,
      pv.product_id,
      pv.variant_id,
      pv.description, 
      pv.size,
      pv.type,
      pv.barcode,
      pv.is_primary,
      i.variant_id,
      i.quantity_in_stock,
      i.price,
      i.discount_percentage,
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
    JOIN inventory i ON i.variant_id = pv.variant_id
    JOIN category c ON c.category_id = p.category_id
    LEFT JOIN category ca ON ca.category_id = c.parent_category_id
    ${whereClause} 
    LIMIT ? OFFSET ?;
  `;
  queryParams.push(parseInt(limit), parseInt(offset));

  const getProductImagesQuery = `
    SELECT 
      pi.id,
      pi.image_url, 
      pi.image_tag, 
      pi.alt_text, 
      pi.is_primary,
      pi.image_id
    FROM productimage pi
    WHERE pi.image_tag IN ('variant', 'VARIANT');
  `;

  db.query(getProductVariantsQuery, queryParams, (err, productResult) => {
    if (err) {
      return output({ error: { description: err.message } }, null);
    }
    if (productResult.length === 0) {
      return output(null, []);
    }

    db.query(getProductImagesQuery, (err, imageResult) => {
      if (err) {
        return output({ error: { description: err.message } }, null);
      } else {
        const products = productResult.map((product) => {
          const image = imageResult.filter(
            (img) => img.image_id === product.variant_id
          );
          return {
            ...product,
            image,
          };
        });

        output(null, products);
      }
    });
  });
};

const getProductByOfferService = async (input) => {
  const { offerId, offerTag } = input;
  try {
    if (offerTag === "CATEGORY" || offerTag === "category") {
      const getoffer = `SELECT * FROM offer_details WHERE offer_id = ? AND offer_tag = ?`;
      const [offerResult] = await db
        .promise()
        .query(getoffer, [offerId, offerTag]);
      console.log(offerResult);

      if (offerResult.length > 0) {
        const result = await Promise.all(
          offerResult.map(async (cate) => {
            return await getProductByCategoryIdService(cate.tag_id);
          })
        );
        return result.flat();
      } else {
        return [];
      }
    } else if (offerTag === "VARIANT" || offerTag === "variant") {
      const getoffer = `SELECT * FROM offer_details WHERE offer_id = ? AND offer_tag = ?`;
      const [offerResult] = await db
        .promise()
        .query(getoffer, [offerId, offerTag]);
      console.log(offerResult);

      if (offerResult.length > 0) {
        const ProductVariant = await Promise.all(
          offerResult.map(async (off) => {
            const getProductVariantsQuery = `
            SELECT
              pv.product_id,
              pv.variant_id,
              pv.description, 
              pv.size,
              pv.type,
              pv.barcode,
              pv.is_primary,
              i.variant_id,
              i.quantity_in_stock,
              i.price,
              i.discount_percentage,
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
            JOIN inventory i ON i.variant_id = pv.variant_id
            JOIN category c ON c.category_id = p.category_id
            LEFT JOIN category ca ON ca.category_id = c.parent_category_id
            WHERE pv.variant_id = ?;
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
            WHERE (pi.image_tag = 'variant' OR pi.image_tag = 'VARIANT');
          `;
            const [variantResult] = await db
              .promise()
              .query(getProductVariantsQuery, [off.tag_id]);
            const [imageResult] = await db
              .promise()
              .query(getProductImagesQuery);

            if (variantResult.length > 0) {
              const variant = variantResult.map((i) => {
                const images = imageResult.filter(
                  (img) => img.image_id === i.variant_id
                );
                return { ...i, images };
              });
              return variant;
            }
            return [];
          })
        );

        const flattenedProductVariants = ProductVariant.flat();
        return flattenedProductVariants;
      } else {
        return [];
      }
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 500, message: "Database error" };
  }
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
  } = input;

  const UpdateProduct = `UPDATE product SET name = ?, brand = ?, category_id = ? WHERE product_id = ?;
  UPDATE productvariant SET description = ?, size = ?, type = ? WHERE variant_id = ?;
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

const getProductBarCodeService = async (input, output) => {
  const { barCode, limit, offset } = input;
  try {
    const getProductVariantsQuery = `
    SELECT
      COUNT(*) OVER() AS total_count,
      pv.product_id,
      pv.variant_id,
      pv.description, 
      pv.size,
      pv.type,
      pv.barcode,
      i.variant_id,
      i.quantity_in_stock,
      i.price,
      i.discount_percentage,
      p.product_id, 
      p.name AS productName, 
      p.brand AS brandName
    FROM productvariant pv
    JOIN product p ON p.product_id = pv.product_id
    JOIN inventory i ON i.variant_id = pv.variant_id
    JOIN category c ON c.category_id = p.category_id
    LEFT JOIN category ca ON ca.category_id = c.parent_category_id
    WHERE pv.barcode LIKE ?
    LIMIT ? OFFSET ?;
  `;
    const [variantResult] = await db
      .promise()
      .query(getProductVariantsQuery, [
        `%${barCode}%`,
        parseInt(limit),
        parseInt(offset),
      ]);
    if (variantResult.length > 0) {
      const getProductImagesQuery = `
      SELECT 
        pi.id,
        pi.image_url,
        pi.image_id
      FROM productimage pi
      WHERE pi.image_tag IN ('variant', 'VARIANT') 
      AND pi.is_primary IN ('Y', 'y');
      `;
      const [imageResult] = await db.promise().query(getProductImagesQuery);
      if (imageResult.length > 0) {
        const variantResults = variantResult.map((variant) => {
          const primaryImage = imageResult.find(
            (image) => image.image_id === variant.variant_id
          );
          return {
            ...variant,
            image_url: primaryImage ? primaryImage.image_url : null,
          };
        });
        return variantResults;
      } else {
        return { success: false, message: "No images found" };
      }
    } else {
      return { success: false, message: "No product variants found" };
    }
  } catch (e) {
    console.error(e);
    return { success: false, message: "Database error" };
  }
};

const getBestSellerProductService = async (input, output) => {
  const { limit, offset } = input;
  const GetAllProduct = `
    SELECT
      COUNT(pv.variant_id) OVER() AS toatal_count,
      p.product_id, 
      p.name, 
      p.category_id, 
      p.status, 
      p.deleted,
      pv.description, 
      pv.size,
      pv.type,
      pv.barcode, 
      pv.is_primary,
      i.variant_id,
      i.quantity_in_stock,
      i.price,
      i.discount_percentage,
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
    JOIN inventory i ON i.variant_id = pv.variant_id
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
              isPrimary: list.is_primary,
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

const getProductByProductNameService = async (input, output) => {
  const { productName, categoryId } = input;

  let whereClause = "";
  const queryParams = [];
  const hasConditions = productName || categoryId;
  if (hasConditions) {
    if (productName) {
      whereClause += "p.name LIKE ?";
      queryParams.push(`%${productName}%`);
    }
    if (categoryId) {
      whereClause += (whereClause ? "AND " : "") + "p.category_id = ?";
      queryParams.push(categoryId);
    }
  }
  const getQuery = `
  SELECT p.product_id, p.name, p.brand, p.category_id, pv.description, pv.type, pv.size, pv.variant_id
  FROM product p
  JOIN productvariant pv ON pv.product_id = p.product_id
  ${hasConditions ? `WHERE ${whereClause}` : ""}`;
  db.query(getQuery, [...queryParams], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      const results = result.map((list) => ({
        product_id: list.product_id,
        name: list.name,
        brand: list.brand,
        category_id: list.category_id,
        description: list.description,
        type: list.type,
        size: list.size,
        variant_id: list.variant_id,
      }));
      output(null, results);
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

const addNewProductImageService = async (input) => {
  const { imageId, images, altText } = input;
  const imageTag = input.imageTag.toUpperCase();
  const isPrimary = input.isPrimary.toUpperCase();
  try {
    await Promise.all(
      images.map((image) => {
        return db
          .promise()
          .query(
            `INSERT INTO productimage (image_id, image_url, image_tag, alt_text, is_primary) VALUES (?, ?, ?, ?, ?)`,
            [imageId, image, imageTag, altText, isPrimary]
          );
      })
    );
    return { success: true, message: "All images inserted successfully." };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Database error" };
  }
};

const getProductvariantByproService = async (input) => {
  const { limit, offset, categoryId, productName } = input;

  try {
    // Array-based approach for WHERE conditions
    let whereConditions = [
      "p.deleted = 'N'",
      "p.status = TRUE",
      "pv.is_primary = 'Y'",
    ];
    const queryParams = [];

    // Dynamically adding conditions
    if (categoryId) {
      whereConditions.push("p.category_id = ?");
      queryParams.push(categoryId);
    }

    if (productName) {
      whereConditions.push("p.name LIKE ?");
      queryParams.push(`%${productName}%`); // Partial match using wildcards
    }

    // Final query construction
    const getProductsQuery = `
      SELECT
        p.product_id, 
        p.name AS productName, 
        p.brand AS brandName,
        p.category_id, 
        p.status, 
        p.deleted,
        pv.variant_id,
        pv.description,
        pv.size,
        pv.type,
        pv.barcode,
        pv.is_primary,
        i.price,
        i.discount_percentage
      FROM product p
      JOIN productvariant pv ON pv.product_id = p.product_id
      JOIN inventory i ON i.variant_id = pv.variant_id
      WHERE ${whereConditions.join(" AND ")} 
      LIMIT ? OFFSET ?
    `;

    // Add LIMIT and OFFSET
    queryParams.push(parseInt(limit), parseInt(offset));

    // Execute the first query
    const [productResult] = await db
      .promise()
      .query(getProductsQuery, queryParams);

    if (productResult.length > 0) {
      // Second query for product images
      const getProductImagesQuery = `
      SELECT 
        pi.id,
        pi.image_url, 
        pi.image_tag, 
        pi.alt_text, 
        pi.is_primary,
        pi.image_id
      FROM productimage pi
      JOIN productvariant pv ON pv.variant_id = pi.image_id
      WHERE (pi.image_tag = 'variant' OR pi.image_tag = 'VARIANT') AND pv.is_primary = 'Y';
      `;
      const [imageResult] = await db.promise().query(getProductImagesQuery);

      // Map the products to include images
      const variantResult = productResult.map((product) => {
        const variantImage = imageResult.filter(
          (image) => image.image_id === product.variant_id
        );
        return {
          ...product,
          images: variantImage, // Attach images for each variant
        };
      });

      return variantResult;
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Database error" };
  }
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
  addNewProductImageService,
  getProductvariantByproService,
  getProductByOfferService,
};
