const express = require("express");
const { addNewAdminUserController, UpdateAdminUserEnabledController, getAllAdminUserEnabledController } = require("../controllers/adminUser/adminUserConteroller");

const adminUserRouter = express.Router();

adminUserRouter.post("/addNewAdminUser", addNewAdminUserController);
adminUserRouter.put("/updateAdminUserEnabled", UpdateAdminUserEnabledController);
adminUserRouter.get("/getAllAdminUserEnabled", getAllAdminUserEnabledController);

module.exports = adminUserRouter;