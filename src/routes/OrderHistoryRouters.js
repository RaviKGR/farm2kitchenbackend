const express = require('express');
const {getOrderHistoryController, getAllOrderHistoryController, getAllOrderHistoryByIdController, updateOrderStatusController, getOrderItemsByOrderIdController, getOrderHistomerByUserIdController} = require('../controllers/OrderHistory/OrderHistoryController');
const OrderHistoryRouters = express.Router();

OrderHistoryRouters.get('/getorderhistory', getOrderHistoryController);
OrderHistoryRouters.get("/getAllOrderHistory", getAllOrderHistoryController);
OrderHistoryRouters.get("/getAllOrderHistoryById", getAllOrderHistoryByIdController);
OrderHistoryRouters.put("/updateOrderStatus", updateOrderStatusController);
OrderHistoryRouters.get("/getOrderItemsByOrderId", getOrderItemsByOrderIdController);
// CUSTOMER
OrderHistoryRouters.get("/getOrderHistoryByUserId", getOrderHistomerByUserIdController);


module.exports = OrderHistoryRouters;