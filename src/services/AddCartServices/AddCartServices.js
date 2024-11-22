const { db } = require("../../confic/db");

// const AddCartService = async (input) => {
//   const { userId, variantId } = input;
//   const counts = parseInt(input.counts);

//   try {
//     const getInventory = `SELECT * FROM inventory WHERE variant_id = ?`;
//     const [inventoryResult] = await db.promise().query(getInventory, [variantId]);

//     if (inventoryResult.length > 0) {
//       const inventoryStock = inventoryResult[0].quantity_in_stock;

//       const checkQuery = `SELECT * FROM cart WHERE user_id = ? AND variant_id = ?`;
//       const [checkResult] = await db.promise().query(checkQuery, [userId, variantId]);
//       const oldCount = checkResult.length > 0 ? checkResult[0].quantity_count : 0;
//       const newCount = oldCount + counts;

//       if (newCount < 0) {
//         return {
//           success: false,
//           status: 400,
//           message: "Quantity cannot be negative",
//         };
//       }

//       if (checkResult.length > 0) {
//         if (inventoryStock >= newCount) {
//           const updateQuery = `UPDATE cart SET quantity_count = ? WHERE user_id = ? AND variant_id = ?`;
//           const [updateResult] = await db.promise().query(updateQuery, [newCount, userId, variantId]);

//           if (updateResult.affectedRows > 0) {
//             if (newCount === 0) {
//               const deleteQuery = `DELETE FROM cart WHERE quantity_count = 0`;
//               await db.promise().query(deleteQuery);
//               return {
//                 success: true,
//                 status: 200,
//                 message: "Product removed from cart",
//               };
//             } else {
//               return { success: true, status: 200, message: "Count updated" };
//             }
//           } else {
//             return {
//               success: false,
//               status: 400,
//               message: "Unable to update count",
//             };
//           }
//         } else {
//           return {
//             success: false,
//             status: 400,
//             message: `We have only ${inventoryStock} quantity in stock`,
//           };
//         }
//       } else {
//         // Insert new item into the cart if counts is non-zero and within inventory limits
//         if (inventoryStock >= counts && counts !== 0) {
//           const cartInsert = `INSERT INTO cart (user_id, variant_id, quantity_count) VALUES (?, ?, ?)`;
//           const [insertResult] = await db.promise().query(cartInsert, [userId, variantId, counts]);

//           if (insertResult.affectedRows > 0) {
//             return { success: true, status: 201, message: "Added to cart" };
//           }
//         } else {
//           return { success: false, status: 400, message: "Out of stock" };
//         }
//       }
//     } else {
//       return { success: false, status: 404, message: "Variant not found" };
//     }
//   } catch (e) {
//     console.error(e);
//     return { success: false, status: 500, message: "Database error" };
//   }
// };

const AddCartService = async (input) => {
  const { userId, variantId, temp_UserId } = input;
  const counts = parseInt(input.counts);
  try {
    const getInventory = `SELECT * FROM inventory WHERE variant_id = ?`;
    const [inventoryResult] = await db
      .promise()
      .query(getInventory, [variantId]);

    if (inventoryResult.length > 0) {
      const inventoryStock = inventoryResult[0].quantity_in_stock;

      const checkQuery = `SELECT * FROM cart WHERE temp_user_id = ? AND variant_id = ?`;
      const [checkResult] = await db
        .promise()
        .query(checkQuery, [temp_UserId, variantId]);
      const oldCount =
        checkResult.length > 0 ? checkResult[0].quantity_count : 0;
      const newCount = oldCount + counts;

      if (newCount < 0) {
        return {
          success: false,
          status: 400,
          message: "Quantity cannot be negative",
        };
      }

      if (checkResult.length > 0) {
        if (inventoryStock >= newCount) {
          const updateQuery = `UPDATE cart SET quantity_count = ? WHERE temp_user_id = ? AND variant_id = ?`;
          const [updateResult] = await db
            .promise()
            .query(updateQuery, [newCount, temp_UserId, variantId]);

          if (updateResult.affectedRows > 0) {
            if (newCount === 0) {
              const deleteQuery = `DELETE FROM cart WHERE quantity_count = 0`;
              await db.promise().query(deleteQuery);
              return {
                success: true,
                status: 200,
                message: "Product removed from cart",
              };
            } else {
              return { success: true, status: 200, message: "Count updated" };
            }
          } else {
            return {
              success: false,
              status: 400,
              message: "Unable to update count",
            };
          }
        } else {
          return {
            success: false,
            status: 400,
            message: `We have only ${inventoryStock} quantity in stock`,
            quantity: inventoryStock,
          };
        }
      } else {
        if (temp_UserId === "null") {
          if (inventoryStock >= counts && counts !== 0) {
            const generateUniqueCartId = async () => {
              let uniqueCartId;
              let isUnique = false;

              while (!isUnique) {
                uniqueCartId = Math.floor(1000 + Math.random() * 9000);
                const [existingIdResult] = await db
                  .promise()
                  .query(
                    `SELECT COUNT(*) AS count FROM cart WHERE temp_user_id = ?`,
                    [uniqueCartId]
                  );
                isUnique = existingIdResult[0].count === 0;
              }

              return uniqueCartId;
            };

            const uniqueCartId = await generateUniqueCartId();

            const cartInsert = `INSERT INTO cart (variant_id, quantity_count, temp_user_id) VALUES (?, ?, ?)`;
            const [insertResult] = await db
              .promise()
              .query(cartInsert, [variantId, counts, uniqueCartId]);

            if (insertResult.affectedRows > 0) {
              const last_insert_id = insertResult.insertId;
              const getLastInsertData = `SELECT * FROM cart WHERE cart_id = ?`;
              const [lastResult] = await db
                .promise()
                .query(getLastInsertData, [last_insert_id]);
              if (lastResult.length > 0) {
                return {
                  success: true,
                  status: 201,
                  message: "Added to cart",
                  result: lastResult,
                };
              }
            }
          } else {
            return { success: false, status: 400, message: "Out of stock" };
          }
        } else {
          if (inventoryStock >= counts && counts !== 0) {
            const cartInsert = `INSERT INTO cart (variant_id, quantity_count, temp_user_id) VALUES (?, ?, ?)`;
            const [insertResult] = await db
              .promise()
              .query(cartInsert, [variantId, counts, temp_UserId]);

            if (insertResult.affectedRows > 0) {
              return {
                success: true,
                status: 201,
                message: "Added to cart",
              };
            }
          } else {
            return { success: false, status: 400, message: "Out of stock" };
          }
        }
      }
    } else {
      return { success: false, status: 404, message: "Variant not found" };
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 500, message: "Database error" };
  }
};

const getCartService = async (userId, tepm_UserId) => {
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
    WHERE pi.is_primary = "Y" AND pi.image_tag IN ('variant', 'VARIANT') AND c.temp_user_id = ?`;
    const [result] = await db.promise().query(getQuery, [tepm_UserId]);
    if (result.length > 0) {
      const cartFinalResult = result.reduce((acc, cart) => {
        return acc + cart.quantity_count * parseFloat(cart.price);
      }, 0);
      return {
        items: result,
        total_Amount: cartFinalResult,
      };
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 500, message: "Database error" };
  }
};

module.exports = { AddCartService, getCartService };
