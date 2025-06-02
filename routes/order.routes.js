// routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/', auth.user, orderController.create);
router.get('/', auth.user, orderController.list);
router.get('/:id', auth.user, orderController.orderDetail);

module.exports = router;