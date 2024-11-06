const { db } = require("../../confic/db");

const addFavoriteServieces = async (input, output) => {
  const user_id = input.userId;
  const product_id = input.productId;
  const insertFavorite = `INSERT INTO favorites (user_id, product_id) values (?,?)`;
  db.query(insertFavorite, [user_id, product_id], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, { message: "favorite added successfully" });
    }
  });
};
const getFavoritesServices = async (input, output) => {
  const userId = input.userId;
  const getUserProduct = `
    SELECT
    *
    FROM favorites f
    WHERE user_id = ?
    `;

  const [favoriteResult] = await db.promise().query(getUserProduct, [userId]);
  if (favoriteResult.length > 0) {
    const mainResult = await Promise.all(
      favoriteResult.map(async (list) => {
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
          .query(getProductsQuery, [list.product_id]);

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
            .query(getProductVariantsQuery, [list.product_id]);
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
            .query(getProductImagesQuery, [list.product_id, "product", "PRODUCT"]);

          productData.images =
            productImageQuery.length > 0 ? productImageQuery : [];

          return productData;
        } else {
          return null;
        }
      })
    );
    const finalResult = favoriteResult.map((list) => {
        const product = mainResult.find((f) => f && f.product_id === list.product_id);
        return product ? { ...list, ...product } : list;
      });
  
      return finalResult;
  } else {
    return [];
  }
};
const deleteUserFavoritesService = async (input, output) => {
  const userId = input.userId;
  const productId = input.productId;
  const deletefavorite = `DELETE FROM favorites WHERE user_id=? AND product_id=?`;
  db.query(deletefavorite, [userId, productId], (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    } else {
      output(null, { message: "Deleted favorite successfully" });
    }
  });
};

module.exports = {
  addFavoriteServieces,
  getFavoritesServices,
  deleteUserFavoritesService,
};
