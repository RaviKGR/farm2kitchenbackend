const { db } = require("../../confic/db");

const SearchProduct = (input) => {
  const SearchName = input.searchTerm?.trim();
  if (!SearchName) {
    return Promise.reject({
      description: "Search term is required",
      status: 400,
    });
  }
  const SearchProductWithCategory = `
  SELECT 
      p.product_id, 
      p.name AS product_name,  
      c.category_id, 
      c.name AS category_name, 
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
    const checkBarcode = `SELECT * FROM productvariant WHERE barcode = ?`;
    const variantResult = await query(checkBarcode, [barcode]);
    if (variantResult.length > 0) {
      return output({ status: 400, message: "Barcode Already exists" }, null);
    } else {
      if (!productId) {
        const verifyProduct = `SELECT * FROM product WHERE name = ?`;
        const productResult = await query(verifyProduct, [productName]);

        if (productResult.length > 0) {
          return output(
            { status: 400, message: "Product Already exists" },
            null
          );
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
              [
                lastVariantId,
                image.name,
                imageTag,
                productName,
                image.is_primary,
              ]
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
              [
                lastVariantId,
                image.name,
                imageTag,
                productName,
                image.is_primary,
              ]
            );
          })
        );

        output(null, { message: "Product added successfully" });
      }
    }
    // Step 1: Check for existing product if no productId is provided
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

const getProductByCategoryIdService = async (
  category_Id,
  userId,
  tepm_UserId
) => {
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
    const cartQuery = `
    SELECT
      c.variant_id,
      c.cart_id,
      c.user_id,
      c.quantity_count
    FROM cart c
    WHERE c.temp_user_id = ?`;
    const [cartResults] = await db.promise().query(cartQuery, [tepm_UserId]);

    const variantResult = await Promise.all(
      productResult.map(async (product) => {
        const getVariantsQuery = `
          SELECT
            pv.*,
            i.*
          FROM productvariant pv
          JOIN inventory i ON pv.variant_id = i.variant_id
          WHERE pv.product_id = ? AND i.price IS NOT NULL`;

        const [variants] = await db
          .promise()
          .query(getVariantsQuery, [product.product_id]);

        if (!variants.length) return null; // Skip this product if no variants
        const variantsWithDetails = await Promise.all(
          variants.map(async (variant) => {
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
              AND pi.is_primary = 'Y'`;

            const [imageResult] = await db
              .promise()
              .query(getProductImagesQuery, [variant.variant_id]);

            if (!imageResult.length) return null; // Skip this variant if no images

            // Fetch offer details
            const offerQuery = `
            SELECT o.offer_id, o.name, o.description, o.discountType, o.discountValue, o.start_date, o.end_date, o.deleted, od.offer_tag, od.tag_id
            FROM Offer o
            JOIN Offer_Details od ON od.offer_id = o.offer_id
            WHERE od.tag_id = ?
              AND CURDATE() BETWEEN o.start_date AND o.end_date AND offer_tag = "CATEGORY";`;

            const [categoryOfferResults] = await db
              .promise()
              .query(offerQuery, [category_Id]);

            let discountValue = 0;
            let discountType = null;

            if (categoryOfferResults.length > 0) {
              console.log("categoryOfferResults", categoryOfferResults);

              const CateogryOffer = categoryOfferResults[0];
              discountValue = parseFloat(CateogryOffer.discountValue);
              discountType = CateogryOffer.discountType;
            } else {
              const offerQuery = `
                SELECT o.offer_id, o.name, o.description, o.discountType, o.discountValue, o.start_date, o.end_date, o.deleted, od.offer_tag, od.tag_id
                FROM Offer o
                JOIN Offer_Details od ON od.offer_id = o.offer_id
                WHERE od.tag_id = ?
                  AND CURDATE() BETWEEN o.start_date AND o.end_date AND offer_tag = "VARIANT";`;
              const [variantOfferResults] = await db
                .promise()
                .query(offerQuery, [variant.variant_id]);

              if (variantOfferResults && variantOfferResults.length > 0) {
                console.log("variantOfferResults", variantOfferResults[0]);
                const VariantOffer = variantOfferResults[0];
                discountValue = parseFloat(VariantOffer.discountValue);
                discountType = VariantOffer.discountType;
              } else {
                console.log("No offers found for variant");
                discountValue = 0; // Default value if no offer
                discountType = null; // Default value if no offer
              }
            }

            const originalPrice = parseFloat(variant.price);
            let discountedPrice = originalPrice;

            if (discountType && discountType.toLowerCase() === "flat") {
              discountedPrice = Math.max(0, originalPrice - discountValue);
            } else if (discountType && discountType === "Percentage") {
              const discountAmount = (originalPrice * discountValue) / 100;
              discountedPrice = Math.max(0, originalPrice - discountAmount);
            }

            variant.price = discountedPrice.toFixed(2);

            const cartData =
              cartResults.find(
                (cart) => cart.variant_id === variant.variant_id
              ) || {};
            return {
              ...variant,
              discountValue,
              discountType,
              originalPrice,
              images: imageResult || [],
              cart_id: cartData.cart_id || null,
              user_id: cartData.user_id || null,
              quantity_count: cartData.quantity_count || null,
            };
          })
        );

        const filteredVariants = variantsWithDetails.filter(Boolean);

        if (!filteredVariants.length) return null; // Skip product if no valid variants

        return {
          ...product,
          variants: filteredVariants || [],
        };
      })
    );

    return variantResult.filter(Boolean); // Filter out null products
  } else {
    return [];
  }
};

// const getProductByCategoryIdService = async (
//   category_Id,
//   userId,
//   tepm_UserId
// ) => {

//   const getProductsQuery = `
//   SELECT
//     p.product_id,
//     p.name AS productName,
//     p.brand AS brandName,
//     p.category_id
//   FROM product p
//   WHERE p.category_id = ?`;

//   const [productResult] = await db
//     .promise()
//     .query(getProductsQuery, [category_Id]);

//   if (productResult.length > 0) {
//     const cartQuery = `
//     SELECT
//       c.variant_id,
//       c.cart_id,
//       c.user_id,
//       c.quantity_count
//     FROM cart c
//     WHERE c.temp_user_id = ?`;
//     const [cartResults] = await db.promise().query(cartQuery, [tepm_UserId]);

//     const variantResult = await Promise.all(
//       productResult.map(async (product) => {
//         const getVariantsQuery = `
//           SELECT
//             pv.*,
//             i.*
//           FROM productvariant pv
//           JOIN inventory i ON pv.variant_id = i.variant_id
//           WHERE pv.product_id = ? and i.price IS NOT NULL`;

//         const [variants] = await db
//           .promise()
//           .query(getVariantsQuery, [product.product_id]);

//         const variantsWithDetails = await Promise.all(
//           variants.map(async (variant) => {
//             // Fetch offer details
//             const offerQuery = `
//             SELECT o.offer_id, o.name, o.description, o.discountType, o.discountValue, o.start_date, o.end_date, o.deleted, od.offer_tag, od.tag_id
//             FROM Offer o
//             JOIN Offer_Details od ON od.offer_id = o.offer_id
//             WHERE od.tag_id = ?
//               AND CURDATE() BETWEEN o.start_date AND o.end_date AND offer_tag = "CATEGORY";`;

//             const [offerResults] = await db
//               .promise()
//               .query(offerQuery, [category_Id]);
//             let discountValue = 0;
//             let discountType = null;

//             if (offerResults.length > 0) {
//               console.log("offerResults", offerResults);

//               const offer = offerResults[0];
//               discountValue = parseFloat(offer.discountValue);
//               discountType = offer.discountType;
//             } else {
//               discountValue = 0;
//               discountType = null;
//             }

//             const originalPrice = parseFloat(variant.price);
//             let discountedPrice = originalPrice;

//             if (discountType && discountType.toLowerCase() === "flat") {
//               discountedPrice = Math.max(0, originalPrice - discountValue);
//             } else if (discountType && discountType === "Percentage") {
//               const discountAmount = (originalPrice * discountValue) / 100;
//               discountedPrice = Math.max(0, originalPrice - discountAmount);
//             }

//             variant.price = discountedPrice.toFixed(2);

//             // Fetch product images
//             const getProductImagesQuery = `
//             SELECT
//               pi.id,
//               pi.image_url,
//               pi.image_tag,
//               pi.alt_text,
//               pi.is_primary,
//               pi.image_id
//             FROM productimage pi
//             WHERE pi.image_id = ?
//               AND (pi.image_tag = 'variant' OR pi.image_tag = 'VARIANT')
//               AND pi.is_primary = 'Y';`;

//             const [imageResult] = await db
//               .promise()
//               .query(getProductImagesQuery, [variant.variant_id]);

//             const cartData =
//               cartResults.find(
//                 (cart) => cart.variant_id === variant.variant_id
//               ) || {};
//             return {
//               ...variant,
//               discountValue, // Include discount details
//               discountType, // Include the type of discount
//               originalPrice, // Keep original price for reference
//               images: imageResult || [],
//               cart_id: cartData.cart_id || null,
//               user_id: cartData.user_id || null,
//               quantity_count: cartData.quantity_count || null,
//             };
//           })
//         );

//         return {
//           ...product,
//           variants: variantsWithDetails || [],
//         };
//       })
//     );

//     return variantResult;
//   } else {
//     return [];
//   }
// };

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

const getProductByProductIdForCustomerService = async (ProductId, temp_UserId) => {
  try {
    // Step 1: Get products by ProductId
    const getProductsQuery = `
  SELECT
    p.product_id, 
    p.name AS productName, 
    p.brand AS brandName,
    p.category_id
  FROM product p
  WHERE p.product_id = ?`;

    const [productResult] = await db
      .promise()
      .query(getProductsQuery, [ProductId]);

    if (productResult.length > 0) {
      const categoryId = productResult[0].category_id; // Get category_id from the first product

      // Step 2: Get cart data for the temp_user_id
      const cartQuery = `
    SELECT
      c.variant_id,
      c.cart_id,
      c.user_id,
      c.quantity_count
    FROM cart c
    WHERE c.temp_user_id = ?`;
      const [cartResults] = await db.promise().query(cartQuery, [temp_UserId]);

      // Step 3: Get product variants and their images
      const variantResult = await Promise.all(
        productResult.map(async (product) => {
          const getVariantsQuery = `
        SELECT
          pv.*,
          i.*
        FROM productvariant pv
        JOIN inventory i ON pv.variant_id = i.variant_id
        WHERE pv.product_id = ? AND i.price IS NOT NULL`;

          const [variants] = await db
            .promise()
            .query(getVariantsQuery, [product.product_id]);

          if (!variants.length) return null; // Skip this product if no variants

          const variantsWithDetails = await Promise.all(
            variants.map(async (variant) => {
              // Step 4: Get product images for each variant
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
              AND pi.is_primary = 'Y'`;

              const [imageResult] = await db
                .promise()
                .query(getProductImagesQuery, [variant.variant_id]);

              if (!imageResult.length) return null; // Skip this variant if no images

              // Step 5: Check for category-level offer first
              let discountValue = 0;
              let discountType = null;

              const offerQuery = `
            SELECT o.offer_id, o.name, o.description, o.discountType, o.discountValue, o.start_date, o.end_date, o.deleted, od.offer_tag, od.tag_id
            FROM Offer o
            JOIN Offer_Details od ON od.offer_id = o.offer_id
            WHERE od.tag_id = ?
              AND CURDATE() BETWEEN o.start_date AND o.end_date AND offer_tag = "CATEGORY";`;

              const [categoryOfferResults] = await db
                .promise()
                .query(offerQuery, [categoryId]);

              if (categoryOfferResults.length > 0) {
                const CategoryOffer = categoryOfferResults[0];
                discountValue = parseFloat(CategoryOffer.discountValue);
                discountType = CategoryOffer.discountType;
              } else {
                // Step 6: If no category offer, check for variant-level offer
                const variantOfferQuery = `
              SELECT o.offer_id, o.name, o.description, o.discountType, o.discountValue, o.start_date, o.end_date, o.deleted, od.offer_tag, od.tag_id
              FROM Offer o
              JOIN Offer_Details od ON od.offer_id = o.offer_id
              WHERE od.tag_id = ?
                AND CURDATE() BETWEEN o.start_date AND o.end_date AND offer_tag = "VARIANT";`;

                const [variantOfferResults] = await db
                  .promise()
                  .query(variantOfferQuery, [variant.variant_id]);

                if (variantOfferResults.length > 0) {
                  const VariantOffer = variantOfferResults[0];
                  discountValue = parseFloat(VariantOffer.discountValue);
                  discountType = VariantOffer.discountType;
                }
              }

              // Step 7: Calculate the discounted price
              const originalPrice = parseFloat(variant.price);
              let discountedPrice = originalPrice;

              if (discountType && discountType.toLowerCase() === "flat") {
                discountedPrice = Math.max(0, originalPrice - discountValue);
              } else if (discountType && discountType === "Percentage") {
                const discountAmount = (originalPrice * discountValue) / 100;
                discountedPrice = Math.max(0, originalPrice - discountAmount);
              }

              variant.price = discountedPrice.toFixed(2);

              // Step 8: Check if variant is in the cart
              const cartData =
                cartResults.find(
                  (cart) => cart.variant_id === variant.variant_id
                ) || {};

              return {
                ...variant,
                discountValue,
                discountType,
                originalPrice,
                images: imageResult || [],
                cart_id: cartData.cart_id || null,
                user_id: cartData.user_id || null,
                quantity_count: cartData.quantity_count || null,
              };
            })
          );

          const filteredVariants = variantsWithDetails.filter(Boolean);

          if (!filteredVariants.length) return null; // Skip product if no valid variants

          return {
            ...product,
            variants: filteredVariants || [],
          };
        })
      );

      return variantResult.filter(Boolean); // Filter out null products
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
      p.best_Seller,
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
      p.best_Seller,
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
              p.best_Seller,
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
        `${barCode}%`,
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
        return [];
        // return { success: false, message: "No images found" };
      }
    } else {
      return [];
      // return { success: false, message: "No product variants found" };
    }
  } catch (e) {
    console.error(e);
    return { success: false, message: "Database error" };
  }
};

const getBestSellerProductService = async (input) => {
  const { limit, offset } = input;
  const getProductsQuery = `
  SELECT
    p.product_id, 
    p.name AS productName, 
    p.brand AS brandName,
    p.category_id
  FROM product p
  WHERE p.best_Seller = true`;

  const [productResult] = await db.promise().query(getProductsQuery);

  if (productResult.length > 0) {
    const variantResult = await Promise.all(
      productResult.map(async (product) => {
        const getVariantsQuery = `
          SELECT
            pv.*,
            i.*
          FROM productvariant pv
          JOIN inventory i ON pv.variant_id = i.variant_id
          WHERE pv.product_id = ?`;

        const [variants] = await db
          .promise()
          .query(getVariantsQuery, [product.product_id]);

        const variantsWithDetails = await Promise.all(
          variants.map(async (variant) => {
            // Fetch offer details
            const offerQuery = `
            SELECT o.offer_id, o.name, o.description, o.discountType, o.discountValue, o.start_date, o.end_date, o.deleted
            FROM Offer o
            JOIN Offer_Details od ON od.offer_id = o.offer_id
            WHERE od.tag_id = ?
              AND CURDATE() BETWEEN o.start_date AND o.end_date;`;

            const [offerResults] = await db
              .promise()
              .query(offerQuery, [variant.variant_id]);
            let discountValue = 0;
            let discountType = null;

            if (offerResults.length > 0) {
              const offer = offerResults[0];
              discountValue = parseFloat(offer.discountValue);
              discountType = offer.discountType;
            } else {
              discountValue = 0;
              discountType = null;
            }

            const originalPrice = parseFloat(variant.price);
            let discountedPrice = originalPrice;

            if (discountType && discountType.toLowerCase() === "flat") {
              discountedPrice = Math.max(0, originalPrice - discountValue);
            } else if (discountType && discountType === "Percentage") {
              const discountAmount = (originalPrice * discountValue) / 100;
              discountedPrice = Math.max(0, originalPrice - discountAmount);
            }

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
              discountType, // Include the type of discount
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
  const ProductQuery = `
    SELECT * 
    FROM product 
    WHERE deleted = "N" 
    AND status = True
  `;

  db.query(ProductQuery, (err, result) => {
    if (err) {
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
  // const getQuery = `
  // SELECT p.product_id, p.name, p.brand, p.category_id
  // FROM product p
  // ${hasConditions ? `WHERE ${whereClause}` : ""}`;
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
    let whereConditions = [
      "p.deleted = 'N'",
      "p.status = TRUE",
      "pv.is_primary = 'Y'",
    ];
    const queryParams = [];

    if (categoryId) {
      whereConditions.push("p.category_id = ?");
      queryParams.push(categoryId);
    }

    if (productName) {
      whereConditions.push("p.name LIKE ?");
      queryParams.push(`%${productName}%`);
    }

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

    queryParams.push(parseInt(limit), parseInt(offset));

    const [productResult] = await db
      .promise()
      .query(getProductsQuery, queryParams);

    if (productResult.length > 0) {
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

      const variantResult = productResult.map((product) => {
        const variantImage = imageResult.filter(
          (image) => image.image_id === product.variant_id
        );
        return {
          ...product,
          images: variantImage,
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

const getCartData = async () => {
  const cartQuery = `
    SELECT 
      c.cart_id, 
      c.user_id, 
      c.variant_id, 
      c.quantity_count
    FROM cart c
  `;
  const [cartResults] = await db.promise().query(cartQuery);
  return cartResults;
};
const getProductSearchName = async (input) => {
  const SearchName = input.query.SearchName;

  const cartResults = await getCartData();

  const SearchProductWithCategory = `
    SELECT 
      p.product_id, 
      p.name AS productName,  
      c.category_id, 
      c.name AS category_name, 
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

  const [products] = await db
    .promise()
    .query(SearchProductWithCategory, [`%${SearchName}%`, `%${SearchName}%`]);

  if (products.length > 0) {
    const offerQuery = `
      SELECT o.offer_id, o.name, o.description, o.discountType, o.discountValue, o.start_date, o.end_date, o.deleted
      FROM Offer o
      JOIN Offer_Details od ON od.offer_id = o.offer_id
      WHERE CURDATE() BETWEEN o.start_date AND o.end_date;
    `;

    const [offers] = await db.promise().query(offerQuery);

    const productsWithOffers = await Promise.all(
      products.map(async (product) => {
        const getVariantsQuery = `
          SELECT
            pv.*,
            i.*
          FROM productvariant pv
          JOIN inventory i ON pv.variant_id = i.variant_id
          WHERE pv.product_id = ?`;

        const [variants] = await db
          .promise()
          .query(getVariantsQuery, [product.product_id]);

        const variantsWithOffers = await Promise.all(
          variants.map(async (variant) => {
            let discountValue = 0;
            let discountType = null;
            offers.forEach((offer) => {
              if (
                offer.discountType &&
                offer.discountType.toLowerCase() === "flat"
              ) {
                discountValue = Math.max(
                  discountValue,
                  parseFloat(offer.discountValue)
                );
                discountType = "flat";
              } else if (
                offer.discountType &&
                offer.discountType === "Percentage"
              ) {
                const percentageDiscount =
                  (variant.price * parseFloat(offer.discountValue)) / 100;
                discountValue = Math.max(discountValue, percentageDiscount);
                discountType = "Percentage";
              }
            });

            const originalPrice = parseFloat(variant.price);
            let discountedPrice = originalPrice;

            if (discountType === "flat") {
              discountedPrice = Math.max(0, originalPrice - discountValue);
            } else if (discountType === "Percentage") {
              discountedPrice = Math.max(0, originalPrice - discountValue);
            }

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
                AND (pi.image_tag = 'variant' OR pi.image_tag = 'VARIANT');`;

            const [imageResult] = await db
              .promise()
              .query(getProductImagesQuery, [variant.variant_id]);

            const cartData =
              cartResults.find(
                (cart) => cart.variant_id === variant.variant_id
              ) || {};

            return {
              ...variant,
              discountValue,
              discountType,
              originalPrice,
              images: imageResult,
              cart_id: cartData.cart_id || null,
              user_id: cartData.user_id || null,
              quantity_count: cartData.quantity_count || null,
            };
          })
        );

        return {
          ...product,
          variants: variantsWithOffers,
        };
      })
    );

    return productsWithOffers;
  } else {
    return [];
  }
};
const getProductByUserRecentOrderedService = async (input) => {
  const { userId } = input;
  try {
    let category_id;
    const getQuery = `
    SELECT
      COUNT(o.order_id) OVER() AS total_count,
      o.order_id,
      o.user_id,
      p.category_id,
      p.product_id
    FROM  orders o
    JOIN orderitem oi ON oi.order_id = o.order_id
    JOIN productvariant pv ON pv.variant_id = oi.variant_id
    JOIN product p ON p.product_id = pv.product_id
    WHERE o.user_id = ?;
    `;
    const [orderResult] = await db.promise().query(getQuery, [userId]);
    if (orderResult.length > 0) {
      const orderItemsResult = await Promise.all(
        orderResult.map(async (list) => {
          const getOrderItems = ` 
            SELECT
              oi.*,
              pv.product_id,
              p.category_id
            FROM orderitem oi
            JOIN productvariant pv ON pv.variant_id = oi.variant_id
            JOIN product p ON p.product_id = pv.product_id
            WHERE oi.order_id = ?`;
          const [orderItem] = await db
            .promise()
            .query(getOrderItems, [list.order_id]);
          if (orderItem.length > 0) {
            return orderItem;
          }
        })
      );
      const flattenedResult = orderItemsResult.flat();
      if (flattenedResult.length > 0) {
        const productDetails = await Promise.all(
          flattenedResult.map(async (items) => {
            category_id = items.category_id;
            const getProductsQuery = `
            SELECT
            COUNT(p.product_id) OVER() AS total_count,
              p.product_id, 
              p.name AS productName, 
              p.brand AS brandName,
              p.category_id
            FROM product p
            WHERE p.category_id = ? 
            LIMIT 5 OFFSET 0`;

            const [productResult] = await db
              .promise()
              .query(getProductsQuery, [category_id]);

            if (productResult.length > 0) {
              const variantResult = await Promise.all(
                productResult.map(async (product) => {
                  const getVariantsQuery = `
                  SELECT
                    pv.*,
                    i.*
                  FROM productvariant pv
                  JOIN inventory i ON pv.variant_id = i.variant_id
                  WHERE pv.product_id = ?`;

                  const [variants] = await db
                    .promise()
                    .query(getVariantsQuery, [product.product_id]);

                  const variantsWithDetails = await Promise.all(
                    variants.map(async (variant) => {
                      const offerQuery = `
                      SELECT o.offer_id, o.name, o.description, o.discountType, o.discountValue, o.start_date, o.end_date, o.deleted
                      FROM Offer o
                      JOIN Offer_Details od ON od.offer_id = o.offer_id
                      WHERE od.tag_id = ?
                        AND CURDATE() BETWEEN o.start_date AND o.end_date;`;

                      const [offerResults] = await db
                        .promise()
                        .query(offerQuery, [category_id]);
                      let discountValue = 0;
                      let discountType = null;

                      if (offerResults.length > 0) {
                        const offer = offerResults[0];
                        discountValue = parseFloat(offer.discountValue);
                        discountType = offer.discountType;
                      } else {
                        discountValue = 0;
                        discountType = null;
                      }

                      const originalPrice = parseFloat(variant.price);
                      let discountedPrice = originalPrice;

                      if (
                        discountType &&
                        discountType.toLowerCase() === "flat"
                      ) {
                        discountedPrice = Math.max(
                          0,
                          originalPrice - discountValue
                        );
                      } else if (
                        discountType &&
                        discountType === "Percentage"
                      ) {
                        const discountAmount =
                          (originalPrice * discountValue) / 100;
                        discountedPrice = Math.max(
                          0,
                          originalPrice - discountAmount
                        );
                      }

                      variant.price = discountedPrice.toFixed(2);

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
                        discountValue,
                        discountType,
                        originalPrice,
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
          })
        );
        const finalProductDetails = productDetails.flat();
        return finalProductDetails;
      }
      return flattenedResult;
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 500, message: "Database error" };
  }
};

const getReducedAmountProductService = async (input) => {
  const { limit, offset } = input;
  try {
    const getDropPriceQuery = `
          SELECT 
              ph.*,
              p.*,
              pv.*,
              pi.*,
              i.*
          FROM 
              price_history ph
          JOIN 
              productvariant pv ON ph.variant_id = pv.variant_id
          JOIN 
              product p ON pv.product_id = p.product_id
          JOIN 
              productimage pi ON pi.image_id = pv.variant_id
          JOIN 
              inventory i ON i.variant_id = pv.variant_id
          WHERE 
              ph.new_price < ph.old_price
              AND (pi.image_tag = 'variant' OR pi.image_tag = 'VARIANT')
              AND pi.is_primary = 'Y'
          LIMIT ? OFFSET ?`;

    const [result] = await db
      .promise()
      .query(getDropPriceQuery, [parseInt(limit), parseInt(offset)]);
    return result.length > 0 ? result : [];
  } catch (error) {
    console.error(error);
    return { success: false, status: 500, message: "Database Error" };
  }
};

// const getReducedAmountProductService = async (input) => {
//     const { limit, offset } = input;
//     try {
//       const getDropPrice = `
//         SELECT
//         *
//         FROM price_history
//         WHERE new_price < old_price
//         LIMIT ? OFFSET ?`
//       const [getDropPriceHistory] = await db.promise().query(getDropPrice, [parseInt(limit), parseInt(offset)]);
//       if(getDropPriceHistory.length > 0) {
//         const getPriceHistoryProduct = await Promise.all(
//           getDropPriceHistory.map(async (history) => {
//             const getProductQuery = `
//               SELECT
//                 *
//               FROM product p
//               JOIN productvariant pv ON pv.product_id = p.product_id
//               JOIN productimage pi ON pi.image_id = pv.variant_id
//               WHERE (pi.image_tag = 'variant' OR pi.image_tag = 'VARIANT') AND pi.is_primary = "Y" AND pv.variant_id = ?`;
//             const [getProductResult] = await db.promise().query(getProductQuery, [history.variant_id])
//             return {
//               ...history,
//               Product: getProductResult
//             }
//           })
//         )
//         return getPriceHistoryProduct;
//       } else {
//         return []
//       }
//     } catch (error) {
//       console.error(error);
//       return {success: false, status: 500, message: "Database Error"}
//     }
// }

module.exports = {
  SearchProduct,
  getProductSearchName,
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
  getProductByUserRecentOrderedService,
  getReducedAmountProductService,
  getProductByProductIdForCustomerService,
};
