// controllers/order.controller.js
const Joi = require('joi');
const { Xcrud, Xerror, Xdb } = require('xsupport');
const { accountCRUD } = require('./account.controller');

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
const order = async (req, res) => {
  const orderId = await buyAccount({ ...req.body, user_id: req.user.id });
  return res.json({ success: true, orderId });
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
  await CRUD.update(req.params.id, req.body, ['user_id', 'total_price']);
  return res.json({ success: true });
}
const del = async (req, res) => {
  await CRUD.del(req.params.id);
  return res.json({ success: true });
}
module.exports = {
  client: { order, listOrder, viewOrder },
  admin: { create, list, count, view, update, del }
};


const buyAccount = async (data) => {
  const schema = Joi.object({
    user_id: Joi.number().integer(),
    category_id: Joi.number().integer(),
    quantity: Joi.number().integer().min(1)
  });
  const { user_id, category_id, quantity } = CRUD.validate(schema, data, ['user_id', 'category_id', 'quantity'])

  //Kiểm tra category và số lượng account
  const [category] = await Xdb.select('categories', ['id', 'price', 'available'], 'id = ? AND enabled = ?', [category_id, true]);
  if (!category) throw new Xerror('Category không tồn tại !', { status: 403 });
  if (category.available < quantity) throw new Xerror('Số lượng account không đủ !', { status: 500 });

  //Kiểm tra balance
  const [{ balance }] = await Xdb.select('users', ['balance'], 'id = ?', [user_id]);
  const total = quantity * category.price;
  if (!balance || balance < total) throw new Xerror('Số dư không đủ !', { status: 500 });
  const result = await Xdb.transaction(async (tx) => {
    const orderId = await tx.insert('orders', { user_id: user_id, total_price: total });
    const affectedRows = await tx.update('accounts', { status: 'sold', order_id: orderId }, 'category_id = ? AND status = ?', [category_id, 'available'], quantity);
    if (affectedRows < quantity) throw CRUD.E.create;
    await tx.query('UPDATE users SET balance = balance - ? WHERE id = ?', [total, user_id]);
    return orderId;
  });
  return result;
}