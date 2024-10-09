const express = require("express");
const { NewServieLocationController, getServiceLocationController } = require("../controllers/serviceLocation/serviceLocationcontroller");
const serviceLocationRouters = express.Router();

serviceLocationRouters.post("/newServiceLocation", NewServieLocationController);
serviceLocationRouters.get('/getServiceLocation', getServiceLocationController)


module.exports = serviceLocationRouters;