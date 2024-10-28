const { db } = require("../../confic/db");
const bcrypt = require("bcrypt");
const {
  GENERATE_TOKEN,
  GENERATE_RANDOM_PASSWORD,
} = require("../../confic/JWT");

const LoginService = async (input) => {
  try {
    const { email, password } = input;
    const checkQuery = `SELECT * FROM admin_user WHERE email = ? `;
    const [get] = await db.promise().query(checkQuery, [email]);
    if (get.length === 0) {
      console.log("get", get);
      return { status: 400, success: false, message: "User not Found" };
    } else {
      const user = get[0];
      if (user.enabled === "N") {
        return {
          status: 400,
          success: false,
          message: "User not have access to login",
        };
      } else {
        const Verify = await bcrypt.compare(password, user.password);
        console.log("Verify", Verify);

        if (!Verify) {
          return {
            status: 400,
            success: false,
            message: "Entered password is Incorrect",
          };
        } else {
          const { temp_password, enabled, password, ...userDetails } = user;
          const token = await GENERATE_TOKEN(userDetails, "90m");
          const expiresAt = new Date(Date.now() + 90 * 60 * 1000);
          const createQuery = `INSERT INTO admin_tokens (admin_user_id, token, expires_at) values(?, ?, ?)`;
          const [insertToken] = await db
            .promise()
            .query(createQuery, [user?.admin_user_id, token, expiresAt]);
          if (insertToken.affectedRows !== 0) {
            return {
              status: 200,
              success: true,
              message: "User Successfully loggedin",
              data: { ...userDetails, token },
            };
          } else {
            return {
              status: 500,
              success: true,
              message: "Internal server error",
            };
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
    return { status: 500, success: false, message: "Internal server error" };
  }
};

const ForgotPasswordService = async (input) => {
  try {
    const email = input;
    const checkQuery = `SELECT * FROM admin_user WHERE email = ? `;
    const [get] = await db.promise().query(checkQuery, [email]);
    console.log("get", get);
    if (get.length === 0) {
      console.log("get", get);
      return { status: 400, success: false, message: "User not Found" };
    } else {
      const user = get[0];
      const password = GENERATE_RANDOM_PASSWORD(8);
      const saltRounds = 10;
      const newPassword = await bcrypt.hash(password, saltRounds);
      const insertQuery = `UPDATE admin_user SET password = ?, temp_password = "Y" WHERE email = ?`;
      const [insert] = await db
        .promise()
        .query(insertQuery, [newPassword, email]);
      console.log("insert", insert);
      if (insert.affectedRows !== 0) {
        return {
          status: 200,
          success: true,
          message: "new password sent to your email",
          data: { name: user.name, email: user.email, password: password },
        };
      } else {
        return {
          status: 500,
          success: true,
          message: "Internal server error",
        };
      }
    }
  } catch (error) {
    console.error(error);
    return { status: 500, success: false, message: "Internal server error" };
  }
};

const ResetPasswordService = async (input) => {
  try {
    const { currentPassword, password, userId } = input;
    const checkQuery = `SELECT * FROM admin_user WHERE admin_user_id = ? `;
    const [get] = await db.promise().query(checkQuery, [userId]);
    console.log("get", get);
    if (get.length === 0) {
      console.log("get", get);
      return { status: 400, success: false, message: "User not Found" };
    } else {
      const user = get[0];
      const Verify = await bcrypt.compare(currentPassword, user.password);
      console.log("Verify", Verify);

      if (!Verify) {
        return {
          status: 400,
          success: false,
          message: "Entered password is Incorrect",
        };
      } else {
        const saltRounds = 10;
        const newPassword = await bcrypt.hash(password, saltRounds);
        const insertQuery = `UPDATE admin_user SET password = ?, temp_password = "N" WHERE admin_user_id = ?`;
        const [insert] = await db
          .promise()
          .query(insertQuery, [newPassword, userId]);
        console.log("insert", insert);
        if (insert.affectedRows !== 0) {
          return {
            status: 200,
            success: true,
            message: "Password successfully changed",
          };
        } else {
          return {
            status: 500,
            success: true,
            message: "Internal server error",
          };
        }
      }
    }
  } catch (error) {
    console.error(error);
    return { status: 500, success: false, message: "Internal server error" };
  }
};

module.exports = { LoginService, ForgotPasswordService, ResetPasswordService };
