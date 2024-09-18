const express = require("express");
const {
  GetSearchProducts,
  GetCategoryIdProducts,
  addNewProductController,
  getProductByProductIdController,
  getAllProductController,
} = require("../controllers/Categories/productControllers");
const ProductRoutes = express.Router();

ProductRoutes.get("/searchProduct", GetSearchProducts);
ProductRoutes.get("/categoryId", GetCategoryIdProducts);
ProductRoutes.post("/addNewProduct", addNewProductController);
ProductRoutes.get("/getByProductId", getProductByProductIdController);
ProductRoutes.get("/getAllProduct", getAllProductController);

module.exports = ProductRoutes;
