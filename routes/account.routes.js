// routes/account.routes.js
const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminOnly = require('../middlewares/adminOnly');

router.get('/', accountController.list);
router.get('/:id', accountController.detail);
router.post('/', authMiddleware, adminOnly, accountController.create);
router.patch('/:id', authMiddleware, adminOnly, accountController.update);
router.delete('/:id', authMiddleware, adminOnly, accountController.remove);

module.exports = router;
