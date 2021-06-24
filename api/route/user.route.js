const express = require('express');
const router = express.Router();
const userController = require('../controllers/user/user.controller');
const { isAuth, isAdmin } = require('../utils');

// get account by userID
router.get('/get-account/:userID', userController.getAccountByUserID);

//patch update accout
router.patch('/update-account/:userID', userController.updateAccountByUserID);
// get all users
router.get('/', isAuth, isAdmin, userController.getAllUsers);
//get userinfo

//update userinfo
router.patch('/update-info/:userID', userController.updateUserInfo);
// router.patch('/update-info/:userID', isAuth, userController.updateUserInfo);
// create new user
router.post('/add-user', userController.addUser);

// delete user by id
router.delete('/:id', isAuth, isAdmin, userController.deleteUser);

router.patch('/update-password', userController.updatePassword);

module.exports = router;