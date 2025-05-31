// routes/wallet.routes.js
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/balance', authMiddleware, walletController.getBalance);
router.post('/topup', authMiddleware, walletController.topupRequest);
router.get('/history', authMiddleware, walletController.topupHistory);

module.exports = router;
