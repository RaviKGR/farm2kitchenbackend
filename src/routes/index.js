const express = require("express");
const categoryRoutes = require("./categoriesroutes");
const ProductRoutes = require("./productRoutes");
const routes = express.Router();

routes.use('/category', categoryRoutes);
routes.use('/product',ProductRoutes)

module.exports = routes;