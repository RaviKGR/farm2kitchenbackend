const express = require("express");
const {
  NewServieLocationController,
  getServiceLocationController,
  getDeliveryDateController,
  UpdateServiceLocationController,
} = require("../controllers/serviceLocation/serviceLocationcontroller");
const serviceLocationRouters = express.Router();

serviceLocationRouters.post("/newServiceLocation", NewServieLocationController);
serviceLocationRouters.get("/getServiceLocation", getServiceLocationController);
serviceLocationRouters.get("/getDeliveryDate", getDeliveryDateController);
serviceLocationRouters.put(
  "/updateDeliveryLocation",
  UpdateServiceLocationController
);

module.exports = serviceLocationRouters;
