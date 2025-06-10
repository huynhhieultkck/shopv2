const express = require('express');
const router = express.Router();

router.use('/user', require('./user.routes'));
router.use('/topup', require('./topup.routes'));
router.use('/accounts', require('./account.routes'));
router.use('/categories', require('./category.routes'));
router.use('/orders', require('./order.routes'));
router.use('/banks', require('./bank.routes'));
router.use('/admin', require('./admin.routes'));

module.exports = router;
