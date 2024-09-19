const express = require('express');
const { addAuthenticationController, otpVerifiCationController } = require('../controllers/Categories/authenticationController');
const authenticationRouters = express.Router();
authenticationRouters.post('/postAuthentication', addAuthenticationController);
authenticationRouters.post('/otpverification', otpVerifiCationController)
module.exports = authenticationRouters;