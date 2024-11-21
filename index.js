const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./src/confic/db");
const createTables = require("./src/confic/createTables");
const bodyParser = require("body-parser");
const routes = require("./src/routes");
const app = express();
var session = require("express-session");

connectDB();
createTables();
const allowedOrigins = [
  "https://farm2kitchen.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.options("*");

app.get("/home", (req, res) => {
  res.status(200).json("Welcome, your app is working well");
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    maxAge: 1000 * 60 * 15,
    cookie: {
      secure: false,
    },
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));
app.get("/", (req, res) => {
  res.status(200).json("Welcome to the Farm2Kitchen backend API");
});

const log = (req, res, next) => {
  const { originalUrl, method, query, body } = req;
  console.log(
    `Url: ${
      originalUrl.split("?")[0]
    } -> Method: ${method} -> Date: ${new Date()} -> Query: ${JSON.stringify(
      query
    )} || Body: ${JSON.stringify(body)} `
  );
  next();
};
app.use("/api", routes);
app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
module.exports = app;
