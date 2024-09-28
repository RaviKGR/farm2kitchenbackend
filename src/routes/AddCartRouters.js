const express = require('express');
const { AddCartController, getCartController } = require('../controllers/AddCartController/AddCartController');
const AddCartRouters = express.Router();
AddCartRouters.post('/addCartProduct', AddCartController);
AddCartRouters.get('/getAllCarts', getCartController);
module.exports = AddCartRouters;