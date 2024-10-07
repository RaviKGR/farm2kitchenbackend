const {
  addNewOfferServer,
  getOfferService,
  updateOfferService,
  deleteOfferService,
} = require("../../services/Offers/OfferService");

const addNewOfferController = async (req, res) => {
  const {
    offerName,
    description,
    discountType,
    discountValue,
    startDate,
    endDate,
    offerTag,
    tagId,
    isPrimary
  } = req.body;
  const image = req.file ? req.file.filename : null;
  try {
    if (
      !offerName ||
      !description ||
      !discountType ||
      !discountValue ||
      !startDate ||
      !endDate ||
      !offerTag ||
      !tagId
    ) {
      res.status(400).send({ message: "Required All Fields" });
    } else {
      await addNewOfferServer({...req.body, image},(err, data) => {
        if (err) res.status(400).send(err.error);
        else res.status(201).send(data);
      });
    }
  } catch (e) {
    throw e;
  }
};

const getOfferController = async (req, res) => {
  const { limit, offset } = req.query;
  try {
    if (!limit || !offset) {
      res.status(400).send("Required All The Fields");
    } else {
      await getOfferService(req.query, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (e) {
    throw e;
  }
};

const updateOfferConteroller = async (req, res) => {
  const {
    offerId,
    offerName,
    description,
    discountType,
    discountValue,
    startDate,
    endDate,
    id,
    offerTag,
    tagId,
  } = req.body;
  try {
    if (
      !offerId ||
      !offerName ||
      !description ||
      !discountType ||
      !discountValue ||
      !startDate ||
      !endDate ||
      !id ||
      !offerTag ||
      !tagId
    ) {
      res.status(400).send({ message: "Required All Fields" });
    } else {
      await updateOfferService(req.body, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (e) {
    throw e;
  }
};

const deleteOfferController = async (req, res) => {
  const { offerId } = req.query;
  try {
    if (!offerId) {
      res.status(400).send("Required All Fields");
    } else {
      await deleteOfferService(offerId, (err, data) => {
        if (err) res.status(400).send(err.error);
        else res.send(data);
      });
    }
  } catch (error) {
    throw error;
  }
};


module.exports = {
  addNewOfferController,
  getOfferController,
  updateOfferConteroller,
  deleteOfferController,
};
