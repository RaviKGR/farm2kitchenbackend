const { promisify } = require("util");
const { db } = require("../../confic/db");
const { formatDateToEnCA } = require("../../confic/dateAndTimeZone");

const getOrderHistoryServieces = async (input) => {
  const user_id = input.userId;

  if (!user_id) {
    throw new Error("User ID is required");
  }

  const OrderHistoryquery = `SELECT order_id, user_id, order_date, total_amount, order_status 
                               FROM orders 
                               WHERE user_id = ? 
                               ORDER BY order_date DESC`;

  try {
    const queryAsync = promisify(db.query).bind(db);
    const result = await queryAsync(OrderHistoryquery, [user_id]);

    if (result.length === 0) {
      throw new Error("No order history found for this user");
    }
    return result;
  } catch (error) {
    console.error("Error in getOrderHistoryServieces:", { user_id, error });
    throw new Error("Failed to retrieve user order history");
  }
};

const getAllOrderHistoryService = async (input) => {
  const {
    limit,
    offset,
    orderNumber,
    deliveryDate,
    phoneNumber,
    email,
    status,
  } = input;
  try {
    let whereClause = "";
    const queryParams = [];
    const hasConditions =
      orderNumber || deliveryDate || phoneNumber || email || status;

    if (hasConditions) {
      if (orderNumber) {
        whereClause += "o.order_id LIKE ?";
        queryParams.push(`%${orderNumber}%`);
      }

      if (deliveryDate) {
        whereClause += (whereClause ? "AND " : "") + "o.delivery_date = ?";
        queryParams.push(deliveryDate);
      }

      if (phoneNumber) {
        whereClause += (whereClause ? "AND " : "") + "u.phone_number LIKE ?";
        queryParams.push(`%${phoneNumber}%`);
      }

      if (email) {
        whereClause += (whereClause ? "AND " : "") + "u.email LIKE ?";
        queryParams.push(`%${email}%`);
      }

      if (status) {
        whereClause += (whereClause ? "AND " : "") + "o.order_status = ?";
        queryParams.push(status);
      }
    }

    const selectQuery = `
        SELECT
          COUNT(o.order_id) OVER() AS total_count,
          o.*, 
          u.*,
          sl.*
        FROM orders o 
        JOIN users u ON u.user_id = o.user_id
        JOIN servicelocation sl ON sl.location_id = o.location_id
        ${hasConditions ? `WHERE ${whereClause}` : ""}
        ORDER BY o.order_date DESC
        LIMIT ? OFFSET ?
      `;

    queryParams.push(parseInt(limit), parseInt(offset));

    const [result] = await db.promise().query(selectQuery, [...queryParams]);

    if (result.length > 0) {
      const formatedResult = result.map((item) => ({
        ...item,
        order_date: formatDateToEnCA(item.order_date),
        delivery_date: formatDateToEnCA(item.delivery_date)
      }))
      return formatedResult;
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Database error" };
  }
};

const getAllOrderHistoryByIdService = async (orderId) => {
  try {
    const selectQuery = `
        SELECT * 
        FROM orders o 
        JOIN orderitem oi ON oi.order_id = o.order_id 
        JOIN users u ON u.user_id = o.user_id 
        WHERE o.order_id = ?
      `;
    const [result] = await db.promise().query(selectQuery, [orderId]);

    if (result.length > 0) {
      const formatedResult = result.map((item) => ({
        ...item,
        order_date: formatDateToEnCA(item.order_date)
      }))
      return formatedResult;
      
    } else {
      return { message: "No results found" };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Database error" };
  }
};

const updateOrderStatusService = async (input) => {
  const { orderId, orderStatus } = input;
  try {
    const updateQuery = `UPDATE orders SET order_status = ? WHERE order_id = ?`;
    const [result] = await db
      .promise()
      .query(updateQuery, [orderStatus, orderId]);

    if (result.affectedRows > 0) {
      return { message: "Order status updated successfully" };
    } else {
      return { message: "No results found" };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Database error" };
  }
};

const getOrderItemsByOrderIdService = async (orderId) => {
  try {
    const selectQuery = `
    SELECT
      COUNT(pv.variant_id) OVER() AS total_count,
      oi.*,
      p.name AS productName,
      p.brand AS productBrand,
      pv.product_id,
      pv.description,
      pv.size,
      pv.type,
      pv.barcode
    FROM orderitem oi
    JOIN productvariant pv ON pv.variant_id = oi.variant_id
    JOIN product p ON p.product_id = pv.product_id
    WHERE oi.order_id = ?;
    `;

    const [result] = await db.promise().query(selectQuery, [orderId]);
    if (result.length > 0) {
      return result;
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return { success: false, message: "Database error" };
  }
};

// const getOrderHistomerByUserIdService = async (input) => {
//   const { userId } = input
//   try {
//     const getQuery =`
//     SELECT
//       COUNT(pv.variant_id) OVER() AS total_count,
//       oi.*,
//       o.*,
//       p.name AS productName,
//       p.brand AS productBrand,
//       pv.product_id,
//       pv.description,
//       pv.size,
//       pv.type,
//       pv.barcode,
//       pi.*,
//       sl.*
//     FROM orderitem oi
//     JOIN orders o ON o.order_id = oi.order_id
//     JOIN productvariant pv ON pv.variant_id = oi.variant_id
//     JOIN product p ON p.product_id = pv.product_id
//     LEFT JOIN productimage pi ON pi.image_id = pv.variant_id
//     JOIN servicelocation sl ON sl.location_id = o.location_id
//     WHERE o.user_id = ? AND pi.is_primary = "Y" AND pi.image_tag IN ("variant", "VARIANT");
//     `
//     const [result] = await db.promise().query(getQuery, [userId]);
//     if(result.length > 0) {
//       return result
//     } else {
//       return []
//     }
//   } catch (e) {
//     console.error(e);
//     return {success: false, status: 400, message: "database error"}
//   }
// }
const getOrderHistomerByUserIdService = async (input) => {
  const { userId } = input;
  try {
    const getQuery = `
    SELECT
      COUNT(o.order_id) OVER() AS total_count,
      o.*,
      sl.city AS servicelocation_city,
      sl.postal_code AS servicelocation_postal_code,
      sl.delivery_date AS servicelocation_delivery_date,
      ad.street AS user_street,
      ad.city AS user_city,
      ad.state AS user_state,
      ad.postal_code AS user_postal_code,
      ad.country AS user_country
    FROM  orders o
    JOIN servicelocation sl ON sl.location_id = o.location_id
    JOIN address ad ON o.user_id = ad.user_id
    WHERE o.user_id = ? AND ad.is_default = true;
    `;
    const [orderResult] = await db.promise().query(getQuery, [userId]);
    if (orderResult.length > 0) {
      const orderItemsResult = await Promise.all(
        orderResult.map(async (list) => {
          const getOrderItems = ` 
            SELECT
              oi.*,
              p.name AS productName,
              p.brand AS productBrand,
              pv.product_id,
              pv.description,
              pv.size,
              pv.type,
              pv.barcode,
              pi.*
            FROM orderitem oi
            JOIN productvariant pv ON pv.variant_id = oi.variant_id
            JOIN product p ON p.product_id = pv.product_id
            LEFT JOIN productimage pi ON pi.image_id = pv.variant_id
            WHERE oi.order_id = ? AND pi.is_primary = "Y" AND pi.image_tag IN ("variant", "VARIANT");`;
          const [orderItem] = await db
            .promise()
            .query(getOrderItems, [list.order_id]);
          if (orderItem.length > 0) {
            return {
              ...list,
              order_date: formatDateToEnCA(list.order_date),
              servicelocation_delivery_date: formatDateToEnCA(list.servicelocation_delivery_date),
              orderItems: orderItem,
            };
          }
        })
      );
      return orderItemsResult;
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 400, message: "database error" };
  }
};

module.exports = {
  getOrderHistoryServieces,
  getAllOrderHistoryService,
  getAllOrderHistoryByIdService,
  updateOrderStatusService,
  getOrderItemsByOrderIdService,
  getOrderHistomerByUserIdService,
};
