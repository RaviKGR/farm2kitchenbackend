const express = require("express");
const { createSearchHistoryController, getSearchHistoryContoller } = require("../controllers/SearchHistoryController/searchHistoryController");

const SearchRouters = express.Router();

SearchRouters.post("/createSearchHistory", createSearchHistoryController);
SearchRouters.get("/getSearchHistoryByUserId", getSearchHistoryContoller)

module.exports = SearchRouters;