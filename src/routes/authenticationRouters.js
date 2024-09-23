const express = require('express');
const { addAuthenticationController, otpVerifiCationController, userLoginController, signOutController } = require('../controllers/Authentication/authenticationController');
const authenticationRouters = express.Router();
authenticationRouters.post('/postAuthentication', addAuthenticationController);
authenticationRouters.post('/otpverification', otpVerifiCationController);
authenticationRouters.post('/loginverification', userLoginController);
authenticationRouters.post("/signout", signOutController);

module.exports = authenticationRouters;