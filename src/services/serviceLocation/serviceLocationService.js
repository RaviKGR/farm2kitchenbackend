const { db } = require("../../confic/db");

const NewServieLocationService = async (input) => {
  console.log(input);
  
  try {
    const { city, postalCode, devileryDay, Notification } = input;
    const selectQuery = `SELECT * FROM servicelocation WHERE city = ? AND postal_code = ? AND devilery_day = ? AND Notification = ?`;
    const [result] = await db
      .promise()
      .query(selectQuery, [city, postalCode, devileryDay, Notification]);

    if (result.length > 0) {
      return { message: "service location already exists" };
    } else {
      const insertQuery = `INSERT INTO servicelocation (city, postal_code, devilery_day, Notification) VALUES (?, ?, ?, ?)`;
      const [insert] = await db
        .promise()
        .query(insertQuery, [city, postalCode, devileryDay, Notification]);

      if (insert.affectedRows > 0) {
        return {
          success: true,
          message: "Added successfully!",
        };
      } else {
        return { success: false, message: "Failed to add service location" };
      }
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Database error" };
  }
};

const getServiceLocationService = async () => {
  try {
    const selectQuery = `SELECT * FROM servicelocation`;
    const [result] = await db.promise().query(selectQuery);
    if (result.length > 0) {
      return result;
    } else {
      return { message: "Result is not found" };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Database error" };
  }
};

module.exports = { NewServieLocationService, getServiceLocationService };
