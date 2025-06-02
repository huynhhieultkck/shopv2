// routes/category.routes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', categoryController.list);
router.get('/view', categoryController.view);
router.post('/', auth.user, auth.admin, categoryController.add);
router.patch('/:id', auth.user, auth.admin, categoryController.update);
router.delete('/:id', auth.user, auth.admin, categoryController.del);

module.exports = router;
