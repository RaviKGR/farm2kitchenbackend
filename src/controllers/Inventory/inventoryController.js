const { updateInventoryService, getInventoryService } = require("../../services/Inventory/inventoryServices");


const updateInventoryController = async (req, res) => {
    
    const {inventoryId, quantityInStock, price, reorderLevel, discountPercentage} = req.body;
    
    try {
      if (!inventoryId || !quantityInStock || !price || !reorderLevel || !discountPercentage) {
        res.status(400).send({ message: "Required All Fields" });
      } else {
        await updateInventoryService(req.body, (err, data) => {
          if (err) res.status(400).send(err.error);
          else res.send(data);
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const getInventoryController = async (req, res) => {
    const {limit, offset, categoryId, productName, parentCategoryId} = req.query;    
        try {
            if(!limit || !offset) {
                res.status(400).send({ message: "Required All Fields" });
            } else {
                await getInventoryService(req.query, (err, data) => {
                    if (err) res.status(400).send(err.error);
                    else res.send(data);
                })
            }
        } catch (e) {
            throw (e);
        }
  }

  module.exports = {updateInventoryController, getInventoryController}