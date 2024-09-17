const express = require("express");
const {
  AddNewCategoryController,
  GetCategoryController,
  GetCategoryByIdConteroller,
  GetChildByCategoryIdController,
  updateCategoryConteroller,
} = require("../controllers/Categories/CategoriesControllers");
const categoryRoutes = express.Router();

categoryRoutes.post("/newCategories", AddNewCategoryController);
categoryRoutes.get("/getCategories", GetCategoryController);
categoryRoutes.get("/getCategoryById", GetCategoryByIdConteroller);
categoryRoutes.get("/getChildCategoryByCategoryId", GetChildByCategoryIdController);
categoryRoutes.put("updateCategory", updateCategoryConteroller);

module.exports = categoryRoutes;
