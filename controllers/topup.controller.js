// controllers/bank.controller.js
const Joi = require('joi');
const { Xcrud } = require('xsupport');

const schema = Joi.object({
    user_id: Joi.number().integer(),
    amount: Joi.number().integer(),
    bank_transaction_id: Joi.string(),
    description: Joi.string()
});
const CRUD = new Xcrud('topup', schema);

// Client
const listTopup = async (req, res) => {
    const topups = await CRUD.read({ ...req.query, user_id: req.user.id }, [], ['user_id']);
    return res.json({ success: true, topups });
}
// Admin
const create = async (req, res) => {
    const topupId = await CRUD.create(req.body, ['user_id', 'amount', 'bank_transaction_id']);
    return res.json({ success: true, topupId });
}
const list = async (req, res) => {
    const topups = await CRUD.read(req.query);
    return res.json({ success: true, topups });
}
const count = async (req, res) => {
    const result = await CRUD.read({ ...req.query, count: true });
    return res.json({ success: true, count: result })
}
const view = async (req, res) => {
    const [topup] = await CRUD.read({ id: req.params.id }, ['id']);
    return res.json({ success: true, topup });
}
const update = async (req, res) => {
    await CRUD.update(req.params.id, req.body,['description']);
    return res.json({ success: true });
}
const del = async (req, res) => {
    await CRUD.del(req.params.id);
    return res.json({ success: true });
}
module.exports = {
    client: { listTopup },
    admin: { create, list, count, view, update, del }
};

