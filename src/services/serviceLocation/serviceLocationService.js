const { db } = require("../../confic/db");

const NewServieLocationService = async (input) => {
  console.log(input);

  try {
    const { city, postalCode, devileryDay, Notification } = input;

    const GetDates = () => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysUntilSat = (devileryDay === "SAT" ? 6 : 0 - dayOfWeek + 7) % 7;
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntilSat);
      const formattedDate = nextDate.toISOString().split("T")[0]; 

      return formattedDate;
    };

    const newWeekends = GetDates();

    const selectQuery = `SELECT * FROM servicelocation WHERE city = ? AND postal_code = ? AND devilery_date = ? AND Notification = ?`;
    const [result] = await db
      .promise()
      .query(selectQuery, [city, postalCode, newWeekends, Notification]);

    if (result.length > 0) {
      return { message: "service location already exists" };
    } else {
      const insertQuery = `INSERT INTO servicelocation (city, postal_code, devilery_date, Notification) VALUES (?, ?, ?, ?)`;
      const [insert] = await db
        .promise()
        .query(insertQuery, [city, postalCode, newWeekends, Notification]);

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
