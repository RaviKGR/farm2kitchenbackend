const {
  CreatePlaceOrder,
  CreatePlaceOrderForCustomerService,
} = require("../../services/PlaceOrder/PlaceOrderServices");

const PlaceOrderController = async (req, res) => {
  const { products } = req.body;
//   const AllProduct = Array.isArray(products) ? products : [products];
  try {
    const result = await CreatePlaceOrder(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const PlaceOrderForCustomerController = async (req, res) => {
  const { products } = req.body;
//   const AllProduct = Array.isArray(products) ? products : [products];

  try {
    const result = await CreatePlaceOrderForCustomerService(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
module.exports = { PlaceOrderController, PlaceOrderForCustomerController };
