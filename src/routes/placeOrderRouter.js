const express = require("express");
const { PlaceOrderController } = require("../controllers/placeOrder/placeOrder");

const placeOrderRouters = express.Router();

placeOrderRouters.post('/addPlaceOrder', PlaceOrderController);

module.exports = placeOrderRouters;