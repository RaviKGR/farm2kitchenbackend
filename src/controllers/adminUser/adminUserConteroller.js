const {
  loadTemplate,
  GREETINGS_TEMPLATE,
  SENDEMAIL,
} = require("../../email/emailconfic");
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
      console.log(result.data);
      if (result.success) {
        const template = loadTemplate(
          {
            password: result?.data?.password,
            name: result?.data?.name,
            email: result?.data?.email,
          },
          GREETINGS_TEMPLATE
        );

        const send = await SENDEMAIL(result?.data?.email, template);
        console.log(send);

        if (send) {
          return res.status(201).json(result);
        }
      }

      return res.status(result.status).json(result);
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
  getAllAdminRoleController,
};
