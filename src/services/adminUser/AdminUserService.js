const { db } = require("../../confic/db");

const addNewAdminUserService = async (input) => {
  const { name, email, phoneNumber, address, roleId } = input;
  try {
    const selectQuery = `SELECT * FROM admin_user WHERE email = ? OR phone_number = ?`;
    const [selectAdminUser] = await db
      .promise()
      .query(selectQuery, [email, phoneNumber]);
    if (selectAdminUser.length > 0) {
      return { success: false, message: "Admin user Already exists" };
    } else {
      const insertQuery = `INSERT INTO admin_user (name, email, phone_number, address, enabled) VALUE (?, ?, ?, ?, "Y")`;
      const [result] = await db
        .promise()
        .query(insertQuery, [name, email, phoneNumber, address]);
      if (result.affectedRows > 0) {
        const lastAdminId = result.insertId;
        const userRoleInsert = `INSERT INTO user_roles (admin_user_id, role_id) VALUES (?, ?)`;
        const [insertUserRole] = await db
          .promise()
          .query(userRoleInsert, [lastAdminId, roleId]);
        if (insertUserRole.affectedRows > 0) {
          return { success: true, message: "Added Successfully" };
        } else {
          return { success: false, message: "admin_user unable to add" };
        }
      } else {
        return { success: false, message: "admin_user unable to add" };
      }
    }
  } catch (e) {
    console.error(e);
    return { success: false, message: "DataBase Error" };
  }
};

const UpdateAdminUserEnabledService = async (input) => {
    const { adminUserId} = input;
    const enabled = input.enabled === true ? "Y" : "N";
    
  try {
    const updateQuery = `UPDATE admin_user SET enabled = ? WHERE admin_user_id = ?`
    const [updateResult] = await db
          .promise()
          .query(updateQuery, [enabled, adminUserId]);
    if(updateResult.affectedRows > 0) {
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
  const { limit, offset } = input;    
  try {
    const selectQuery = `
    SELECT
    COUNT(*) OVER() AS total_count,
    au.*,
    r.*  
    FROM admin_user au
    JOIN user_roles ur ON ur.admin_user_id = au.admin_user_id
    JOIN roles r ON r.role_id = ur.role_id
    LIMIT ? OFFSET ?`
    const [updateResult] = await db
          .promise()
          .query(selectQuery, [parseInt(limit), parseInt(offset)]);
    if(selectQuery.length > 0) {
        return updateResult;
    } else {
        return [];
    }
  } catch (e) {
    console.error(e);
    return { success: false, message: "DataBase Error" };
  }
};

module.exports = { addNewAdminUserService, UpdateAdminUserEnabledService, getAllAdminUserEnabledService };
