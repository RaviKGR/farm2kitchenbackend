const { db } = require("../../confic/db");

const addNewProductSizeSerivce = async (productSize) => {
    try {
        const insertQuery = `INSERT INTO productsize (sizeName) VALUES (?)`;
        const [insert] = await db.promise().query(insertQuery, [productSize]);
        if (insert.affectedRows > 0) {
            return { success: true, message: "Product size added successfully" };
        } else {
            return { success: false, message: "Failed to add product size" };
        }
    } catch (e) {
        console.error(e);
        return { success: false, message: "Database error" };
    }
}

module.exports = {addNewProductSizeSerivce};