const express = require('express');
const itemsController = require('../controllers/itemsController');

const router = express.Router();

router
  .route('/')
  .get(itemsController.getAllItems)
  .post(itemsController.createItem);

router
  .route('/:id')
  .get(itemsController.getItem);

module.exports = router;