const {
  addNewPurchaseService,
  getPurchaseDetailService,
  deletePurchaseProductService,
} = require("../../services/Product/productPurchaseServices");

const addNewPurchaseController = async (req, res) => {
  const { variantId, quantity, purchasePrice, HST, purchaseDate, vendor } = req.body;
  try {
    if (!variantId || !quantity || !purchasePrice || !HST || !purchaseDate || !vendor) {
      res.status(400).send({ message: "All fields are required" });
    } else {
      await addNewPurchaseService(req.body, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.status(201).send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};

const getPurchaseDetailController = async (req, res) => {
  const { limit, offset } = req.query;
  try {
    if (!limit || !offset) {
      res.status(400).send({ message: "All fields are required" });
    } else {
      await getPurchaseDetailService(req.query, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.status(200).send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};

const deletePurchaseProductController = async (req, res) => {
  const { purchaseId } = req.query;
  try {
    if(!purchaseId) {
      res.status(400).send({message: "All fields are required"})
    } else {
     const result = await deletePurchaseProductService(purchaseId);
     return res.status(result.success ? 200 : 400).json(result)
    }
  } catch (e) {
    
  }
}

module.exports = {
  addNewPurchaseController,
  getPurchaseDetailController,
  deletePurchaseProductController
};
