// controllers/bank.controller.js
const Xdb = require('../config/Xdb');
const Joi = require('joi');
const Xerror = require('../config/Xerror');

// -----Admin-----
const list = async (req, res) => {
    try {
        const banks = await Xdb.select('banks');
        return res.json({ success: true, banks });
    } catch (err) { throw Xerror('Lấy danh sách banks không thành công !', 500); }
}
const add = async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        code: Joi.string().valid('vietcombank', 'bidv', 'mbbank', 'acb', 'techcombank').required(),
        account_number: Joi.string().required(),
        password: Joi.string().required(),
        token: Joi.string().required(),
        enabled: Joi.boolean().default(true)
    });
    const { error, value } = schema.validate(req.body);
    if (error) throw new Xerror('Thông tin không hợp lệ !', 403);

    try {
        const bankId = await Xdb.insert('banks', value);
        return res.json({ success: true, id: bankId, message: 'Thêm banks thành công !' });
    } catch (err) { throw new Xerror('Thêm banks không thành công !', 500); }
}
const update = async (req, res) => {
    const id = req.params.id;
    const schema = Joi.object({
        name: Joi.string(),
        account_number: Joi.string(),
        password: Joi.string(),
        token: Joi.string(),
        enabled: Joi.boolean()
    });
    const { error, value } = schema.validate(req.body);
    if (error) throw new Xerror('Thông tin không hợp lệ !', 403);

    try {
        await Xdb.update('banks', value, 'id = ?', [id]);
        return res.json({ success: true, message: 'Cập nhật banks thành công !' });
    } catch (err) { throw new Xerror('Cập nhật banks thành công !', 500); }
}
const del = async (req, res) => {
    try {
        const id = req.params.id;
        await Xdb.delete('banks', 'id = ?', [id]);
        return res.json({ success: true, message: 'Xoá banks thành công !' });
    } catch (err) { throw new Xerror('Xoá banks thành công !', 500); }
}

// ----- Public-----
const view = async (req, res) => {
    try {
        const banks = await Xdb.select('banks', ['id', 'name', 'code', 'account_number'], 'enabled = ?', [true]);
        return res.json({ success: true, banks });
    } catch (err) { throw new Xerror('Lấy danh sách banks thành công !', 500); }
}
module.exports = {
    list,
    add,
    update,
    del,
    view
};
