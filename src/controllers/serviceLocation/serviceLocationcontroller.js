const {
  NewServieLocationService,
  getServiceLocationService,
  getDeliveryDateService,
  UpdateDeliveryServiceLocation,
} = require("../../services/serviceLocation/serviceLocationService");

const NewServieLocationController = async (req, res) => {
  const { city, postalCode, Notification } = req.body;
  const devileryDay = req.body.devileryDay
    .split("")
    .slice(0, 3)
    .join("")
    .toUpperCase();

  try {
    if (!city || !postalCode || !devileryDay || !Notification) {
      res.status(400).send({ message: "All fields are required" });
    } else {
      const result = await NewServieLocationService({
        ...req.body,
        devileryDay,
      });
      return res.status(result.success ? 201 : 400).json(result);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getServiceLocationController = async (req, res) => {
  try {
    const result = await getServiceLocationService();
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getDeliveryDateController = async (req, res) => {
  const { addressId } = req.query;
  try {
    if (!addressId) {
      res.status(400).send({ message: "All fields are required" });
    } else {
      const result = await getDeliveryDateService(addressId);
      return res.status(200).json(result);
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const UpdateServiceLocationController = async (req, res) => {
  try {
    const { location_id, city, postal_code, delivery_date, Notification } =
      req.body;
    if (
      !location_id ||
      !city ||
      !postal_code ||
      !delivery_date ||
      !Notification
    ) {
      return res.status(400).send({ message: "All fields are required" });
    }
    const result = await UpdateDeliveryServiceLocation(req.body);
    if (result) {
      return res.status(result.status).json({
        success: result.success,
        message: result.message,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
module.exports = {
  NewServieLocationController,
  getServiceLocationController,
  getDeliveryDateController,
  UpdateServiceLocationController,
};
