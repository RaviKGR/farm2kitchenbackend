const express = require('express');
const { getUserDetailController, updateUserDetailController, addNewUserByAdminController, getUserController, SearchUserDetailController } = require('../controllers/UserDetails/UserDetailsController');
const userDetailRouters = express.Router();

userDetailRouters.get('/getuserDetails', getUserDetailController);
userDetailRouters.put('/updateuserDetails', updateUserDetailController);
// ADMIN 
userDetailRouters.post('/addNewUserByAdmin', addNewUserByAdminController);
userDetailRouters.get('/getUser', getUserController)
userDetailRouters.get('/searchuserDetails', SearchUserDetailController);

module.exports = userDetailRouters;