const express = require('express');
const getOrderHistoryController = require('../controllers/OrderHistory/OrderHistoryController');
const OrderHistoryRouters = express.Router();
OrderHistoryRouters.get('/getorderhistory', getOrderHistoryController);
module.exports = OrderHistoryRouters;