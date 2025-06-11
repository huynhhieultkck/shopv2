// routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', auth.user, orderController.client.listOrder);
router.get('/:id', auth.user, orderController.client.viewOrder);
router.post('/create', auth.user, orderController.client.order);

module.exports = router;