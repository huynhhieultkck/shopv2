// routes/category.routes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminOnly = require('../middlewares/adminOnly');

router.get('/', categoryController.list);
router.get('/tree', categoryController.tree);
router.post('/', authMiddleware, adminOnly, categoryController.create);
router.patch('/:id', authMiddleware, adminOnly, categoryController.update);
router.delete('/:id', authMiddleware, adminOnly, categoryController.remove);

module.exports = router;
