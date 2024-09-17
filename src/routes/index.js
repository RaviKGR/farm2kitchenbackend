const express = require("express");
const categoryRoutes = require("./categoriesroutes");
const routes = express.Router();

routes.use('/category', categoryRoutes);

module.exports = routes;