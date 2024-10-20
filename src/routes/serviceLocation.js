const express = require("express");
const { NewServieLocationController, getServiceLocationController, getDeliveryDateController } = require("../controllers/serviceLocation/serviceLocationcontroller");
const serviceLocationRouters = express.Router();

serviceLocationRouters.post("/newServiceLocation", NewServieLocationController);
serviceLocationRouters.get('/getServiceLocation', getServiceLocationController);
serviceLocationRouters.get('/getDeliveryDate', getDeliveryDateController);



module.exports = serviceLocationRouters;