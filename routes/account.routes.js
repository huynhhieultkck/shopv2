// routes/account.routes.js
const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', auth.user, auth.admin, accountController.list);
router.post('/', auth.user, auth.admin, accountController.add);
router.patch('/:id', auth.user, auth.admin, accountController.update);
router.delete('/:id', auth.user, auth.admin, accountController.del);

module.exports = router;
