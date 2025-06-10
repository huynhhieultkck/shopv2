// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const bankController = require('../controllers/bank.controller');
const categoryController = require('../controllers/category.controller');
const accountController = require('../controllers/account.controller');
const orderController = require('../controllers/order.controller');
const topupController = require('../controllers/topup.controller');

const { user, admin } = require('../middlewares/auth.middleware');

// Users
router.get('/users', user, admin, userController.admin.list);
router.get('/users/count', user, admin, userController.admin.count);
router.post('/users', user, admin, userController.admin.create);
router.get('/users/:id', user, admin, userController.admin.view);
router.patch('/users/:id', user, admin, userController.admin.update);
router.delete('/users/:id', user, admin, userController.admin.del);

// Banks
router.get('/banks', user, admin, bankController.admin.list);
router.get('/banks/count', user, admin, bankController.admin.count);
router.post('/banks', user, admin, bankController.admin.create);
router.get('/banks/:id', user, admin, bankController.admin.view);
router.patch('/banks/:id', user, admin, bankController.admin.update);
router.delete('/banks/:id', user, admin, bankController.admin.del);

// Categories
router.get('/categories', user, admin, categoryController.admin.list);
router.get('/categories/count', user, admin, categoryController.admin.count);
router.post('/categories', user, admin, categoryController.admin.create);
router.get('/categories/:id', user, admin, categoryController.admin.view);
router.patch('/categories/:id', user, admin, categoryController.admin.update);
router.delete('/categories/:id', user, admin, categoryController.admin.del);

// Accounts
router.get('/accounts', user, admin, accountController.admin.list);
router.get('/accounts/count', user, admin, accountController.admin.count);
router.post('/accounts', user, admin, accountController.admin.create);
router.get('/accounts/:id', user, admin, accountController.admin.view);
router.patch('/accounts/:id', user, admin, accountController.admin.update);
router.delete('/accounts/:id', user, admin, accountController.admin.del);

// Orders
router.get('/orders', user, admin, orderController.admin.list);
router.get('/orders/count', user, admin, orderController.admin.count);
router.post('/orders', user, admin, orderController.admin.create);
router.get('/orders/:id', user, admin, orderController.admin.view);
router.patch('/orders/:id', user, admin, orderController.admin.update);
router.delete('/orders/:id', user, admin, orderController.admin.del);

// Orders
router.get('/topups', user, admin, topupController.admin.list);
router.get('/topups/count', user, admin, topupController.admin.count);
router.post('/topups', user, admin, topupController.admin.create);
router.get('/topups/:id', user, admin, topupController.admin.view);
router.patch('/topups/:id', user, admin, topupController.admin.update);
router.delete('/topups/:id', user, admin, topupController.admin.del);


module.exports = router;
