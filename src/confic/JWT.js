const jwt = require("jsonwebtoken");

const Secret = "qwertyuiopasdfghjkl09876321zxcvbnm";

const GENERATE_TOKEN = async (value, expiresIn) => {
  const Token = jwt.sign({ value }, Secret, { expiresIn: expiresIn });
  return Token;
};

const VERIFY_TOKEN = async (value) => {
  try {
    console.log("value", value);

    const verify = jwt.verify(value, Secret);
    console.log("verify", verify);

    return verify;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    } else {
      throw new Error("Token verification failed");
    }
  }
};
const DECODE_TOKEN = (token) => {
  const decoded = jwt.decode(token);
  return decoded; // Returns the decoded payload
};

module.exports = { GENERATE_TOKEN, VERIFY_TOKEN, DECODE_TOKEN };