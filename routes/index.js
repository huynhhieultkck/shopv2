const express = require('express');
const router = express.Router();

router.use('/auth', require('./user.routes'));
router.use('/wallet', require('./wallet.routes'));
router.use('/accounts', require('./account.routes'));
router.use('/categories', require('./category.routes'));
router.use('/orders', require('./order.routes'));
router.use('/banks', require('./bank.routes'));

module.exports = router;
