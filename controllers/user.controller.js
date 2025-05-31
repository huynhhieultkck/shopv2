// controllers/user.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const Xdb = require('../config/db');

const SECRET = process.env.JWT_SECRET || 'secretkey';

module.exports = {
  register: async (req, res) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      name: Joi.string().min(2).max(100).optional()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const { email, password, name } = req.body;
      const exists = await Xdb.exists('users', 'email = ?', [email]);
      if (exists) return res.status(400).json({ message: 'Email already exists' });

      const hashed = bcrypt.hashSync(password, 10);
      const userId = await Xdb.insert('users', { email, password: hashed, name });
      return res.json({ userId, message: 'Registered successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  login: async (req, res) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const { email, password } = req.body;
      const [user] = await Xdb.select('users', ['id', 'password', 'name', 'role'], 'email = ?', [email]);
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      const valid = bcrypt.compareSync(password, user.password);
      if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
      delete user.password;
      return res.json({ token, user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  logout: async (req, res) => {
    return res.json({ message: 'Logged out (client should clear token)' });
  },

  me: async (req, res) => {
    try {
      const { id } = req.user;
      const [user] = await Xdb.select('users', ['id', 'email', 'name', 'role', 'balance'], 'id = ?', [id]);
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateMe: async (req, res) => {
    const schema = Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      password: Joi.string().min(6).optional()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const { id } = req.user;
      const { name, password } = req.body;
      const updateData = {};
      if (name) updateData.name = name;
      if (password) updateData.password = bcrypt.hashSync(password, 10);
      await Xdb.update('users', updateData, 'id = ?', [id]);
      res.json({ message: 'Updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
