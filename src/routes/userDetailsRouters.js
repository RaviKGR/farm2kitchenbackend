const express = require('express');
const { getUserDetailController, updateUserDetailController, addNewUserByAdminController, getUserController, SearchUserDetailController, getAllUserdetailsController, addAddressByUserIdController, getCustomerAddressByIdController, updateAllUserInfoController, updateUserAddressDefaultController } = require('../controllers/UserDetails/UserDetailsController');
const userDetailRouters = express.Router();

userDetailRouters.get('/getuserDetails', getUserDetailController);
userDetailRouters.put('/updateuserDetails', updateUserDetailController);
userDetailRouters.get('/getAllUserDetails', getAllUserdetailsController);
userDetailRouters.put('/updateUserInfo', updateAllUserInfoController);
userDetailRouters.put('/updateUserAddressDefault', updateUserAddressDefaultController)
// ADMIN 
userDetailRouters.post('/addNewUserByAdmin', addNewUserByAdminController);
userDetailRouters.get('/getUser', getUserController)
userDetailRouters.get('/searchuserDetails', SearchUserDetailController);
userDetailRouters.post('/addAddressByUserId', addAddressByUserIdController)
userDetailRouters.get('/getcustomerAddressbyId', getCustomerAddressByIdController);

module.exports = userDetailRouters;