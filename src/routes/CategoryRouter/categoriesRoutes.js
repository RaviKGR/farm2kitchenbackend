const express = require("express");
const { AddNewCategoryController, GetCategoryController, GetCategoryByIdConteroller, GetChildByCategoryIdController, updateCategoryConteroller, deleteCategoryController, GetAllCategoryController, } = require("../../controllers/Categories/categoriesControllers");
const categoryRoutes = express.Router();

categoryRoutes.post("/newCategories", AddNewCategoryController);
categoryRoutes.get("/getCategories", GetCategoryController);
categoryRoutes.get("/getCategoryById", GetCategoryByIdConteroller);
categoryRoutes.get("/getAllCategory", GetAllCategoryController);
categoryRoutes.get("/getChildCategoryByCategoryId", GetChildByCategoryIdController);
categoryRoutes.put("/updateCategory", updateCategoryConteroller);
categoryRoutes.put("/deleteCategory", deleteCategoryController); // Delete category

module.exports = categoryRoutes;
