// controllers/order.controller.js
const Joi = require('joi');
const { Xcrud, Xerror } = require('xsupport');
const { accountCRUD } = require('./account.controller');
const { client } = require('./user.controller');

const schema = Joi.object({
  user_id: Joi.number().integer(),
  total_price: Joi.number().integer()
});
const CRUD = new Xcrud('orders', schema);
// Client
const listOrder = async (req, res) => {
  const orders = await CRUD.read({ ...req.query, user_id: req.user.id }, ['user_id']);
  return res.json({ success: true, orders });
}
const viewOrder = async (req, res) => {
  const [order] = await CRUD.read({ id: req.params.id, user_id: req.user.id }, ['id', 'user_id']);
  if (!order) return new Xerror('Đơn hàng không tồn tại !', { status: 403 });
  order.accounts = await accountCRUD.read({ order_id: order.id }, ['order_id'], ['data']);
  return res.json({ success: true, order });
}
// Admin
const create = async (req, res) => {
  const ordertId = await CRUD.create(req.body, ['user_id', 'total_price']);
  return res.json({ success: true, ordertId });
}
const list = async (req, res) => {
  const orders = await CRUD.read(req.query);
  return res.json({ success: true, orders });
}
const count = async (req, res) => {
  const result = await CRUD.read({ ...req.query, count: true });
  return res.json({ success: true, count: result })
}
const view = async (req, res) => {
  const [order] = await CRUD.read({ id: req.params.id }, ['id']);
  return res.json({ success: true, order });
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
  client: { listOrder, viewOrder },
  admin: { create, list, count, view, update, del }
};

