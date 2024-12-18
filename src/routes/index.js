const express = require("express");
const categoryRoutes = require("./categoriesRoutes");
const ProductRoutes = require("./productRoutes");
const favoritesRoutes = require("./favoritesRoutes");
const authenticationRouters = require("./authenticationRouters");
const OrderHistoryRouters = require("./OrderHistoryRouters");
const AddCartRouters = require("./AddCartRouters");
const InventoryRouters = require("./inventoryRouters");
const OfferRouters = require("./OfferRouters");
const userDetailRouters = require("./userDetailsRouters");
const serviceLocationRouters = require("./serviceLocation");
const adminUserRouter = require("./adminUserRoutes");
const placeOrderRouters = require("./placeOrderRouter");
const imageRouters = require("./imageRouters");
const AdminAuthRoutes = require("./AdminAuthRoutes");
const SearchRouters = require("./searchRouters");
const routes = express.Router();

routes.use("/category", categoryRoutes);
routes.use("/product", ProductRoutes);
routes.use("/favorites", favoritesRoutes);
routes.use("/authentication", authenticationRouters);
routes.use("/adminAuth", AdminAuthRoutes);
routes.use("/orderhistory", OrderHistoryRouters);
routes.use("/carts", AddCartRouters);
routes.use("/inventory", InventoryRouters);
routes.use("/offer", OfferRouters);
routes.use("/userDetails", userDetailRouters);
routes.use("/serviceLocation", serviceLocationRouters);
routes.use("/adminUser", adminUserRouter);
routes.use("/placeOrder", placeOrderRouters);
routes.use("/image", imageRouters);
routes.use("/search", SearchRouters)

module.exports = routes;
