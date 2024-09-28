const express = require("express");
const multer = require('multer');
const path = require('path');
const { GetSearchProducts, GetCategoryIdProducts, addNewProductController, getProductByProductIdController, getAllProductController, updateProductController, updateProductStatusController, deleteProductController, getProductBarCodeController, getBestSellerProductController, updateBestSellerProductController, exportProductsToCSVController, getProductByCategoryIdController, updateInventoryController, updateProductImageController } = require("../controllers/Product/productControllers");

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
ProductRoutes.get("/productByCategoryId", getProductByCategoryIdController)
ProductRoutes.post("/addNewProduct", uploadProduct.array('image', 5), addNewProductController);
ProductRoutes.get("/getByProductId", getProductByProductIdController);
ProductRoutes.get("/getAllProduct", getAllProductController);
ProductRoutes.put("/updateProduct", updateProductController);
ProductRoutes.put("/updateProductImage", uploadProduct.single('image'), updateProductImageController);
ProductRoutes.put("/updateProductStatus", updateProductStatusController);
ProductRoutes.delete("/deleteProduct", deleteProductController);
ProductRoutes.get("/getproductByScan", getProductBarCodeController);
ProductRoutes.get("/getBestSellerProduct", getBestSellerProductController);
ProductRoutes.put("/updateBestSellerProduct", updateBestSellerProductController)
ProductRoutes.get("/exportProductsCSV", exportProductsToCSVController);
ProductRoutes.put("/updateInventory", updateInventoryController)

module.exports = ProductRoutes;
