const express = require('express');
const { GetSearchProducts, GetCategoryIdProducts } = require('../controllers/Categories/productControllers');
const ProductRoutes = express.Router();

ProductRoutes.get('/searchProduct', GetSearchProducts);
ProductRoutes.get('/categoryId', GetCategoryIdProducts)

module.exports = ProductRoutes;