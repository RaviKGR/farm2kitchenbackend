const { promisify } = require("util");
const { db } = require("../../confic/db");

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
  const { limit, offset, orderNumber, deliveryDate, phoneNumber, email, status} = input;
  try {

    let whereClause = ""
    const queryParams = [];
    const hasConditions = orderNumber || deliveryDate || phoneNumber || email || status

    if(hasConditions) {
      if(orderNumber) {
        whereClause += 'o.order_id LIKE ?';
        queryParams.push(`%${orderNumber}%`);
      }

      if(deliveryDate) {
        whereClause += (whereClause ? "AND " : "") + 'o.deliveryDate = ?';
        queryParams.push(deliveryDate)
      }

      if(phoneNumber) {
        whereClause += (whereClause ? "AND " : "") + 'u.phone_number LIKE ?';
        queryParams.push(`%${phoneNumber}%`)
      }

      if(email) {
        whereClause += (whereClause ? "AND " : "") + 'u.email LIKE ?';
        queryParams.push(`%${email}%`)
      }

      if(status) {
        whereClause += (whereClause ? "AND " : "") + 'o.order_status LIKE ?';
        queryParams.push(status)
      }
    }
    
    const selectQuery = `
        SELECT * 
        FROM orders o 
        JOIN orderitem oi ON oi.order_id = o.order_id 
        JOIN users u ON u.user_id = o.user_id
        ${hasConditions ? `WHERE ${whereClause}` : ""}
        LIMIT ? OFFSET ?
      `;
    
    queryParams.push(parseInt(limit), parseInt(offset));

    const [result] = await db
      .promise()
      .query(selectQuery, [...queryParams]);

    if (result.length > 0) {
      return result;
    } else {
      return { message: "No results found" };
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
        WHERE o.order_id = ?
      `;
    const [result] = await db
      .promise()
      .query(selectQuery, [orderId]);

    if (result.length > 0) {
      return result;
    } else {
      return { message: "No results found" };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Database error" };
  }
};

const updateOrderStatusService = async (input) => {  
    const {orderId, orderStatus} = input;
  try {
    const updateQuery = `UPDATE orders SET order_status = ? WHERE order_id = ?`;
    const [result] = await db
      .promise()
      .query(updateQuery, [orderStatus, orderId]);
console.log(result);

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

module.exports = { getOrderHistoryServieces, getAllOrderHistoryService, getAllOrderHistoryByIdService, updateOrderStatusService };
