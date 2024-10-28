const express = require("express");
const {
  LoginController,
  LogOutController,
  ForgotPasswordController,
  ResetPasswordController,
  GetUserController,
} = require("../controllers/AdminAuthenticationController/AdminAuthController");
const { Middleware } = require("../confic/AdminMiddleware");
const AdminAuthRoutes = express.Router();

AdminAuthRoutes.post("/adminLogin", LoginController);
AdminAuthRoutes.post("/adminForgotPassword", ForgotPasswordController);
AdminAuthRoutes.post(
  "/adminResettPassword",
  Middleware,
  ResetPasswordController
);
AdminAuthRoutes.post("/adminLogout", Middleware, LogOutController);
AdminAuthRoutes.get("/admin-getUser", Middleware, GetUserController);
module.exports = AdminAuthRoutes;
