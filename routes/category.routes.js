// routes/category.routes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', categoryController.client.listCategory);

module.exports = router;
