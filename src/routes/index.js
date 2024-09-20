const express = require("express");
const categoryRoutes = require("./CategoryRouter/categoriesRoutes");
const ProductRoutes = require("./ProductRouters/productRoutes");
const favoritesRoutes = require("./FavoritesRouters/favoritesRoutes");
const authenticationRouters = require("./AuthenticationRouters/authenticationRouters");
const routes = express.Router();

routes.use('/category', categoryRoutes);
routes.use('/product', ProductRoutes);
routes.use('/favorites', favoritesRoutes);
routes.use('/authentication', authenticationRouters)

module.exports = routes;