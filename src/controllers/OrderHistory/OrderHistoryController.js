const {
  getOrderHistoryServieces,
  getAllOrderHistoryService,
  getAllOrderHistoryByIdService,
  updateOrderStatusService,
  getOrderItemsByOrderIdService,
  getOrderHistomerByUserIdService,
} = require("../../services/OrderHistory/OrderHistoryServieces");

const getOrderHistoryController = async (req, res) => {
  try {
    const userId = req.query.userId;
    const input = { userId };

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await getOrderHistoryServieces(input);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getOrderHistoryController:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve order history",
    });
  }
};

const getAllOrderHistoryController = async (req, res) => {
  const {
    limit,
    offset,
    orderNumber,
    deliveryDate,
    phoneNumber,
    email,
    status,
  } = req.query;
  try {
    if (!limit || !offset) {
      res.status(400).send({ message: "Required All Fields" });
    } else {
      const result = await getAllOrderHistoryService(req.query);
      return res.status(200).json(result);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllOrderHistoryByIdController = async (req, res) => {
  const { orderId } = req.query;
  try {
    if (!orderId) {
      res.status(400).send({ message: "Required All Fields" });
    } else {
      const result = await getAllOrderHistoryByIdService(orderId);
      return res.status(200).json(result);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateOrderStatusController = async (req, res) => {
  const { orderId, orderStatus } = req.query;
  try {
    if (!orderId || !orderStatus) {
      res.status(400).send({ message: "Required All Fields" });
    } else {
      const result = await updateOrderStatusService(req.query);
      return res.status(200).json(result);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getOrderItemsByOrderIdController = async (req, res) => {
  const {orderId} = req.query;
  try {
    if(!orderId) {
      res.status(400).send({ message: "Required All Fields" });
    }  else {
      const result = await getOrderItemsByOrderIdService(orderId);
      return res.status(200).json(result);
    }
  } catch (e) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getOrderHistomerByUserIdController = async (req, res) => {
    try {
      const result = await getOrderHistomerByUserIdService(req.query);
      return res.status(200).json(result)
    } catch (e) {
      console.error(e);
      return res.status(500).json({message: "Internal server error"})
    }
}
module.exports = {
  getOrderHistoryController,
  getAllOrderHistoryController,
  getAllOrderHistoryByIdController,
  updateOrderStatusController,
  getOrderItemsByOrderIdController,
  getOrderHistomerByUserIdController
};
