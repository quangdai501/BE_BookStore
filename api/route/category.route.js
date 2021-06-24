const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category/category.controller');
const { isAuth, isAdmin } = require('../utils');

router.get('/', categoryController.getAllCategory);
router.get('/:id', categoryController.getSpecificCategory);
router.post('/', isAuth, isAdmin, categoryController.addCategory);
router.patch('/:id', isAuth, isAdmin, categoryController.updateCategory);
router.delete('/:id', isAuth, isAdmin, categoryController.deleteCategory);

module.exports = router;
