const express = require("express");
const { addNewAdminUserController, UpdateAdminUserEnabledController, getAllAdminUserEnabledController, getAllAdminRoleController } = require("../controllers/adminUser/adminUserConteroller");

const adminUserRouter = express.Router();

adminUserRouter.post("/addNewAdminUser", addNewAdminUserController);
adminUserRouter.put("/updateAdminUserEnabled", UpdateAdminUserEnabledController);
adminUserRouter.get("/getAllAdminUser", getAllAdminUserEnabledController);
adminUserRouter.get("/getAllAdminRole", getAllAdminRoleController);

module.exports = adminUserRouter;