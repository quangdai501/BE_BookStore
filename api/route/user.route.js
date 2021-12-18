const express = require('express');
const router = express.Router();
const userController = require('../controllers/user/user.controller');
const { isAuth, isAdmin } = require('../utils');

// get all users
router.get('/', isAuth, isAdmin, userController.getAllUsers);
//get userinfo
router.get('/getuser-info/', isAuth, userController.getUserInfoByID);
//update userinfo
router.patch('/update-info/:userID', isAuth, userController.updateUserInfo);
// router.patch('/update-info/:userID', isAuth, userController.updateUserInfo);
// create new user
router.post('/add-user', userController.addUser);

// delete user by id
router.delete('/:id', isAuth, isAdmin, userController.deleteUser);

router.patch('/update-password', userController.updatePassword);

module.exports = router;