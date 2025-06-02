// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const Xerror = require('../config/Xerror');
const SECRET = process.env.JWT_SECRET || 'secretkey';

const user = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw Xerror.Token;

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) { throw Xerror.Token; }
}

const admin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') throw Xerror.Token;
    next();
};
module.exports = {
    user,
    admin
};

