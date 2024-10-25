const { db } = require("../../confic/db");
const { GENERATE_RANDOM_PASSWORD } = require("../../confic/JWT");
const bcrypt = require("bcrypt");

const addNewAdminUserService = async (input) => {
  const { name, email, phoneNumber, address, roleId } = input;
  try {
    const selectQuery = `SELECT * FROM admin_user WHERE email = ? OR phone_number = ?`;
    const [selectAdminUser] = await db
      .promise()
      .query(selectQuery, [email, phoneNumber]);
    if (selectAdminUser.length > 0) {
      return {
        success: false,
        status: 400,
        message: "Admin user Already exists",
      };
    } else {
      const password = GENERATE_RANDOM_PASSWORD(8);
      const saltRounds = 10;
      const newPassword = await bcrypt.hash(password, saltRounds);
      const insertQuery = `INSERT INTO admin_user (name, email, phone_number, address, password, temp_password, enabled) VALUE (?, ?, ?, ?, ?, "Y", "Y")`;
      const [result] = await db
        .promise()
        .query(insertQuery, [name, email, phoneNumber, address, newPassword]);
      if (result.affectedRows > 0) {
        const lastAdminId = result.insertId;
        const userRoleInsert = `INSERT INTO user_roles (admin_user_id, role_id) VALUES (?, ?)`;
        const [insertUserRole] = await db
          .promise()
          .query(userRoleInsert, [lastAdminId, roleId]);
        if (insertUserRole.affectedRows > 0) {
          return {
            success: true,
            status: 201,
            message: "Added Successfully",
            data: { password, name, email },
          };
        } else {
          return {
            success: false,
            status: 500,
            message: "admin_user unable to add",
          };
        }
      } else {
        return {
          success: false,
          status: 500,
          message: "admin_user unable to add",
        };
      }
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 500, message: "Internal server Error" };
  }
};

const UpdateAdminUserEnabledService = async (input) => {
  const { adminUserId } = input;
  const enabled = input.enabled == "true" ? "Y" : "N";
  try {
    const updateQuery = `UPDATE admin_user SET enabled = ? WHERE admin_user_id = ?`;
    const [updateResult] = await db
      .promise()
      .query(updateQuery, [enabled, adminUserId]);
    if (updateResult.affectedRows > 0) {
      return { success: true, message: "Updated Successfully" };
    } else {
      return { success: false, message: "admin_user unable to update" };
    }
  } catch (e) {
    console.error(e);
    return { success: false, message: "DataBase Error" };
  }
};

const getAllAdminUserEnabledService = async (input) => {
  const { limit, offset, rollId, name, email, phoneNumber } = input;

  try {
    let whereClause = "";
    const queryParams = [];
    const hasConditions = rollId || name || email || phoneNumber;
    if (hasConditions) {
      if (rollId) {
        whereClause += "r.role_id = ?";
        queryParams.push(rollId);
      }

      if (name) {
        whereClause += (whereClause ? "AND " : "") + "au.name LIKE ?";
        queryParams.push(`%${name}%`);
      }

      if (email) {
        whereClause += (whereClause ? "AND " : "") + "au.email LIKE ?";
        queryParams.push(`%${email}%`);
      }

      if (phoneNumber) {
        whereClause += (whereClause ? "AND " : "") + "au.phone_number LIKE ?";
        queryParams.push(`%${phoneNumber}%`);
      }
    }
    const selectQuery = `
    SELECT
    COUNT(*) OVER() AS total_count,
    au.*,
    r.*  
    FROM admin_user au
    JOIN user_roles ur ON ur.admin_user_id = au.admin_user_id
    JOIN roles r ON r.role_id = ur.role_id
    ${hasConditions ? `WHERE ${whereClause}` : ""}
    LIMIT ? OFFSET ?`;

    queryParams.push(parseInt(limit), parseInt(offset));
    const [updateResult] = await db
      .promise()
      .query(selectQuery, [...queryParams]);
    if (updateResult.length > 0) {
      return updateResult;
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return { success: false, message: "DataBase Error" };
  }
};

const getAllAdminRoleServcie = async () => {
  try {
    const selctQuery = `SELECT * FROM roles ORDER BY role_id ASC`;
    const [result] = await db.promise().query(selctQuery);
    if (result.length > 0) {
      return result;
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return { success: false, status: 500, message: "datebase error" };
  }
};

module.exports = {
  addNewAdminUserService,
  UpdateAdminUserEnabledService,
  getAllAdminUserEnabledService,
  getAllAdminRoleServcie,
};
