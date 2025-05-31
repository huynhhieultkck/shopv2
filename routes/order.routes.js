// routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/', authMiddleware, orderController.create);
router.get('/my', authMiddleware, orderController.myOrders);
router.get('/:id', authMiddleware, orderController.orderDetail);

module.exports = router;