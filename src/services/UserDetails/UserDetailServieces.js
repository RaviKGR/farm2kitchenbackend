const { db } = require("../../confic/db");

const getUserDetailServieces = async (input, output) => {
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

const SearchUserDetailServices = (input) => {
  const userName = input.userName;

  const getUserQuery = `
  SELECT 
    u.user_id, 
    u.name, 
    u.email, 
    u.phone_number
  FROM 
    Users u 
  WHERE 
    u.name LIKE ?;
`;

  return new Promise((resolve, reject) => {
    // Ensure that the `userName` is correctly formatted for the LIKE clause
    // const searchValue = `%${userName}%`;

    db.query(getUserQuery, [`%${userName}%`], (err, result) => {
      if (err) {
        console.log("Error while fetching user details:", err);
        return reject({ Description: err.message });
      }
      if (result.length === 0) {
        console.log("No user found:", result);
        return reject({ error: { Description: 'No user found with the provided username' } });
      }
      console.log("User details found:", result);
      resolve(result);
    });
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
  const { limit, offset } = input;
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
  db.query(getQuery, [parseInt(limit), parseInt(offset)], (err, result) => {
    if (err) {
      output({ error: { Description: err.message } }, null);
    } else {
      output(null, result);
    }
  })
}

module.exports = {
  getUserDetailServieces,
  updateUserDetailServices,
  addNewUserByAdminService,
  getUserService,
  SearchUserDetailServices
};
