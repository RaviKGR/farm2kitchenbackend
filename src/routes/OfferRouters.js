const express = require('express');
const { addNewOfferController, getOfferController, updateOfferConteroller, deleteOfferController } = require('../controllers/Offer/offerController');
const OfferRouters = express.Router();

OfferRouters.post('/createOffers', addNewOfferController);
OfferRouters.get('/getOffers', getOfferController);
OfferRouters.put('/updateOffer', updateOfferConteroller);
OfferRouters.delete('/deleteOffer', deleteOfferController)

module.exports = OfferRouters;