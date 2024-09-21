const { db } = require("../../confic/db");

const getUerDetailServieces = async (input, output) => {
    const userId = input.userId;
    const getuserIdquery = `SELECT user_id,name,email,phone_number FROM users `;
    db.query(getuserIdquery, [userId], (err, result) => {
        if (err) {
            return output({ error: { Description: err.message } }, null)
        }
        else {
            return output(null, result)
        }
    })
}
const { promisify } = require('util');

const updateUserDetailServices = async (input) => {
    const { name, password, userId } = input;
    const updateUserQuery = 'UPDATE users SET name = ?, password = ?, WHERE user_id = ?';

    try {
        // Promisify the db.query method
        const queryAsync = promisify(db.query).bind(db);
        const result = await queryAsync(updateUserQuery, [name, password, userId]);

        if (result.affectedRows === 0) {
            throw new Error('User not found or no changes made');
        }
    } catch (error) {
        console.error('Error in updateUserDetailServices:', error);
        throw {
            success: false,
            message: 'Failed to update user',
            error: error.message
        };
    }
};


module.exports = { getUerDetailServieces, updateUserDetailServices };