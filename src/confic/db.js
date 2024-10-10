const mysql = require("mysql2");
require("dotenv").config(); // Load environment variables from .env file

// Create a MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST, // Your MySQL host
  user: process.env.DB_USER, // Your MySQL username
  password: process.env.DB_PASSWORD, // Your MySQL password
  database: process.env.DB_NAME, // Your MySQL database name
  multipleStatements: true,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

// Connect to MySQL
const connectDB = () => {
  db.connect((err) => {
    if (err) {
      console.error("Error connecting to MySQL:", err.message);
    } else {
      console.log("Connected to MySQL database");
    }
  });
};

// Export the db object for use in other modules
module.exports = { connectDB, db };
