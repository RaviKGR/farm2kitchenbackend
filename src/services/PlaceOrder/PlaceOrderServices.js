const { db } = require("../../confic/db");


// const CreatePlaceOrder = async (input) => {
//   const { userId, totalAmount, products } = input;
//   const couponId = input.couponId || null;
//   const locationId = input.locationId || null;
//   try {
//     const checkQuantityPromises = products.map(async (list) => {
//       const checkInventory = `SELECT * FROM inventory WHERE variant_id = ? AND quantity_in_stock >= ?`;
//       const [inventoryRes] = await db
//         .promise()
//         .query(checkInventory, [list.variantId, list.quantity]);

//       return inventoryRes;
//     });

//     const inventoryResults = await Promise.all(checkQuantityPromises);

//     const outOfStockItems = inventoryResults.filter(
//       (result) => result.length === 0
//     );

//     if (outOfStockItems.length > 0) {
//       return {
//         success: false,
//         status: 400,
//         message: "Some products are out of stock.",
//       };
//     } else {
//       const insertOrder = `INSERT INTO orders (user_id, coupon_id, order_date, total_amount, order_status, location_id) VALUES (?, ?, CURRENT_DATE(), ?, "PLACED", ?)`;
//       const [createOrder] = await db
//         .promise()
//         .query(insertOrder, [userId, couponId, totalAmount, locationId]);

//       if (createOrder.affectedRows > 0) {
//         const lastInsertedId = createOrder.insertId;

//         const insertOrderItems = products.map(async (list) => {
//           const insertOrderItems = `INSERT INTO orderitem (order_id, variant_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)`;
//           const [inventoryRes] = await db
//             .promise()
//             .query(insertOrderItems, [
//               lastInsertedId,
//               list.variantId,
//               list.quantity,
//               list.purchasePrice,
//             ]);

//           return inventoryRes;
//         });

//         const results = await Promise.all(insertOrderItems);
//         if (results.length === 0) {
//           return {
//             success: false,
//             status: 500,
//             message: "failed to place order",
//           };
//         } else {
//           const DeleteCartEntries = products.map(async (list) => {
//             const removeCart = `DELETE FROM cart Where variant_id = ?`;
//             const [result] = await db
//               .promise()
//               .query(removeCart, [list.variantId]);
//             return result;
//           });

//           const removeResult = await Promise.all(DeleteCartEntries);
//           if (removeResult[0].affectedRows > 0) {
//             return {
//               success: true,
//               status: 201,
//               message: "Order placed successfully.",
//             };
//           }
//         }
//       }
//     }
//   } catch (e) {
//     console.error(e);
//     return { success: false, status: 500, message: "Database error" };
//   }
// };

const CreatePlaceOrder = async (input) => {
  const { userId, totalAmount, products } = input;
  const couponId = input.couponId || null;
  const locationId = input.locationId || null;

  const connection = db.promise();

  try {
    await connection.beginTransaction();

    const checkQuantityPromises = products.map(async (list) => {
      const checkInventory = `SELECT * FROM inventory WHERE variant_id = ? AND quantity_in_stock >= ?`;
      const [inventoryRes] = await connection.query(checkInventory, [
        list.variantId,
        list.quantity,
      ]);
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
    }

    const insertOrder = `INSERT INTO orders (user_id, coupon_id, order_date, total_amount, order_status, location_id) VALUES (?, ?, CURRENT_DATE(), ?, "PLACED", ?)`;
    const [createOrder] = await connection.query(insertOrder, [
      userId,
      couponId,
      totalAmount,
      locationId,
    ]);

    if (createOrder.affectedRows > 0) {
      const lastInsertedId = createOrder.insertId;

      const insertOrderItems = products.map(async (list) => {
        const insertOrderItem = `INSERT INTO orderitem (order_id, variant_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)`;
        await connection.query(insertOrderItem, [
          lastInsertedId,
          list.variantId,
          list.quantity,
          list.purchasePrice,
        ]);
      });

      await Promise.all(insertOrderItems);

      const reduceStockPromises = products.map(async (list) => {
        const reduceStockQuery = `UPDATE inventory SET quantity_in_stock = quantity_in_stock - ? WHERE variant_id = ?`;
        await connection.query(reduceStockQuery, [
          list.quantity,
          list.variantId,
        ]);
      });

      await Promise.all(reduceStockPromises);

      const DeleteCartEntries = products.map(async (list) => {
        const removeCart = `DELETE FROM cart WHERE variant_id = ?`;
        await connection.query(removeCart, [list.variantId]);
      });

      await Promise.all(DeleteCartEntries);

      await connection.commit();
      return {
        success: true,
        status: 201,
        message: "Order placed successfully.",
      };
    } else {
      await connection.rollback();
      return {
        success: false,
        status: 500,
        message: "Failed to place order.",
      };
    }
  } catch (e) {
    console.error(e);
    await connection.rollback();
    return { success: false, status: 500, message: "Database error" };
  }
};

module.exports = { CreatePlaceOrder };
