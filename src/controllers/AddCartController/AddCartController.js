const {
  AddCartService,
  getCartService,
} = require("../../services/AddCartServices/AddCartServices");

const AddCartController = async (req, res) => {
  
  const { userId, variantId, counts } = req.query;
  try {
    if (!userId || !variantId || !counts) {
      return res.status(400).json({ message: "All fields are required" });
    } else {
      const result = await AddCartService(req.query);
      return res.status(result.status ?? 201).json(result);
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
const getCartController = async (req, res) => {
  const { userId } = req.query;
  try {
    const result = await getCartService(userId);
    if (!result || result.error) {
      console.error("Service error in getCartController:", result.error);
      return res.status(400).json({
        success: false,
        message: result.error || "Error retrieving cart data",
      });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getCartController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { AddCartController, getCartController };
