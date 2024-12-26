const { VerifyToken } = require("./JWT");

const Middleware = async (req, res, next) => {
    try {
        const header = req.header("Authorization");

        // Check if the Authorization header is present
        if (!header) {
            return res.status(403).json({ message: "Authorization header missing" });
        }

        // Extract the token from the Authorization header (Bearer token)
        const token = header.split(" ")[1];
        // Check if the token is present
        if (!token) {
            return res.status(403).json({ message: "Token missing" });
        }

        // Verify the token and decode it
        const decoded = VerifyToken(token);

        // Check if the token was successfully verified
        if (!decoded) {
            return res.status(403).json({ message: "Token is invalid or expired" });
        }

        // Attach the decoded token data (e.g., user_id) to the request object
        req.user_id = decoded.user_id || decoded;

        // Proceed to the next middleware if the token is valid
        next();
    } catch (error) {
        // Handle any errors during token verification
        console.error("Error verifying token:", error);
        return res.status(403).json({ message: "Token is invalid or expired" });
    }
};

module.exports = { Middleware };
