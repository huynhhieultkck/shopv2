// routes/bank.routes.js
const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bank.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', auth.user, auth.admin, bankController.list);
router.post('/', auth.user, auth.admin, bankController.add);
router.patch('/:id', auth.user, auth.admin, bankController.update);
router.delete('/:id', auth.user, auth.admin, bankController.del);
router.post('/view', auth.user, bankController.view);

module.exports = router;
