// controllers/bank.controller.js
const Joi = require('joi');
const { Xcrud } = require('xsupport');

const schema = Joi.object({
    name: Joi.string(),
    code: Joi.string(),
    account_number: Joi.string(),
    password: Joi.string(),
    token: Joi.string(),
    enabled: Joi.boolean()
});
const CRUD = new Xcrud('banks', schema);

// Client
const listBank = async (req, res) => {
    const banks = await CRUD.read({ ...req.query, enabled: true }, [], ['id', 'name', 'code', 'account_number']);
    return res.json({ success: true, banks });
}
// Admin
const create = async (req, res) => {
    const bankId = await CRUD.create(req.body, ['name', 'code', 'account_number', 'password', 'token']);
    return res.json({ success: true, bankId });
}
const list = async (req, res) => {
    const banks = await CRUD.read(req.query);
    return res.json({ success: true, banks });
}
const count = async (req, res) => {
    const result = await CRUD.read({ ...req.query, count: true });
    return res.json({ success: true, count: result })
}
const view = async (req, res) => {
    const [bank] = await CRUD.read({ id: req.params.id }, ['id']);
    return res.json({ success: true, bank });
}
const update = async (req, res) => {
    await CRUD.update(req.params.id, req.body);
    return res.json({ success: true });
}
const del = async (req, res) => {
    await CRUD.del(req.params.id);
    return res.json({ success: true });
}
module.exports = {
    bankCRUD: CRUD,
    client: { listBank },
    admin: { create, list, count, view, update, del }
};

