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

const getAllUserdetailsService = async (input, output) => {
  const { limit, offset, name, phoneNumber } = input;
  let whereClause = "";
  const queryParams = [];
  const hasConditions = name || phoneNumber;
  if (hasConditions) {
    if (name) {
      whereClause += "us.name LIKE ?";
      queryParams.push(`%${name}%`);
    }
    if (phoneNumber) {
      whereClause += (whereClause ? "And " : "") + "us.phone_number LIKE ?";
      queryParams.push(`%${phoneNumber}%`);
    }
  }
  const getuserIdquery = `
   SELECT
    COUNT(us.user_id) OVER() AS total_count,
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
  ${hasConditions ? `WHERE ${whereClause}` : ""}
  LIMIT ? OFFSET ?`;
  queryParams.push(parseInt(limit), parseInt(offset));
  db.query(getuserIdquery, [...queryParams], (err, result) => {
    if (err) {
      return output({ error: { Description: err.message } }, null);
    } else {
      return output(null, result);
    }
  });
};

const SearchUserDetailServices = async (userName) => {
  try {
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
    const [result] = await db.promise().query(getUserQuery, [`%${userName}%`]);
    if (result.length > 0) {
      const userId = result[0].user_id;
      const getUserAddress = `SELECT * FROM address WHERE user_id = ?`;
      const [address] = await db.promise().query(getUserAddress, [userId]);
      if (address.length > 0) {
        const UserDetails = result.map((user) => {
          const addresDetails = address.find(
            (add) => add.user_id === user.user_id
          );
          return {...user, address : [addresDetails]}
        });
        return UserDetails;
      } else {
        return [];
      }
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    return { success: false, status: 500, message: "DateBase error" };
  }
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
    isDefault,
  } = input;
  const insertQuery = `
    INSERT INTO users (name, email, phone_number) VALUES (?, ?, ?);
    SET @last_user_id = LAST_INSERT_ID();
    INSERT INTO address (user_id, street, city, state, postal_code, country, is_default) VALUES (@last_user_id, ?, ?, ?, ?, ?, ?);
    `;
  db.query(
    insertQuery,
    [
      userName,
      userEmail,
      phoneNumber,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault,
    ],
    (err, result) => {
      if (err) {
        output({ error: { Description: err.message } }, null);
      } else {
        output(null, { message: "User create Successfully" });
      }
    }
  );
};

const getUserService = async (input, output) => {
  const { limit, offset } = input;
  const getQuery = `
    SELECT
    COUNT(*) OVER() AS total_count,
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
  });
};

const addAddressByUserIdService = async () => {
    try {
      
    } catch (e) {
      console.error(e);
      return {success: false, status: 400}
    }
}

module.exports = {
  getUserDetailServieces,
  updateUserDetailServices,
  addNewUserByAdminService,
  getUserService,
  SearchUserDetailServices,
  getAllUserdetailsService,
  addAddressByUserIdService
};
