const express = require('express');
const addAuthenticationController = require('../../controllers/AuthenticationController/authenticationController');
const authenticationRouters = express.Router();
authenticationRouters.post('/postAuthentication', addAuthenticationController);
module.exports = authenticationRouters;