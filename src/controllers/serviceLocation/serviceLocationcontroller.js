const {
  NewServieLocationService,
  getServiceLocationService,
} = require("../../services/serviceLocation/serviceLocationService");

const NewServieLocationController = async (req, res) => {
  const { city, postalCode, Notification} = req.body;
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

module.exports = { NewServieLocationController, getServiceLocationController };
