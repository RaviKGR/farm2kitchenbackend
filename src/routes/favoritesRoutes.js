const express = require('express');
const { AddNewFavoritesController, getFavoritesController, deleteUserFavoritesController } = require('../controllers/Favorite/favoriteControllers');
const favoritesRoutes = express.Router();

favoritesRoutes.post("/addfavorites", AddNewFavoritesController);
favoritesRoutes.get('/getfavorites', getFavoritesController);
favoritesRoutes.delete('/deletefavorites', deleteUserFavoritesController);
module.exports = favoritesRoutes;