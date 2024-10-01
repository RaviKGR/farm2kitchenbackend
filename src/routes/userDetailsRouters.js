const express = require('express');
const { getUserDetailController, updateUserDetailController, addNewUserByAdminController, getUserController } = require('../controllers/UserDetails/UserDetailsController');
const userDetailRouters = express.Router();

userDetailRouters.get('/getuserDetails', getUserDetailController);
userDetailRouters.put('/updateuserDetails', updateUserDetailController);
// ADMIN 
userDetailRouters.post('/addNewUserByAdmin', addNewUserByAdminController);
userDetailRouters.get('/getUser', getUserController)

module.exports = userDetailRouters;