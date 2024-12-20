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

const getCartService = async (userId, temp_UserId) => {
  try {
    const getCartQuery = `
      SELECT
        c.cart_id,
        c.quantity_count,
        c.variant_id,
        c.temp_user_id,
        p.product_id,
        p.name AS product_name,
        p.category_id,
        pv.size,
        pv.type,
        pv.barcode,
        pi.image_url AS product_image,
        i.price
      FROM cart c
      JOIN productvariant pv ON pv.variant_id = c.variant_id
      JOIN product p ON p.product_id = pv.product_id
      JOIN productimage pi ON pi.image_id = pv.variant_id
      JOIN inventory i ON i.variant_id = pv.variant_id
      WHERE pi.is_primary = "Y"
        AND pi.image_tag IN ('variant', 'VARIANT')
        AND c.temp_user_id = ?`;

    const [cartResult] = await db.promise().query(getCartQuery, [temp_UserId]);

    if (cartResult.length === 0) {
      return {
        items: [],
        total_Amount: "0.00",
      };
    }

    let totalAmount = 0;

    const itemsWithDiscount = await Promise.all(
      cartResult.map(async (item) => {
        const basePrice = parseFloat(item.price);
        const quantityCount = item.quantity_count;
        let discountAmount = 0;
        let finalPrice = basePrice;
        let discountType = null;
        let discountValue = null;
        let discountPercentage = null;
        let offerId = null;

        // Fetch offer details for the product's category
        const offerQuery = `
          SELECT 
            o.offer_id, 
            o.discountType, 
            o.discountValue, 
            o.start_date, 
            o.end_date, 
            o.deleted
          FROM Offer o
          JOIN Offer_Details od ON od.offer_id = o.offer_id
          WHERE od.tag_id = ?
            AND CURDATE() BETWEEN o.start_date AND o.end_date
            AND o.deleted = 0`;

        const [offerResults] = await db.promise().query(offerQuery, [item.category_id]);

        if (offerResults.length > 0) {
          const offer = offerResults[0];
          offerId = offer.offer_id;
          discountType = offer.discountType;
          discountValue = parseFloat(offer.discountValue);

          // Apply discount based on type
          if (discountType.toLowerCase() === "flat") {
            discountAmount = discountValue;
          } else if (discountType.toLowerCase() === "percentage") {
            discountPercentage = discountValue.toFixed(2);
            discountAmount = (basePrice * discountValue) / 100;
          }

          // Ensure discount doesn't exceed the base price
          discountAmount = Math.min(discountAmount, basePrice);
          finalPrice = basePrice - discountAmount;
        }

        // Update total amount (considering quantity)
        totalAmount += finalPrice * quantityCount;

        return {
          product_id: item.product_id,
          name: item.product_name,
          price: basePrice.toFixed(2),
          size: item.size,
          type: item.type,
          barcode: item.barcode,
          image_url: item.product_image,
          quantity_count: quantityCount,
          discount_percentage: discountPercentage || null,
          offer_id: offerId,
          discountType,
          discountValue: discountValue ? discountValue.toFixed(2) : null,
          discountAmount: discountAmount.toFixed(2),
          finalPrice: finalPrice.toFixed(2),
          temp_user_id:item.temp_user_id,
          variant_id : item.variant_id
        };
      })
    );

    return {
      items: itemsWithDiscount,
      total_Amount: totalAmount.toFixed(2),
    };
  } catch (error) {
    console.error(error);
    return { success: false, status: 500, message: "Database error" };
  }
};






module.exports = { AddCartService, getCartService };
