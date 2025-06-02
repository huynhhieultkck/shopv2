// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const Xerror = require('../config/Xerror');
const SECRET = process.env.JWT_SECRET || 'ngohuynhhieu';

const user = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Xerror('Token không hợp lệ !', 401);

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) { throw new Xerror('Token không hợp lệ !', 401); }
}

const admin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') throw new Xerror('Token không hợp lệ !', 401);
    next();
};
module.exports = {
    user,
    admin
};

