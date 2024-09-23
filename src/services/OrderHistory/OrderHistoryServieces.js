const { db } = require("../../confic/db");
const { promisify } = require('util');

const getOrderHistoryServieces = async (input) => {
    const user_id = input.userId;

    if (!user_id) {
        throw new Error('User ID is required');
    }

    const OrderHistoryquery = `SELECT order_id, user_id, order_date, total_amount, order_status 
                               FROM orders 
                               WHERE user_id = ? 
                               ORDER BY order_date DESC`;

    try {
        const queryAsync = promisify(db.query).bind(db);
        const result = await queryAsync(OrderHistoryquery, [user_id]);

        if (result.length === 0) {
            throw new Error('No order history found for this user');
        }
        return result;
    } catch (error) {
        console.error('Error in getOrderHistoryServieces:', { user_id, error });
        throw new Error('Failed to retrieve user order history');
    }
};

module.exports = getOrderHistoryServieces;