const {
  addNewAdminUserService,
  UpdateAdminUserEnabledService,
  getAllAdminUserEnabledService,
  getAllAdminRoleServcie,
} = require("../../services/adminUser/AdminUserService");

const addNewAdminUserController = async (req, res) => {
  const { name, email, phoneNumber, address, roleId } = req.body;
  try {
    if (!name || !email || !phoneNumber || !address || !roleId) {
      return res.status(400).json({ message: "All fields are required" });
    } else {
      const result = await addNewAdminUserService(req.body);
      return res.status(result.success ? 201 : 400).json(result);
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const UpdateAdminUserEnabledController = async (req, res) => {
  const { adminUserId, enabled } = req.query;
  try {
    if (!adminUserId || !enabled) {
      return res.status(400).json({ message: "All fields are required" });
    } else {
      const result = await UpdateAdminUserEnabledService(req.query);
      return res.status(result.success ? 200 : 400).json(result);
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const getAllAdminUserEnabledController = async (req, res) => {
  const { limit, offset, rollId, name, email, phoneNumber } = req.query;
  try {
    if (!limit || !offset) {
      return res.status(400).json({ message: "All fields are required" });
    } else {
      const result = await getAllAdminUserEnabledService(req.query);
      return res.status(200).json(result);
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllAdminRoleController = async (req, res) => {
  try {
    const result = await getAllAdminRoleServcie();
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  addNewAdminUserController,
  UpdateAdminUserEnabledController,
  getAllAdminUserEnabledController,
  getAllAdminRoleController
};
