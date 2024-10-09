const express = require("express");
const { NewServieLocationController } = require("../controllers/serviceLocation/serviceLocationcontroller");
const serviceLocationRouters = express.Router();

serviceLocationRouters.post("/newServiceLocation", NewServieLocationController)


module.exports = serviceLocationRouters;