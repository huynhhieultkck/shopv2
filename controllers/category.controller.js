// controllers/category.controller.js
const Xdb = require('../config/db');
const Joi = require('joi');

async function buildTree(parentId = null) {
  const rows = await Xdb.select(
    'categories',
    ['id', 'name', 'slug', 'description', 'parent_id', 'image'],
    parentId === null ? 'parent_id IS NULL' : 'parent_id = ?',
    parentId === null ? [] : [parentId]
  );
  for (const row of rows) {
    row.children = await buildTree(row.id);
  }
  return rows;
}

module.exports = {
  list: async (req, res) => {
    const parent_id = req.query.parent || null;
    const where = parent_id !== null ? 'parent_id = ?' : 'parent_id IS NULL';
    const params = parent_id !== null ? [parent_id] : [];
    const categories = await Xdb.select(
      'categories',
      ['id', 'name', 'slug', 'description', 'parent_id', 'image'],
      where,
      params,
      { orderBy: 'id DESC' }
    );
    res.json(categories);
  },

  tree: async (req, res) => {
    try {
      const tree = await buildTree();
      res.json(tree);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    const schema = Joi.object({
      name: Joi.string().required(),
      slug: Joi.string().required(),
      description: Joi.string().allow('').optional(),
      parent_id: Joi.number().allow(null).optional(),
      image: Joi.string().uri().optional()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const id = await Xdb.insert('categories', req.body);
    res.json({ id, message: 'Category created successfully' });
  },

  update: async (req, res) => {
    const id = req.params.id;
    const schema = Joi.object({
      name: Joi.string(),
      slug: Joi.string(),
      description: Joi.string().allow('').optional(),
      parent_id: Joi.number().allow(null).optional(),
      image: Joi.string().uri().optional()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    await Xdb.update('categories', req.body, 'id = ?', [id]);
    res.json({ message: 'Category updated' });
  },

  remove: async (req, res) => {
    const id = req.params.id;
    await Xdb.delete('categories', 'id = ?', [id]);
    res.json({ message: 'Category deleted' });
  }
};
