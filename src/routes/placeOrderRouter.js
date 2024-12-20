const express = require("express");
const { PlaceOrderController, PlaceOrderForCustomerController } = require("../controllers/placeOrder/placeOrder");

const placeOrderRouters = express.Router();

placeOrderRouters.post('/addPlaceOrder', PlaceOrderController);
placeOrderRouters.post('/addPlaceOrderForCustomer', PlaceOrderForCustomerController);

module.exports = placeOrderRouters;