const express = require("express");
const { updateInventoryController, getInventoryController } = require("../controllers/Inventory/inventoryController");
const InventoryRouters = express.Router();

InventoryRouters.put('/updateInventory', updateInventoryController);
InventoryRouters.get('/getInventory', getInventoryController)

module.exports = InventoryRouters;