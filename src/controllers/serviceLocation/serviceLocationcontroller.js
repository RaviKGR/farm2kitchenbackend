const { NewServieLocationService } = require("../../services/serviceLocation/serviceLocationService");

const NewServieLocationController = async (req, res) => {
  const { city, postalCode, devileryDay } = req.body;
  try {
    if (!city || !postalCode || !devileryDay) {
      res.status(400).send({ message: "Required All Fields" });
    } else {
      await NewServieLocationService(req.body, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.status(201).send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};

module.exports = { NewServieLocationController };
