const express = require("express");
const categoryRoutes = require("./categoriesroutes");
const ProductRoutes = require("./productRoutes");
const favoritesRoutes = require("./favoritesRoutes");
const routes = express.Router();

routes.use('/category', categoryRoutes);
routes.use('/product', ProductRoutes);
routes.use('/favorites', favoritesRoutes);

module.exports = routes;