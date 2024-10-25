const { VERIFY_TOKEN } = require("./JWT");

const Middleware = async (req, res, next) => {
  try {
    const header = req.header("Authorization");
    if (!header) {
      return res.status(403).json({ message: "Authorization header missing" });
    }
    const token = header.split(" ")[1];
    console.log(token);
    if (!token) {
      return res.status(403).json({ message: "Token missing" });
    } else {
      const decoded = VERIFY_TOKEN(token);

      if (!decoded) {
        return res.status(403).json({ message: "Token is invalid or expired" });
      }
      req.user_id = decoded.user_id || decoded;
      next();
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(403).json({ message: "Token is invalid or expired" });
  }
};

module.exports = { Middleware };
