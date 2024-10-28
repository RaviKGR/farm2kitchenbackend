const { VERIFY_TOKEN } = require("./JWT");

const Middleware = async (req, res, next) => {
  const header = req.header("Authorization");
  if (!header) {
    console.log("Authorization header missing");
    return res.status(403).json({ message: "Authorization header missing" });
  }

  const token = header.split(" ")[1];
  if (!token) {
    console.log("Token missing");
    return res.status(403).json({ message: "Token missing" });
  }

  const result = await VERIFY_TOKEN(token);
  if (!result.success) {
    console.log("Token error:", result.error);
    return res.status(403).json({ message: result.error });
  }

  req.user = result.decoded;
  next();
};

module.exports = { Middleware };
