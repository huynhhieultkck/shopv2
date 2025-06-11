// controllers/category.controller.js
const Joi = require('joi');
const { Xcrud } = require('xsupport');

const schema = Joi.object({
  name: Joi.string(),
  slug: Joi.string(),
  image: Joi.string(),
  description: Joi.string(),
  parent_id: Joi.number().integer(),
  price: Joi.number().integer(),
  available: Joi.number().integer(),
  sold: Joi.number().integer(),
  enabled: Joi.boolean()
});
const CRUD = new Xcrud('categories', schema);

// Client
const listCategory = async (req, res) => {
  const categories = await CRUD.read({ ...req.query, enabled: true });
  return res.json({ success: true, categories });
}
// Admin
const create = async (req, res) => {
  const categoryId = await CRUD.create(req.body, ['name', 'slug', 'price']);
  return res.json({ success: true, categoryId });
}
const list = async (req, res) => {
  const categories = await CRUD.read(req.query);
  return res.json({ success: true, categories });
}
const count = async (req, res) => {
  const result = await CRUD.read({ ...req.query, count: true });
  return res.json({ success: true, count: result })
}
const view = async (req, res) => {
  const [category] = await CRUD.read({ id: req.params.id }, ['id']);
  return res.json({ success: true, category });
}
const update = async (req, res) => {
  await CRUD.update(req.params.id, req.body, ['name', 'slug', 'image', 'description', 'parent_id', 'price', 'enabled']);
  return res.json({ success: true });
}
const del = async (req, res) => {
  await CRUD.del(req.params.id);
  return res.json({ success: true });
}
module.exports = {
  client: { listCategory },
  admin: { create, list, count, view, update, del }
};

