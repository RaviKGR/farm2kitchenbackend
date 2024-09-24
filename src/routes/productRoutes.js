const express = require("express");
const multer = require('multer');
const path = require('path');
const { GetSearchProducts, GetCategoryIdProducts, addNewProductController, getProductByProductIdController, getAllProductController, updateProductController, updateProductStatusController, deleteProductController, getProductBarCodeController, getBestSellerProductController, updateBestSellerProductController, exportProductsToCSVController } = require("../controllers/Product/productControllers");

const ProductRoutes = express.Router();

const productStorage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, path.join(__dirname, '../../uploads'));
    },
    filename: function (req, file,  cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
  });

   // Multer instances
   const uploadProduct = multer({ storage: productStorage });

ProductRoutes.get("/searchProduct", GetSearchProducts);
ProductRoutes.get("/categoryId", GetCategoryIdProducts);
ProductRoutes.post("/addNewProduct", uploadProduct.array('image'), addNewProductController);
ProductRoutes.get("/getByProductId", getProductByProductIdController);
ProductRoutes.get("/getAllProduct", getAllProductController);
ProductRoutes.put("/updateProduct", uploadProduct.array('image'), updateProductController);
ProductRoutes.put("/updateProductStatus", updateProductStatusController);
ProductRoutes.put("/delateProduct", deleteProductController);
ProductRoutes.get("/getproductByScan", getProductBarCodeController);
ProductRoutes.get("/getBestSellerProduct", getBestSellerProductController);
ProductRoutes.put("/updateBestSellerProduct", updateBestSellerProductController)
ProductRoutes.get("/exportProductsCSV", exportProductsToCSVController);

module.exports = ProductRoutes;
