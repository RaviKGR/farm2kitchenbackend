const express = require('express');
const { AddNewCategoryController, GetCategoryController } = require('../controllers/Categories/CategoriesControllers');
const categoryRoutes =express.Router();

categoryRoutes.post('/newCategories',AddNewCategoryController)
categoryRoutes.get('/getCategories',GetCategoryController)


module.exports =categoryRoutes;