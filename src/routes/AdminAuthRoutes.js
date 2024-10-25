const express = require("express");
const {
  LoginController,
  LogOutController,
  ForgotPasswordController,
  ResetPasswordController,
} = require("../controllers/AdminAuthenticationController/AdminAuthController");
const AdminAuthRoutes = express.Router();

AdminAuthRoutes.post("/adminLogin", LoginController);
AdminAuthRoutes.post("/adminForgotPassword", ForgotPasswordController);
AdminAuthRoutes.post("/adminResettPassword", ResetPasswordController);
AdminAuthRoutes.post("/adminLogout", LogOutController);
module.exports = AdminAuthRoutes;
