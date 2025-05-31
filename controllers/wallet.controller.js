// controllers/wallet.controller.js
const Xdb = require('../config/db');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  getBalance: async (req, res) => {
    try {
      const { id } = req.user;
      const [user] = await Xdb.select('users', ['balance'], 'id = ?', [id]);
      res.json({ balance: user.balance });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  topupRequest: async (req, res) => {
    const schema = Joi.object({ amount: Joi.number().min(10000).required() });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const { id: user_id } = req.user;
      const { amount } = req.body;
      const transaction_code = 'NAP' + uuidv4().split('-')[0].toUpperCase();

      await Xdb.insert('topup_requests', { user_id, amount, transaction_code });

      res.json({
        transaction_code,
        instructions: `Vui lòng chuyển ${amount.toLocaleString()} VND tới tài khoản MB Bank với nội dung chuyển khoản: ${transaction_code}`
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  topupHistory: async (req, res) => {
    try {
      const { id: user_id } = req.user;
      const history = await Xdb.select('topup_requests', ['amount', 'transaction_code', 'status', 'created_at'], 'user_id = ?', [user_id], {
        orderBy: 'created_at DESC', limit: 50
      });
      res.json(history);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
