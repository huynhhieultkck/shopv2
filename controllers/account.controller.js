// controllers/account.controller.js
const Joi = require('joi');
const { Xcrud } = require('xsupport');

const schema = Joi.object({
  category_id: Joi.number().integer(),
  data: Joi.string(),
  status: Joi.string().valid('available', 'sold', 'locked').default('available'),
  order_id: Joi.number().integer()
});
const CRUD = new Xcrud('accounts', schema);

// Admin
const create = async (req, res) => {
  if (Array.isArray(req.body)) {
    const accountIds = await CRUD.CreateMany(req.body, ['category_id', 'data']);
    return res.json({ success: true, accountIds })
  } else {
    const accountId = await CRUD.create(req.body, ['category_id', 'data']);
    return res.json({ success: true, accountId })
  }
}
const list = async (req, res) => {
  const accounts = await CRUD.read(req.query);
  return res.json({ success: true, accounts });
}
const count = async (req, res) => {
  const result = await CRUD.read({ ...req.query, count: true });
  return res.json({ success: true, count: result })
}
const view = async (req, res) => {
  const [account] = await CRUD.read({ id: req.params.id }, ['id']);
  return res.json({ success: true, account });
}
const update = async (req, res) => {
  await CRUD.update(req.params.id, req.body,['category_id','data','status','order_id']);
  return res.json({ success: true });
}
const del = async (req, res) => {
  await CRUD.del(req.params.id);
  return res.json({ success: true });
}
module.exports = {
  accountCRUD: CRUD,
  admin: { create, list, count, view, update, del }
};

