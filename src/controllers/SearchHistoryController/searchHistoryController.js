const {
  createSearchHistoryService,
  getSearchHistoryService,
} = require("../../services/SearchHistoryService/searchHistoryService");

const createSearchHistoryController = async (req, res) => {
  const { user_id, productId } = req.body;
  try {
    if (!user_id || !productId) {
      res.status(400).send({ message: "All fields are required" });
    } else {
      const result = await createSearchHistoryService(req.body);
      return res.status(201).json(result);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getSearchHistoryContoller = async (req, res) => {
  const {user_id, limit, offset } = req.query;
  try {
    if(!user_id || !limit || !offset) {
        res.status(400).send({ message: "All fields are required" });
    } else {
        const result = await getSearchHistoryService(req.query);
        return res.status(200).json(result);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createSearchHistoryController, getSearchHistoryContoller };
