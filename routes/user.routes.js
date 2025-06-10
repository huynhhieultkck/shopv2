// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { client } = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/register', client.register);
router.post('/login', client.login);
router.get('/profile', auth.user, client.profile);
router.patch('/password', auth.user, client.updatePassword);


module.exports = router;
