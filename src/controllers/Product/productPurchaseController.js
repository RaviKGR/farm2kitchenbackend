const {
  addNewPurchaseService,
  getPurchaseDetailService,
} = require("../../services/Product/productPurchaseServices");

const addNewPurchaseController = async (req, res) => {
  const { variantId, quantity, purchasePrice, HST, purchaseDate } = req.body;
  try {
    if (!variantId || !quantity || !purchasePrice || !HST || !purchaseDate) {
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

module.exports = {
  addNewPurchaseController,
  getPurchaseDetailController,
};
