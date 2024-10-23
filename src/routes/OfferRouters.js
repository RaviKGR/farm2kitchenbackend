const express = require("express");
const multer = require('multer');
const path = require('path');

const {
  addNewOfferController,
  getOfferController,
  updateOfferConteroller,
  deleteOfferController,
  getAllOffersController,
} = require("../controllers/Offer/offerController");
const { addNewCouponConnteroller, getCouponOfferController, getCouponOfferByIdController, getCouponOfferByUserIdController, updateCouponOfferConteroller, deleteCouponOfferController } = require("../controllers/Offer/couponOfferController");
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

//  Customer API

OfferRouters.get('/getAllOffers', getAllOffersController)

//        Coupon offer routers

OfferRouters.post("/createCouponOffer", addNewCouponConnteroller);
OfferRouters.get("/getCouponOffer", getCouponOfferController);
OfferRouters.get("/getCouponOfferById", getCouponOfferByIdController);
OfferRouters.get("/getCouponOfferByUserId", getCouponOfferByUserIdController);
OfferRouters.put("/updateCouponOffer", updateCouponOfferConteroller);
OfferRouters.delete("/deleteCouponoffer", deleteCouponOfferController)

module.exports = OfferRouters;
