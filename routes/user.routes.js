// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', auth.user, userController.profile);
router.patch('/profile', auth.user, userController.update);

module.exports = router;
