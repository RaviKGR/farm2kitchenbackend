const express = require('express');
const { addAuthenticationController, otpVerifiCationController, userLoginController, signOutController, geustSignController, googleAuthenticationController, createUserController } = require('../controllers/Authentication/authenticationController');
const authenticationRouters = express.Router();
authenticationRouters.post('/postAuthentication', addAuthenticationController);
authenticationRouters.post('/otpverification', otpVerifiCationController);
authenticationRouters.post('/loginverification', userLoginController);
authenticationRouters.post("/signout", signOutController);
authenticationRouters.post('/gestsignin', geustSignController);
authenticationRouters.post('/googleAuthentication', googleAuthenticationController);
authenticationRouters.post('/createUser', createUserController);


module.exports = authenticationRouters;