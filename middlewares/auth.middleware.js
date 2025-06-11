// middlewares/auth.middleware.js
const { Xerror, Xcode } = require("xsupport");
const SERECT = process.env.JWT_SECRET;

const user = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Xerror('Token không hợp lệ !', 401);

    try {
        req.user = Xcode.jwt.verify(authHeader.split(' ')[1], SERECT);
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

