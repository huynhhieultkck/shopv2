const Joi = require("joi");
const Xerror = require("../config/Xerror");
const Xdb = require("../config/Xdb");

// User
const user = {};

user.count = async (req, res) => {
    const schema = Joi.object({
        from_date: Joi.date(),
        to_date: Joi.date()
    });
    const { error, value: { from_date, to_date } } = schema.validate(req.query);
    if (error) throw new Xerror('Thông tin không hợp lệ !', 500);

    try {
        const where = '';
        const params = [];
        if (!!from_date && !!to_date) {
            where = 'created_at BETWEEN ? AND ?';
            params.push(from_date, to_date);
        }
        const count = await Xdb.selectCount('users', where, params);
        res.json({ success: true, count })
    } catch (err) { throw new Xerror('Không thể lấy số lượng user !', 500); }
}
user.list = async (req, res) => {
    const schema = Joi.object({
        id: Joi.number().integer(),
        email: Joi.string().email(),
        name: Joi.string(),
        role: Joi.string().valid('user', 'admin'),
        wallet: Joi.string(),
        from_date: Joi.date(),
        to_date: Joi.date(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20)
    });
    const { error, value: { id, email, name, role, wallet, from_date, to_date, page, limit } } = schema.validate(req.query);
    if (error) throw new Xerror('Thông tin không hợp lệ !', 500);

    try {
        const whereBuilder = new Xdb.whereBuilder();
        whereBuilder
            .add('id = ?', id)
            .add('email LIKE ?', `%${email}%`)
            .add('name LIKE ?', `%${name}%`)
            .add('role = ?', role)
            .add('wallet LIKE ?', `%${wallet}%`)
            .add('created_at BETWEEN ? AND ?', [from_date, to_date]);

        const users = await Xdb.select('users', [], whereBuilder.where(), whereBuilder.params(), { limit, offset: (page - 1) * limit });
        res.json({ success: true, users });
    } catch (err) { throw new Xerror('Không thể lấy danh sách user !', 500); }

}
user.update = (req, res) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(100),
        password: Joi.string().min(6),
        role: Joi.string().valid('user', 'admin')
    });
    const { error, value: { name, password, role } } = schema.validate(req.query);
    if (error) throw new Xerror('Thông tin không hợp lệ !', 500);

    try {

    } catch (err) { throw new Xerror('Không thể cập nhật user !', 500); }

}


module.exports = {
    user
}