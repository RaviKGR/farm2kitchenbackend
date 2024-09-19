const express = require("express");
const {
  GetSearchProducts,
  GetCategoryIdProducts,
  addNewProductController,
  getProductByProductIdController,
  getAllProductController,
  updateProductController,
  updateProductStatusController,
  deleteProductController,
} = require("../controllers/Categories/productControllers");
const ProductRoutes = express.Router();

ProductRoutes.get("/searchProduct", GetSearchProducts);
ProductRoutes.get("/categoryId", GetCategoryIdProducts);
ProductRoutes.post("/addNewProduct", addNewProductController);
ProductRoutes.get("/getByProductId", getProductByProductIdController);
ProductRoutes.get("/getAllProduct", getAllProductController);
ProductRoutes.put("/updateProduct", updateProductController);
ProductRoutes.put("/updateProductStatus", updateProductStatusController);
ProductRoutes.put("/delateProduct", deleteProductController)


module.exports = ProductRoutes;
