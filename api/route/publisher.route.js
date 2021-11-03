const express = require('express');
const router = express.Router();
const PublisherController = require('../controllers/publisher/publisher.controller');
const { isAuth, isAdmin } = require('../utils');

router.get('/', PublisherController.getAllPublisher);
router.get('/:id', PublisherController.getSpecificPublisher);
router.post('/', isAuth, isAdmin, PublisherController.addPublisher);
router.patch('/:id', isAuth, isAdmin, PublisherController.updatePublisher);
router.delete('/:id', isAuth, isAdmin, PublisherController.deletePublisher);

module.exports = router;