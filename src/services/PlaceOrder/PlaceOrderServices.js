const { db } = require("../../confic/db");

// const CreatePlaceOrder = async (input, output) => {
//     const { userId, totalAmount, AllProduct  } = input;
// try {
//     // const checkQuantity = AllProduct.map((list) => {
//     //     const checkInventory = `SELECT * FROM inventory WHERE variant_id = ? AND quantity_in_stock <= ?`;
//     //     const [inventoryRes] = db.promise().query(checkInventory, [list.variantId, list.quantity]);

//     // })
//     const checkQuantity = await Promise.all(
//         AllProduct.map(async (list) => {
//           const checkInventory = `SELECT * FROM inventory WHERE variant_id = ? AND quantity_in_stock >= ?`;
//           const [inventoryRes] = await db.promise().query(checkInventory, [list.variantId, list.quantity]);

//           // Check if the product is in stock
//           if (inventoryRes.length === 0) {
//             return {success: false, status: 400, message: "Out of Stock"}
//           }
//           return inventoryRes;
//         }))

// } catch (e) {
//     console.error(e);
//     return {success: false, status: 500, message: "DataBase error"}
// }

// };

const CreatePlaceOrder = async (input) => {
  const { userId, totalAmount, products, locationId } = input;
  const couponId = input.couponId || null;

  try {
    const checkQuantityPromises = products.map(async (list) => {
      const checkInventory = `SELECT * FROM inventory WHERE variant_id = ? AND quantity_in_stock >= ?`;
      const [inventoryRes] = await db
        .promise()
        .query(checkInventory, [list.variantId, list.quantity]);

      return inventoryRes;
    });

    const inventoryResults = await Promise.all(checkQuantityPromises);

    const outOfStockItems = inventoryResults.filter(
      (result) => result.length === 0
    );

    if (outOfStockItems.length > 0) {
      return {
        success: false,
        status: 400,
        message: "Some products are out of stock.",
      };
    } else {
      const insertOrder = `INSERT INTO orders (user_id, coupon_id, order_date, total_amount, order_status, location_id) VALUES (?, ?, CURRENT_DATE(), ?, "PLACED", ?)`;
      const [createOrder] = await db
        .promise()
        .query(insertOrder, [userId, couponId, totalAmount, locationId]);

      if (createOrder.affectedRows > 0) {
        const lastInsertedId = createOrder.insertId;

        const insertOrderItems = products.map(async (list) => {
          const insertOrderItems = `INSERT INTO orderitem (order_id, variant_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)`;
          const [inventoryRes] = await db
            .promise()
            .query(insertOrderItems, [
              lastInsertedId,
              list.variantId,
              list.quantity,
              list.purchasePrice,
            ]);

          return inventoryRes;
        });

        const results = await Promise.all(insertOrderItems);
        if (results.length === 0) {
          return {
            success: false,
            status: 500,
            message: "failed to place order",
          };
        } else {
          const DeleteCartEntries = products.map(async (list) => {
            const removeCart = `DELETE FROM cart Where variant_id = ?`;
            const [result] = await db
              .promise()
              .query(removeCart, [list.variantId]);
              return result;
          });

          const removeResult = await Promise.all(DeleteCartEntries);
          if(removeResult[0].affectedRows > 0) {
            return {
              success: true,
              status: 201,
              message: "Order placed successfully.",
            };
          }
          
        }
      }
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 500, message: "Database error" };
  }
};

module.exports = { CreatePlaceOrder };
