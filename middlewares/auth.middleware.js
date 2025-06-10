// middlewares/auth.middleware.js
const Xerror = require('../config/Xerror');
const Xsp = require('../config/Xsp');

const user = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Xerror('Token không hợp lệ !', 401);

    try {
        req.user = Xsp.token.verify(authHeader.split(' ')[1]);
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

