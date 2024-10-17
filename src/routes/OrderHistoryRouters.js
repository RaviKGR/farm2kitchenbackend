const express = require('express');
const {getOrderHistoryController, getAllOrderHistoryController, getAllOrderHistoryByIdController, updateOrderStatusController} = require('../controllers/OrderHistory/OrderHistoryController');
const OrderHistoryRouters = express.Router();

OrderHistoryRouters.get('/getorderhistory', getOrderHistoryController);
OrderHistoryRouters.get("/getAllOrderHistory", getAllOrderHistoryController);
OrderHistoryRouters.get("/getAllOrderHistoryById", getAllOrderHistoryByIdController);
OrderHistoryRouters.put("/updateOrderStatus", updateOrderStatusController);

module.exports = OrderHistoryRouters;