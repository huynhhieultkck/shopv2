// controllers/category.controller.js
const Xdb = require('../config/Xdb');
const Joi = require('joi');
const Xerror = require('../config/Xerror');

async function buildTree(parentId = null) {
  const rows = await Xdb.select(
    'categories', [],
    parentId === null ? 'parent_id IS NULL' : 'parent_id = ?',
    parentId === null ? [] : [parentId]
  );
  for (const row of rows) {
    row.children = await buildTree(row.id);
  }
  return rows;
}

// ----Public ----

const view = async (req, res) => {
  try {
    const categories = await buildTree(req.query.parent || null);
    return res.json({ success: true, categories });
  } catch (err) { throw new Xerror('Lấy danh sách categorys không thành công !', 500); }
}

const list = async (req, res) => {
  try {
    const parent_id = req.query.parent || null;
    const categories = await Xdb.select(
      'categories', [],
      !!parent_id ? 'parent_id = ?' : null,
      !!parent_id ? [parent_id] : [],
      { orderBy: 'id DESC' }
    );
    return res.json({ success: true, categories });
  } catch (err) { throw new Xerror('Lấy danh sách categorys không thành công !', 500); }
}

// ----Admin----

const add = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    slug: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    parent_id: Joi.number().allow(null).optional(),
    image: Joi.string().uri().optional(),
    price: Joi.number().integer().required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) throw new Xerror('Thông tin không hợp lệ !', 403);

  try {
    const id = await Xdb.insert('categories', value);
    return res.json({ success: true, id, message: 'Thêm category thành công !' });
  } catch (err) { throw new Xerror('Thêm category không thành công !', 500); }
}
const update = async (req, res) => {
  const id = req.params.id;
  const schema = Joi.object({
    name: Joi.string(),
    slug: Joi.string(),
    description: Joi.string().allow('').optional(),
    parent_id: Joi.number().allow(null).optional(),
    image: Joi.string().uri().optional(),
    price: Joi.number().integer().optional()
  });
  const { error, value } = schema.validate(req.body);
  if (error) throw new Xerror('Thông tin không hợp lệ !', 403);

  try {
    await Xdb.update('categories', value, 'id = ?', [id]);
    return res.json({ success: true, message: 'Cập nhật category thành công !' });
  } catch (err) { throw new Xerror('Cập nhật category không thành công !', 500); }
}
const del = async (req, res) => {
  const id = req.params.id;
  try {
    await Xdb.delete('categories', 'id = ?', [id]);
    return res.json({ success: true, message: 'Xoá category thành công !' });
  } catch (err) { throw new Xerror('Xoá category không thành công !', 500); }
}
module.exports = {
  view,
  list,
  add,
  update,
  del
};
