const express = require("express");
const multer = require('multer');
const path = require('path');

const {
  addNewOfferController,
  getOfferController,
  updateOfferConteroller,
  deleteOfferController,
} = require("../controllers/Offer/offerController");
const OfferRouters = express.Router();

const offerStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const uploadOffer = multer({ storage: offerStorage });

OfferRouters.post("/createOffers", uploadOffer.single('image'), addNewOfferController);
OfferRouters.get("/getOffers", getOfferController);
OfferRouters.put("/updateOffer", updateOfferConteroller);
OfferRouters.delete("/deleteOffer", deleteOfferController);

module.exports = OfferRouters;
