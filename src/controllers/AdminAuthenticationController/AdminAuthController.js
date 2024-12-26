const {
  loadTemplate,
  FORGOT_PASSWORD_TEMPLATE,
  SENDEMAIL,
} = require("../../email/emailconfic");
const {
  LoginService,
  ForgotPasswordService,
  ResetPasswordService,
} = require("../../services/AdminAuthenticationService/AdminAuthServices");

const LoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Both Email and password is required",
      });
    }
    const result = await LoginService(req.body);
    if (result) {
      return res.status(result.status).json({
        success: result.success,
        message: result.message,
        ...result?.data,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const ForgotPasswordController = async (req, res) => {
  try {
    const email = req.body.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    } else {
      const result = await ForgotPasswordService(req.body.email);
      (result.data);
      if (result.success) {
        const template = loadTemplate(
          {
            password: result?.data?.password,
            name: result?.data?.name,
          },
          FORGOT_PASSWORD_TEMPLATE
        );
        const send = await SENDEMAIL(result?.data?.email, template);
        if (send) {
          const { data, ...newResult } = result;
          return res.status(200).json(newResult);
        }
      }
      return res.status(result.status).json(result);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const ResetPasswordController = async (req, res) => {
  try {
    const { currentPassword, password, userId } = req.body;
    if ((!currentPassword, !password, !userId)) {
      return res.status(400).json({
        success: false,
        message: "required details missing",
      });
    } else {
      const result = await ResetPasswordService(req.body);
      return res.status(result.status).json(result);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const LogOutController = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Failed to sign out" });
      res.status(200).json({ message: "SignOut successful" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const GetUserController = async (req, res) => {
  const user = req.user;
  if (user !== undefined && user) {
    res.status(200).json({ message: "Access granted", ...user.value });
  }
};

module.exports = {
  LoginController,
  ForgotPasswordController,
  ResetPasswordController,
  LogOutController,
  GetUserController,
};
