const { db } = require("../../confic/db");

const addNewProductSizeSerivce = async (productSize) => {
  try {
    const selectQuery = "SELECT * FROM productsize WHERE sizeName = ?";
    const productSizeType = productSize.toLowerCase();
    const [result] = await db.promise().query(selectQuery, [productSizeType]);

    if (result.length > 0) {
      return { message: "Product size already exists" };
    } else {
      const insertQuery = `INSERT INTO productsize (sizeName) VALUES (?)`;
      const [insert] = await db.promise().query(insertQuery, [productSizeType]);
      if (insert.affectedRows > 0) {
        return { success: true, message: "Product size added successfully" };
      } else {
        return { success: false, message: "Failed to add product size" };
      }
    }
  } catch (e) {
    console.error(e);
    return { success: false, message: "Database error" };
  }
};

const getAllProuctSizeService = async () => {
  try {
    const selectQuery = `SELECT * FROM productsize`;
    const [result] = await db.promise().query(selectQuery);
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

module.exports = { addNewProductSizeSerivce, getAllProuctSizeService };
