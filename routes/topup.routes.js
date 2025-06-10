// routes/wallet.routes.js
const express = require('express');
const router = express.Router();
const topupController = require('../controllers/topup.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', auth.user, topupController.client.listTopup);

module.exports = router;
