const {
  addNewImageservice,
  getImageService,
} = require("../../services/imageService/imageService");

const addNewImageController = async (req, res) => {
  const { imageId, imageTag, altText } = req.body;
  const image = req.file ? req.file.filename : null;
  try {
    if (
      !imageId ||
      !imageTag ||
      !altText ||
      !image
    ) {
      res.status(400).send({ message: "All fields are required" });
    } else {
      const result = await addNewImageservice({
        ...req.body,
        image
      });
      return res.status(result.status).json(result);
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getImageController = async (req, res) => {
  try {
    const result = await getImageService();
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { addNewImageController, getImageController };
