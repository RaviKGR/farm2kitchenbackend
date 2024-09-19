const express = require("express");
const categoryRoutes = require("./categoriesRoutes");
const ProductRoutes = require("./productRoutes");
const favoritesRoutes = require("./favoritesRoutes");
const authenticationRouters = require("./authenticationRouters");
const routes = express.Router();

routes.use('/category', categoryRoutes);
routes.use('/product', ProductRoutes);
routes.use('/favorites', favoritesRoutes);
routes.use('/authentication', authenticationRouters)

module.exports = routes;