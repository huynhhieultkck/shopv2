// controllers/account.controller.js
const Xdb = require('../config/db');
const Joi = require('joi');

module.exports = {
  list: async (req, res) => {
    const { category_id, status = 'available' } = req.query;
    const where = ['status = ?'];
    const params = [status];
    if (category_id) {
      where.push('category_id = ?');
      params.push(category_id);
    }
    const accounts = await Xdb.select('accounts', ['id', 'email', 'price', 'status', 'category_id', 'created_at'], where.join(' AND '), params, {
      orderBy: 'created_at DESC'
    });
    res.json(accounts);
  },

  detail: async (req, res) => {
    const id = req.params.id;
    const [acc] = await Xdb.select('accounts', ['id', 'email', 'price', 'status', 'category_id', 'notes'], 'id = ?', [id]);
    if (!acc || acc.status !== 'available') return res.status(404).json({ message: 'Account not found or sold' });
    res.json(acc);
  },

  create: async (req, res) => {
    const schema = Joi.object({
      category_id: Joi.number().required(),
      email: Joi.string().required(),
      password: Joi.string().required(),
      recovery_email: Joi.string().allow('').optional(),
      twofa_code: Joi.string().allow('').optional(),
      cookies: Joi.string().allow('').optional(),
      backup_codes: Joi.string().allow('').optional(),
      notes: Joi.string().allow('').optional(),
      price: Joi.number().required(),
      tags: Joi.string().allow('').optional()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const id = await Xdb.insert('accounts', req.body);
    res.json({ id, message: 'Account added' });
  },

  update: async (req, res) => {
    const id = req.params.id;
    const schema = Joi.object({
      email: Joi.string(),
      password: Joi.string(),
      recovery_email: Joi.string().allow('').optional(),
      twofa_code: Joi.string().allow('').optional(),
      cookies: Joi.string().allow('').optional(),
      backup_codes: Joi.string().allow('').optional(),
      notes: Joi.string().allow('').optional(),
      price: Joi.number(),
      status: Joi.string().valid('available', 'sold', 'locked'),
      category_id: Joi.number(),
      tags: Joi.string().allow('').optional()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    await Xdb.update('accounts', req.body, 'id = ?', [id]);
    res.json({ message: 'Account updated' });
  },

  remove: async (req, res) => {
    const id = req.params.id;
    await Xdb.delete('accounts', 'id = ?', [id]);
    res.json({ message: 'Account deleted' });
  }
};
