const { db } = require("../../confic/db");

const createSearchHistoryService = async (input) => {
  const { user_id, productId } = input;
  try {
    const insertQuery = `INSERT INTO recent_search_history (product_id, user_id) VALUES (?, ?)`;
    const [result] = await db
      .promise()
      .query(insertQuery, [productId, user_id]);
    if (result.affectedRows > 0) {
      return { success: true, status: 201, message: "Inserted successfully" };
    } else {
      return { success: false, status: 400, message: "unable to Insert" };
    }
  } catch (error) {
    console.error(error);
    return { success: false, status: 500, message: "Database error" };
  }
};

// const getSearchHistoryService = async (input) => {
//   const { user_id, limit, offset } = input;
//   try {
//     const getSearchQuery = `SELECT * FROM recent_search_history WHERE user_id = ? LIMIT ? OFFSET ?`;
//     const [searchHistoryResult] = await db
//       .promise()
//       .query(getSearchQuery, [user_id, parseInt(limit), parseInt(offset)]);
//     if (searchHistoryResult.length > 0) {
//       const productgetResult = await Promise.all(
//         searchHistoryResult.map(async (search) => {
//           const getProductsQuery = `
//                 SELECT
//                   p.product_id, 
//                   p.name AS productName, 
//                   p.brand AS brandName,
//                   p.category_id
//                 FROM product p
//                 WHERE p.product_id = ?`;

//           const [productResult] = await db
//             .promise()
//             .query(getProductsQuery, [search.product_id]);

//           if (productResult.length > 0) {
//             const productWithVariants = await Promise.all(
//               productResult.map(async (product) => {
//                 const getVariantsQuery = `
//                       SELECT
//                         pv.*,
//                         i.*
//                       FROM productvariant pv
//                       JOIN inventory i ON pv.variant_id = i.variant_id
//                       WHERE pv.product_id = ?`;

//                 const [variants] = await db
//                   .promise()
//                   .query(getVariantsQuery, [product.product_id]);
//                 const variantsWithDetails = await Promise.all(
//                   variants.map(async (variant) => {
//                     let discountValue = 0;
//                     let discountType = null;

//                     const originalPrice = parseFloat(variant.price);
//                     let discountedPrice = originalPrice;

//                     if (discountType && discountType.toLowerCase() === "flat") {
//                       discountedPrice = Math.max(
//                         0,
//                         originalPrice - discountValue
//                       );
//                     } else if (discountType && discountType === "Percentage") {
//                       const discountAmount =
//                         (originalPrice * discountValue) / 100;
//                       discountedPrice = Math.max(
//                         0,
//                         originalPrice - discountAmount
//                       );
//                     }

//                     variant.price = discountedPrice.toFixed(2);

//                     const getProductImagesQuery = `
//                         SELECT
//                         pi.id,
//                         pi.image_url,
//                         pi.image_tag,
//                         pi.alt_text,
//                         pi.is_primary,
//                         pi.image_id
//                         FROM productimage pi
//                         WHERE pi.image_id = ? 
//                         AND (pi.image_tag = 'variant' OR pi.image_tag = 'VARIANT')
//                         AND pi.is_primary = 'Y';`;

//                     const [imageResult] = await db
//                       .promise()
//                       .query(getProductImagesQuery, [variant.variant_id]);
//                     return {
//                       ...variant,
//                       discountValue, // Include discount details
//                       discountType, // Include the type of discount
//                       originalPrice, // Keep original price for reference
//                       images: imageResult || [],
//                     };
//                   })
//                 );
//                 return {
//                   ...product,
//                   variant: variantsWithDetails,
//                 };
//               })
//             );
//             return {
//               ...search,
//               product: productWithVariants,
//             };
//           }
//         })
//       );
//       return productgetResult;
//     } else {
//       return [];
//     }
//   } catch (error) {
//     console.error(error);
//     return { success: false, status: 500, message: "Database error" };
//   }
// };

const getSearchHistoryService = async (input) => {
  const { user_id, limit, offset } = input;
  try {
    const getSearchQuery = `
      SELECT 
        rsh.*,
        p.product_id,
        p.name AS productName,
        p.brand AS brandName,
        p.category_id
      FROM recent_search_history rsh
      JOIN product p ON rsh.product_id = p.product_id
      WHERE rsh.user_id = ?
      LIMIT ? OFFSET ?;
    `;

    const [searchHistoryWithProducts] = await db
      .promise()
      .query(getSearchQuery, [user_id, parseInt(limit), parseInt(offset)]);

    if (searchHistoryWithProducts.length > 0) {
      const resultWithDetails = await Promise.all(
        searchHistoryWithProducts.map(async (entry) => {
          const getVariantsQuery = `
            SELECT
              pv.*,
              i.*,
              pi.id AS image_id,
              pi.image_url,
              pi.image_tag,
              pi.alt_text,
              pi.is_primary
            FROM productvariant pv
            JOIN inventory i ON pv.variant_id = i.variant_id
            LEFT JOIN productimage pi ON pi.image_id = pv.variant_id
              AND pi.is_primary = 'Y'
              AND (pi.image_tag = 'variant' OR pi.image_tag = 'VARIANT')
            WHERE pv.product_id = ?;
          `;

          const [variants] = await db.promise().query(getVariantsQuery, [
            entry.product_id,
          ]);

          const variantsWithDetails = variants.map((variant) => {
            let discountValue = 0;
            let discountType = null;

            const originalPrice = parseFloat(variant.price);
            let discountedPrice = originalPrice;

            if (discountType && discountType.toLowerCase() === "flat") {
              discountedPrice = Math.max(0, originalPrice - discountValue);
            } else if (discountType && discountType === "Percentage") {
              const discountAmount =
                (originalPrice * discountValue) / 100;
              discountedPrice = Math.max(0, originalPrice - discountAmount);
            }

            return {
              ...variant,
              price: discountedPrice.toFixed(2),
              discountValue,
              discountType,
              originalPrice,
            };
          });

          return {
            ...entry,
            variants: variantsWithDetails,
          };
        })
      );
      return resultWithDetails;
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    return { success: false, status: 500, message: "Database error" };
  }
};


module.exports = { createSearchHistoryService, getSearchHistoryService };
