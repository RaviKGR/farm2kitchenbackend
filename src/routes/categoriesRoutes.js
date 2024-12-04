const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  AddNewCategoryController,
  GetCategoryController,
  GetCategoryByIdConteroller,
  GetAllCategoryController,
  GetChildByCategoryIdController,
  updateCategoryConteroller,
  deleteCategoryController,
  GetParentCategoryController,
} = require("../controllers/Categories/categoriesControllers");
const categoryRoutes = express.Router();

const categoryStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

// Multer instances
const uploadCategory = multer({ storage: categoryStorage });

categoryRoutes.post(
  "/newCategories",
  uploadCategory.single("image"),
  AddNewCategoryController
);
categoryRoutes.get("/getCategories", GetCategoryController);
categoryRoutes.get("/getCategoryById", GetCategoryByIdConteroller);
categoryRoutes.get("/getAllCategory", GetAllCategoryController);
categoryRoutes.get("/getparentCategory", GetParentCategoryController);
categoryRoutes.get(
  "/getChildCategoryByCategoryId",
  GetChildByCategoryIdController
);
categoryRoutes.put(
  "/updateCategory", uploadCategory.single("image"),
  updateCategoryConteroller
);
categoryRoutes.delete("/deleteCategory", deleteCategoryController); // Delete category

module.exports = categoryRoutes;
