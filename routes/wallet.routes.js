// routes/wallet.routes.js
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/balance', auth.user, walletController.balance);
router.get('/history', auth.user, walletController.topupHistory);

module.exports = router;
