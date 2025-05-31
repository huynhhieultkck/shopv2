// routes/bank.routes.js
const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bank.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminOnly = require('../middlewares/adminOnly');

router.get('/', authMiddleware, adminOnly, bankController.listBanks);
router.post('/', authMiddleware, adminOnly, bankController.createBank);
router.patch('/:id', authMiddleware, adminOnly, bankController.updateBank);
router.delete('/:id', authMiddleware, adminOnly, bankController.deleteBank);
router.post('/sync', authMiddleware, adminOnly, bankController.syncAllBanks);

module.exports = router;
