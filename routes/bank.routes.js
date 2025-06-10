// routes/bank.routes.js
const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bank.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', bankController.client.listBank);

module.exports = router;
