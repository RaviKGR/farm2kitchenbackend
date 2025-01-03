const { formatDateToEnCA } = require("../../confic/dateAndTimeZone");
const { db } = require("../../confic/db");

const NewServieLocationService = async (input) => {
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

    const selectQuery = `SELECT * FROM servicelocation WHERE city = ? AND postal_code = ? AND delivery_date = ? AND Notification = ?`;
    const [result] = await db
      .promise()
      .query(selectQuery, [city, postalCode, newWeekends, Notification]);

    if (result.length > 0) {
      return { message: "service location already exists" };
    } else {
      const insertQuery = `INSERT INTO servicelocation (city, postal_code, delivery_date, Notification) VALUES (?, ?, ?, ?)`;
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
    const selectQuery = `SELECT * FROM servicelocation WHERE delivery_date > CURRENT_DATE`;
    const [result] = await db.promise().query(selectQuery);
    if (result.length > 0) {
      const formatedResult = result.map((item) => ({
        ...item,
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

const getDeliveryDateService = async (addressId) => {
  try {
    const getAddress = `SELECT * FROM address WHERE address_id = ?`;
    const [addressResult] = await db.promise().query(getAddress, [addressId]);
    if (addressResult.length > 0) {
      const postalCode = addressResult[0].postal_code;
      const getServiceLocation = `SELECT location_id, city, postal_code, delivery_date FROM servicelocation WHERE postal_code = ? AND delivery_date > CURRENT_DATE`;
      const [locationAddress] = await db
        .promise()
        .query(getServiceLocation, [postalCode]);
      if (locationAddress.length > 0) {
        const formatedResult = locationAddress.map((item) => ({
          ...item,
          delivery_date: formatDateToEnCA(item.delivery_date)
        }))
        return formatedResult;
      } else {
        return [];
      }
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return { success: false, message: "Database error" };
  }
};

const UpdateDeliveryServiceLocation = async (input) => {
  try {
    const { location_id, city, postal_code, delivery_date, Notification } =
      input;
    const updateQuery = `UPDATE servicelocation SET city = ?, postal_code = ?, delivery_date = ?, Notification = ? WHERE location_id = ?`;
    const [update] = await db
      .promise()
      .query(updateQuery, [
        city,
        postal_code,
        delivery_date,
        Notification,
        location_id,
      ]);
    if (update.affectedRows !== 0) {
      return {
        status: 200,
        success: true,
        message: "Updated successfully",
      };
    } else {
      return {
        status: 500,
        success: false,
        message: "Internal server error",
      };
    }
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      success: false,
      message: "Internal server error",
    };
  }
};

module.exports = {
  NewServieLocationService,
  getServiceLocationService,
  getDeliveryDateService,
  UpdateDeliveryServiceLocation,
};
