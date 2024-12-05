const { db } = require("../../confic/db");

const getUserDetailServieces = async (input, output) => {
  const userId = input.userId;
  const getuserIdquery = `SELECT user_id, name, email, phone_number FROM users WHERE user_id = ?`;
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

const updateAllUserInfoService = async (input) => {
  const { Name, phoneNumber, email, city, userId, addressId } = input;
  try {
    let setClause = "name = ?, phone_number = ?";
    const queryParams = [Name, phoneNumber];

    if (email) {
      setClause += ", email = ?";
      queryParams.push(email);
    }

    queryParams.push(userId);

    const updateQuery = `UPDATE users SET ${setClause} WHERE user_id = ?`;
    const [result] = await db.promise().query(updateQuery, queryParams);
    if (result.affectedRows > 0) {
      // const updateCity = `UPDATE address SET city = ? WHERE address_id = ?`;
      // const [updateResult] = await db.promise().query(updateCity, [city, addressId]);
      // if(updateResult.affectedRows > 0) {
      //   return {success: true, status: 200, message: "Updated successfully"}
      // } else {
      //   return {success: false, status: 400, message: "unable to update"}
      // }

      return { success: true, status: 200, message: "Updated successfully" };
    } else {
      return { success: false, status: 400, message: "unable to update" };
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 400, message: "Database error" };
  }
};

const updateUserAddressDefaultService = async (input) => {
  const { userId, addressId, isDefault } = input;
  try {
    if (isDefault) {
      const updateResult = `UPDATE address SET is_default = true WHERE address_id = ? AND user_id = ?`;
      const [result] = await db
        .promise()
        .query(updateResult, [addressId, userId]);
        console.log(result);
        
        if(result.affectedRows > 0) {          
          const updateAddress = `UPDATE address SET is_default = false WHERE address_id != ? AND user_id = ?`;
          const[finalResult] = await db.promise().query(updateAddress, [addressId, userId]);
          return {success: true, status: 200, message: "updated successfully"}
        }
    } else {
      return {success: false, status: 400, message: "Atleast one address should be enable"}
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 400, message: "Database error" };
  }
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
      const AddressResult = await Promise.all(
        result.map(async (userList) => {
          const getUserAddress = `SELECT * FROM address WHERE user_id = ?`;
          const [address] = await db
            .promise()
            .query(getUserAddress, [userList.user_id]);
          return {
            ...userList,
            address: address.length > 0 ? address : null,
          };
        })
      );
      return AddressResult;
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
    state,
    city,
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
    [userName, userEmail, phoneNumber, street, city, state, postalCode, country, isDefault],
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

// const addAddressByUserIdService = async (input) => {
//   const { userId, street, city, state, postalCode, country, isDefault } = input;
//   try {
//     await db.beginTransaction();
//     const updateQuery = `UPDATE address set is_default = false WHERE user_id = ?`;
//     await db.promise().query(updateQuery, [userId]);

//     const insertQuery = `INSERT INTO address (user_id, street, city, state, postal_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?);`;
//     const [result] = await db
//       .promise()
//       .query(insertQuery, [
//         userId,
//         street,
//         city,
//         state,
//         postalCode,
//         country,
//         isDefault,
//       ]);
//     if (result.affectedRows > 0) {
//       await db.commit();
//       return { success: true, status: 201, message: "Added successfully" };
//     } else {
//       await db.rollback();
//       return {
//         success: false,
//         status: 400,
//         message: "Unable to added address",
//       };
//     }
//   } catch (e) {
//     await db.rollback();
//     console.error(e);
//     return { success: false, status: 400, message: "Database error" };
//   }
// };

const addAddressByUserIdService = (input) => {
  const { userId, street, city, state, postalCode, country, isDefault } = input;

  return new Promise((resolve, reject) => {
    // Start transaction
    db.beginTransaction((err) => {
      if (err) {
        return reject({
          success: false,
          status: 400,
          message: "Transaction start error",
        });
      }

      // Step 1: Update existing addresses to set is_default = false
      const updateQuery = `UPDATE address SET is_default = false WHERE user_id = ?`;
      db.query(updateQuery, [userId], (err, result) => {
        if (err) {
          return db.rollback(() => {
            reject({
              success: false,
              status: 400,
              message: "Unable to update address",
            });
          });
        }

        // Step 2: Insert new address
        const insertQuery = `INSERT INTO address (user_id, street, city, state, postal_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.query(
          insertQuery,
          [userId, street, city, state, postalCode, country, isDefault],
          (err, result) => {
            if (err) {
              return db.rollback(() => {
                reject({
                  success: false,
                  status: 400,
                  message: "Unable to add address",
                });
              });
            }

            // Step 3: Commit transaction if address was successfully added
            if (result.affectedRows > 0) {
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    reject({
                      success: false,
                      status: 400,
                      message: "Commit error",
                    });
                  });
                }
                resolve({
                  success: true,
                  status: 201,
                  message: "Address added successfully",
                });
              });
            } else {
              db.rollback(() => {
                reject({
                  success: false,
                  status: 400,
                  message: "No rows affected",
                });
              });
            }
          }
        );
      });
    });
  });
};

const getCustomerAddressByIdService = async (userId) => {
  try {
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
        WHERE ad.user_id = ?
        `;

    const [result] = await db.promise().query(getQuery, [userId]);
    if (result.length > 0) {
      return result;
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 400, message: "Database error" };
  }
};

module.exports = {
  getUserDetailServieces,
  updateUserDetailServices,
  addNewUserByAdminService,
  getUserService,
  SearchUserDetailServices,
  getAllUserdetailsService,
  addAddressByUserIdService,
  getCustomerAddressByIdService,
  updateAllUserInfoService,
  updateUserAddressDefaultService,
};
