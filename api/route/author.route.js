const express = require('express');
const router = express.Router();
const authorController = require('../controllers/author/author.controller');
const { isAuth, isAdmin } = require('../utils');

router.get('/', authorController.getAllAuthor);
router.get('/:id', authorController.getSpecificAuthor);
router.post('/', isAuth, isAdmin, authorController.addAuthor);
router.patch('/:id', isAuth, isAdmin, authorController.updateAuthor);
router.delete('/:id', isAuth, isAdmin, authorController.deleteAuthor);

module.exports = router;