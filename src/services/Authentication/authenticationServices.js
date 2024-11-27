const { db } = require("../../confic/db");
const bcrypt = require("bcrypt");
const { GENERATE_TOKEN } = require("../../confic/JWT");

const authentiCationService = async (input, output) => {
  const { emailId, hashedPassword: password, mobilenumber, code: otp } = input;
  const authenticationQuery = `
        INSERT INTO users_credentials (email, password_hash, phone_number) VALUES (?, ?, ?);
        SET @last_user_id = LAST_INSERT_ID();
        INSERT INTO otps (user_id, otp_code, expires_at) 
        VALUES (@last_user_id, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE));
        SELECT * FROM users_credentials WHERE user_id = @last_user_id;
    `;
  db.query(
    authenticationQuery,
    [emailId, password, mobilenumber, otp],
    async (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
        console.log(err);
      } else {
        const saltRounds = 10;
        const user = result[3][0].user_id;
        const verifycode = await bcrypt.hash(otp.toString(), saltRounds);
        const token = await GENERATE_TOKEN(otp, "1h");
        const data = { user, verifycode, token };
        const insertToken = `INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE));`;
        db.query(insertToken, [user.user_id, token], (err, results) => {
          if (err) {
            console.error("Database query error:", err);
            return output({ error: { description: err.message } }, null);
          }
          next();
        });
        console.log(data);

        output(null, data);
      }
    }
  );
};

const otpVerificationServieces = async (input, output) => {
  const verifiCationOtp = input.verificationotp;
  const userIdverificationotp = input.userIdverificationotp;
  const otpverificationquery = `SELECT * FROM otps WHERE user_id = ? AND otp_code = ?`;
  db.query(
    otpverificationquery,
    [userIdverificationotp, verifiCationOtp],
    (err, result) => {
      if (err) {
        output({ error: { description: err.message } }, null);
        console.log(err);
      } else {
        if (result.length > 0) {
          output(null, result);
        } else {
          output(null, { result: false });
          console.log(result);
        }
      }
    }
  );
};

const processLoginServieces = async (input) => {
  try {
    const { UserPassword, mobileOrEmail } = input;

    // Query to fetch user details by email or phone number
    const getLoginUserQuery = `SELECT * FROM users_credentials WHERE email = ? OR phone_number = ?`;
    const [loginResult] = await db
      .promise()
      .query(getLoginUserQuery, [mobileOrEmail, mobileOrEmail]);

    // Check if user exists
    if (loginResult.length === 0) {
      return { success: false, status: 404, message: "User not found" };
    }

    // Verify the password
    const Password = loginResult[0].password_hash;
    const isPasswordValid = await bcrypt.compare(UserPassword, Password);
    if (!isPasswordValid) {
      return { success: false, status: 400, message: "Incorrect password" };
    }

    const userDeatils = {
      name: loginResult[0].username,
      email: loginResult[0].email,
      phone_number: loginResult[0].phone_number,
    };

    const userToken = await GENERATE_TOKEN(userDeatils, "120m");

    const insertTokenQuery = `INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))`;
    const [tokenInsert] = await db
      .promise()
      .query(insertTokenQuery, [loginResult[0].user_id, userToken]);

    if (tokenInsert.affectedRows > 0) {
      const lastTokenId = tokenInsert.insertId;

      const getTokenQuery = `SELECT * FROM tokens WHERE token_id = ?`;
      const [getTokens] = await db
        .promise()
        .query(getTokenQuery, [lastTokenId]);

      if (getTokens.length > 0) {
        const getLoginUserQuery = `SELECT * FROM users WHERE email = ? OR phone_number = ?`;
        const [UserResult] = await db
          .promise()
          .query(getLoginUserQuery, [mobileOrEmail, mobileOrEmail]);

        return {
          success: true,
          status: 200,
          message: "Login successful",
          tokenDetails: getTokens[0],
          userDetails: UserResult,
        };
      } else {
        return {
          success: false,
          status: 500,
          message: "Failed to retrieve the token after creation",
        };
      }
    } else {
      return {
        success: false,
        status: 500,
        message: "Token creation failed",
      };
    }
  } catch (error) {
    console.error("Error in processLoginServices:", error);
    return { success: false, status: 500, message: "Internal server error" };
  }
};

// const processLoginServieces = async (input, output) => {
//   const userEmail = input.UserMailId;
//   const userPassword = input.UserPassword;
//   const getLoginUserQuery = `SELECT * FROM users WHERE email = ? OR phone_number = ?`;

//   db.query(getLoginUserQuery, [userEmail], async (err, results) => {
//     if (err) {
//       console.error("Database query error:", err);
//       return output({ error: { description: err.message } }, null);
//     }
//     if (results.length === 0) {
//       return output({ error: { message: "Email not found password." } }, null);
//     }
//     const user = results[0];
//     const isPasswordValid = await bcrypt.compare(userPassword, user.password);
//     if (!isPasswordValid) {
//       return output({ error: { description: "Incorrect password." } }, null);
//     }
//     const { password, ...userWithoutPassword } = user;
//     const token = await GENERATE_TOKEN(user.user_id, "1h");
//     console.log(user.user_id, token);
//     const insertToken = `INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE));`;
//     db.query(insertToken, [user.user_id, token], (err, results) => {
//       if (err) {
//         console.error("Database query error:", err);
//         return output({ error: { description: err.message } }, null);
//       }
//       next();
//     });
//     return output(null, { ...userWithoutPassword, token });
//   });
// };

const geustSignServices = (input, output) => {
  const { email, mobilenumber, code: otp } = input;
  const checkUserQuery = `SELECT * FROM users WHERE email = ? OR phone_number = ?`;
  db.query(checkUserQuery, [email, mobilenumber], async (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
      return;
    }
    if (result.length > 0) {
      console.log(result);

      const saltRounds = 10;
      const userId = result[0].user_id;
      const token = await bcrypt.hash(otp.toString(), saltRounds);
      const data = {
        success: true,
        userId,
        description: "User Already Exsist",
      };
      output(null, { ...data });
    } else {
      const geustSignQuery = `
                        INSERT INTO users (email, phone_number) VALUES (?, ?);
                        SET @last_user_id = LAST_INSERT_ID();
                        SELECT * FROM users WHERE user_id = @last_user_id;`;
      db.query(geustSignQuery, [email, mobilenumber], async (err, result) => {
        if (err) {
          output({ error: { description: err.message } }, null);
          console.log(err);
        } else {
          const saltRounds = 10;
          const userId = result[2][0].user_id;
          const token = await bcrypt.hash(otp.toString(), saltRounds);
          const data = {
            success: true,
            userId,
            description: "User created successfully",
          };
          output(null, data);
        }
      });
    }
  });
};

const googleAuthentiCationServices = async (input, output) => {
  try {
    const { Email } = input;
    const checkUserQuery = `SELECT * FROM users WHERE email = ?`;
    const [getUserResult] = await db.promise().query(checkUserQuery, [Email]);
    if (getUserResult.length > 0) {
      const userId = getUserResult[0].user_id;
      return { success: true, status: 200, result: getUserResult };
    } else {
      const InsertQuery = `INSERT INTO users (email) VALUES (?)`;
      const [result] = await db.promise().query(InsertQuery, [Email]);
      if (result.affectedRows > 0) {
        const details = {
          user_id: result.insertId,
        };
        return { success: true, status: 201, result: details };
      }
    }
  } catch (error) {
    console.error(error);
    return { success: false, status: 400, message: "user already exits" };
  }

  db.query(checkUserQuery, [Email], async (err, result) => {
    if (err) {
      output({ error: { description: err.message } }, null);
    }
    if (result.length > 0) {
      const userId = result[0].user_id;

      const data = {
        success: true,
        userId,
        description: "User Already Exsist",
      };
      output(null, { ...data });
    } else {
      const geustSignQuery = `
                        INSERT INTO users (email) VALUES (?);
                        SET @last_user_id = LAST_INSERT_ID();
                        SELECT * FROM users WHERE user_id = @last_user_id;`;
      db.query(geustSignQuery, [Email], async (err, result) => {
        if (err) {
          output({ error: { description: err.message } }, null);
          console.log(err);
        } else {
          // const saltRounds = 10;
          const userId = result[2][0].user_id;

          // const token = await bcrypt.hash(otp.toString(), saltRounds);
          const data = {
            success: true,
            userId,
            description: "User created successfully",
          };
          output(null, data);
        }
      });
    }
  });
};
// const googleAuthentiCationServices = async (input, output) => {
//   const { Email } = input;
//   const checkUserQuery = `SELECT * FROM users WHERE email = ?`;
//   db.query(checkUserQuery, [Email], async (err, result) => {
//     if (err) {
//       output({ error: { description: err.message } }, null);
//     }
//     if (result.length > 0) {
//       console.log(result);
//       // const saltRounds = 10;
//       const userId = result[0].user_id;
//       // const token = await bcrypt.hash(otp.toString(), saltRounds);
//       const data = {
//         success: true,
//         userId,
//         description: "User Already Exsist",
//       };
//       output(null, { ...data });
//     } else {
//       const geustSignQuery = `
//                         INSERT INTO users (email) VALUES (?);
//                         SET @last_user_id = LAST_INSERT_ID();
//                         SELECT * FROM users WHERE user_id = @last_user_id;`;
//       db.query(geustSignQuery, [Email], async (err, result) => {
//         if (err) {
//           output({ error: { description: err.message } }, null);
//           console.log(err);
//         } else {
//           // const saltRounds = 10;
//           const userId = result[2][0].user_id;
//           console.log(result);

//           // const token = await bcrypt.hash(otp.toString(), saltRounds);
//           const data = {
//             success: true,
//             userId,
//             description: "User created successfully",
//           };
//           output(null, data);
//         }
//       });
//     }
//   });
// };

const createUserService = async (input) => {
  const { name, email, phone_number, password } = input;
  try {
    if (!password) {
      const checkUser = `SELECT * FROM users WHERE phone_number = ? OR email = ?`;
      const [userResult] = await db
        .promise()
        .query(checkUser, [phone_number, email]);
      if (userResult.length > 0) {
        return {
          success: true,
          status: 200,
          message: "Email and Mobile No already exites",
          data: userResult,
        };
      } else {
        const insertQuery = `INSERT INTO users (name, email, phone_number) VALUES (?, ?, ?)`;
        const [result] = await db
          .promise()
          .query(insertQuery, [name, email, phone_number]);
        if (result.affectedRows > 0) {
          const lastUserId = result.insertId;
          const getUser = `SELECT * FROM users WHERE user_id = ?`;
          const [userResult] = await db.promise().query(getUser, [lastUserId]);
          if (userResult.length > 0) {
            return {
              success: true,
              status: 201,
              message: "User created successfully",
              data: userResult,
            };
          } else {
            return [];
          }
        } else {
          return { success: false, status: 400, message: "unable to create" };
        }
      }
    } else {
      const checkUser = `SELECT * FROM users WHERE phone_number = ? OR email = ?`;
      const [userResult] = await db
        .promise()
        .query(checkUser, [phone_number, email]);
      if (userResult.length > 0) {
        const checkUserCredentials = `SELECT * FROM users_credentials WHERE email =? AND phone_number =?`;
        const [credentialResult] = await db
          .promise()
          .query(checkUserCredentials, [
            userResult[0].email,
            userResult[0].phone_number,
          ]);
        if (credentialResult.length > 0) {
          return {
            success: true,
            status: 200,
            message: "Already user exits, Go to logIn",
          };
        } else {
          const saltRounds = 10;
          const newPassword = await bcrypt.hash(password, saltRounds);
          const insertCredential = `INSERT INTO users_credentials (username, password_hash, email, phone_number) VALUES (?, ?, ?, ?)`;
          const [insertResult] = await db
            .promise()
            .query(insertCredential, [name, newPassword, email, phone_number]);
          if (insertResult.affectedRows > 0) {
            const lastUserCredential = insertResult.insertId;
            const userDeatils = {
              name: name,
              email: email,
              phone_number: phone_number,
            };
            const userToken = await GENERATE_TOKEN(userDeatils, "120m");
            const insertToken = `INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE));`;
            const [tokenInsert] = await db
              .promise()
              .query(insertToken, [lastUserCredential, userToken]);
            if (tokenInsert.affectedRows > 0) {
              return {
                success: true,
                status: 201,
                message: "User inserted successFully",
                result: userResult,
                token: userToken,
              };
            }
          }
        }
      } else {
        const insertQuery = `INSERT INTO users (name, email, phone_number) VALUES (?, ?, ?)`;
        const [result] = await db
          .promise()
          .query(insertQuery, [name, email, phone_number]);
        if (result.affectedRows > 0) {
          const lastUserId = result.insertId;
          const saltRounds = 10;
          const newPassword = await bcrypt.hash(password, saltRounds);
          const insertCredential = `INSERT INTO users_credentials (username, password_hash, email, phone_number) VALUES (?, ?, ?, ?)`;
          const [insertResult] = await db
            .promise()
            .query(insertCredential, [name, newPassword, email, phone_number]);
          if (insertResult.affectedRows > 0) {
            const lastUserCredential = insertResult.insertId;
            const userDeatils = {
              name: name,
              email: email,
              phone_number: phone_number,
            };
            const userToken = await GENERATE_TOKEN(userDeatils, "120m");
            const insertToken = `INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE));`;
            const [tokenInsert] = await db
              .promise()
              .query(insertToken, [lastUserCredential, userToken]);
            if (tokenInsert.affectedRows > 0) {
              const selectQuery = `SELECT * FROM users WHERE user_id = ?`;
              const [resultUser] = await db
                .promise()
                .query(selectQuery, [lastUserId]);
              if (resultUser.length > 0) {
                return {
                  success: true,
                  status: 201,
                  message: "User created successfully",
                  result: resultUser,
                  token: userToken,
                };
              }
            } else {
              return [];
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
    return { success: false, status: 400, message: "user already exits" };
  }
};

const ResetPasswordService = async (input) => {
  const { mobileOrEmail, password } = input;
  try {
    const selectQuery = `SELECT * FROM users_credentials WHERE email = ? OR phone_number = ?`;
    const [userResult] = await db
      .promise()
      .query(selectQuery, [mobileOrEmail, mobileOrEmail]);
    if (userResult.length > 0) {
      const saltRounds = 10;
      const newPassword = await bcrypt.hash(password, saltRounds);
      const updateQuery = `UPDATE users_credentials SET password_hash = ? WHERE email = ? OR phone_number = ?`;
      const [updateResult] = await db
        .promise()
        .query(updateQuery, [newPassword, mobileOrEmail, mobileOrEmail]);
      if (updateResult.affectedRows > 0) {
        return { success: true, status: 200, message: "Successfully updated" };
      } else {
        return {
          success: false,
          status: 400,
          message: "Unable to update password",
        };
      }
    } else {
      return { success: false, status: 400, message: "User Not Fund" };
    }
  } catch (error) {
    console.error(error);
    return { success: false, status: 400, message: "user already exits" };
  }
};
module.exports = {
  authentiCationService,
  otpVerificationServieces,
  googleAuthentiCationServices,
  geustSignServices,
  processLoginServieces,
  createUserService,
  ResetPasswordService,
};
