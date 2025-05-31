// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', authMiddleware, userController.logout);
router.get('/me', authMiddleware, userController.me);
router.patch('/me', authMiddleware, userController.updateMe);

module.exports = router;
