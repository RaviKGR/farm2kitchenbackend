const { db } = require("../../confic/db");

const AddCartService = async (input) => {
  const { userId, variantId } = input;
  const counts = parseInt(input.counts);
  try {
    const getInventory = `SELECT * FROM inventory WHERE variant_id = ?`;
    const [inventoryResult] = await db
      .promise()
      .query(getInventory, [variantId]);
    if (inventoryResult.length > 0) {
      const inventoryStock = inventoryResult[0].quantity_in_stock;

      const checkQuery = `SELECT * FROM cart WHERE user_id = ? AND variant_id = ?`;
      const [checkResult] = await db
        .promise()
        .query(checkQuery, [userId, variantId]);
      const oldCount =
        checkResult.length > 0 ? checkResult[0].quantity_count : null;

      if (checkResult.length > 0) {
        if (inventoryStock >= oldCount) {
          const updateQuery = `UPDATE cart SET quantity_count = ? WHERE user_id = ? and variant_id = ?`;
          const [updateResult] = await db
            .promise()
            .query(updateQuery, [counts, userId, variantId]);
          if (updateResult.affectedRows > 0) {
            const deleteQuery = `DELETE FROM cart WHERE quantity_count = 0`;
            const [deletedResult] = await db.promise().query(deleteQuery);
            if (deletedResult.affectedRows > 0) {
              return {
                success: true,
                status: 200,
                message: "Product removed From cart",
              };
            } else {
              return { success: true, status: 200, message: "count added" };
            }
          } else {
            return {
              success: false,
              status: 400,
              message: "upable to add count",
            };
          }
        } else {
          return {
            success: false,
            status: 400,
            message: `we have only ${oldCount} quantity`,
          };
        }
      } else {
        if (inventoryStock >= 1 && counts !== 0) {
          const cartInsert = `INSERT INTO cart (user_id, variant_id, quantity_count) VALUES (?, ?, ?)`;
          const [insertResult] = await db
            .promise()
            .query(cartInsert, [userId, variantId, counts]);
          if (insertResult.affectedRows > 0) {
            return { success: true, status: 201, message: "Added in cart" };
          }
        } else {
          return { success: false, status: 400, message: "Out of stock" };
        }
      }
      return inventoryResult;
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 500, message: "Database error" };
  }
};
const getCartService = async () => {
  try {
    const getQuery = `
    SELECT
    c.*,
    p.product_id,
    p.name,
    pv.variant_id,
    pv.size,
    pv.type,
    pv.barcode,
    pi.*,
    i.inventory_id,
    i.price,
    i.discount_percentage
    FROM cart c
    JOIN productvariant pv ON pv.variant_id = c.variant_id
    JOIN product p ON p.product_id = pv.product_id
    JOIN productimage pi ON pi.image_id = pv.variant_id
    JOIN inventory i ON i.variant_id = pv.variant_id
    WHERE pi.is_primary = "Y" AND pi.image_tag IN ('variant', 'VARIANT')`;
    const [result] = await db.promise().query(getQuery);
    if (result.length > 0) {
      return result;
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 500, message: "Database error" };
  }
};

module.exports = { AddCartService, getCartService };
