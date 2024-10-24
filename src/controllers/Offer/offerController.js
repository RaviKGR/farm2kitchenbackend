const {
  addNewOfferServer,
  getOfferService,
  updateOfferService,
  deleteOfferService,
  getAllOffersService,
  getCategoryOfferService,
} = require("../../services/Offers/OfferService");

const addNewOfferController = async (req, res) => {
  
  const {
    offerName,
    description,
    discountType,
    discountValue,
    startDate,
    endDate,
    items,
    imageTag,
    isPrimary
  } = req.body;

  const image = req.file ? req.file.filename : null;
console.log(req.body);


  try {
    if (
      !offerName ||
      !description ||
      !discountType ||
      !discountValue ||
      !startDate ||
      !endDate ||
      !imageTag ||
      !items.length === 0
    ) {
      res.status(400).send({ message: "Required All Fields" });
    } else {
     const result = await addNewOfferServer({...req.body, image});
      return res.status(result.status).json(result);
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error"} )
  }
};

const getOfferController = async (req, res) => {
  const { limit, offset, offerName, startDate, endDate } = req.query;
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
    discountValue,
    startDate,
    endDate
  } = req.body;
  try {
    if (
      !offerId ||
      !offerName ||
      !description ||
      !discountValue ||
      !startDate ||
      !endDate
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

// customer 
const getAllOffersController = async (req, res) => {
  try {
    const result = await getAllOffersService();
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({message: "Internal server error"})
  }
}

const getCategoryOffersController = async (req, res) => {
  try {
    const result = await getCategoryOfferService();
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({message: "Internal server error"})
  }
}



module.exports = {
  addNewOfferController,
  getOfferController,
  updateOfferConteroller,
  deleteOfferController,
  getAllOffersController,
  getCategoryOffersController
};
