const { db } = require("../../confic/db");

const getUerDetailServieces = async (input, output) => {
  const userId = input.userId;
  const getuserIdquery = `SELECT user_id,name,email,phone_number FROM users `;
  db.query(getuserIdquery, [userId], (err, result) => {
    if (err) {
      return output({ error: { Description: err.message } }, null);
    } else {
      return output(null, result);
    }
  });
};
const { promisify } = require("util");

const updateUserDetailServices = async (input) => {
  const { name, password, userId } = input;
  const updateUserQuery =
    "UPDATE users SET name = ?, password = ?, WHERE user_id = ?";

  try {
    // Promisify the db.query method
    const queryAsync = promisify(db.query).bind(db);
    const result = await queryAsync(updateUserQuery, [name, password, userId]);

    if (result.affectedRows === 0) {
      throw new Error("User not found or no changes made");
    }
  } catch (error) {
    console.error("Error in updateUserDetailServices:", error);
    throw {
      success: false,
      message: "Failed to update user",
      error: error.message,
    };
  }
};

const addNewUserByAdminService = async (input, output) => {
  const {
    userName,
    userEmail,
    phoneNumber,
    street,
    city,
    state,
    postalCode,
    country,
    isDefault
  } = input;
  const insertQuery = `
    INSERT INTO users (name, email, phone_number) VALUES (?, ?, ?);
    SET @last_user_id = LAST_INSERT_ID();
    INSERT INTO address (user_id, street, city, state, postal_code, country, is_default) VALUES (@last_user_id, ?, ?, ?, ?, ?, ?);
    `;
  db.query(insertQuery, [userName, userEmail, phoneNumber, street, city, state, postalCode, country, isDefault], (err, result) => {
    if (err) {
      output({ error: { Description: err.message } }, null);
    } else {
      output(null, { message: "User create Successfully" });
    }
  });
};

const getUserService = async (input, output) => {
    const {limit, offset } = input;
    const getQuery = `
    SELECT
    us.user_id,
    us.name,
    us.email,
    us.phone_number,
    ad.address_id,
    ad.street,
    ad.city,
    ad.state,
    ad.postal_code,
    ad.country,
    ad.is_default
    FROM users us
    JOIN address ad
    ON ad.user_id = us.user_id
    LIMIT ? OFFSET ?;
    `; 
    db.query(getQuery, [parseInt(limit), parseInt(offset) ], (err, result) => {
        if (err) {
            output({ error: { Description: err.message } }, null);
          } else {
            output(null, result);
          }
    })
}

module.exports = {
  getUerDetailServieces,
  updateUserDetailServices,
  addNewUserByAdminService,
  getUserService
};
