// controllers/order.controller.js
const Xdb = require('../config/db');
const Joi = require('joi');

module.exports = {
  myOrders: async (req, res) => {
    const orders = await Xdb.select('orders', ['id', 'total_price', 'created_at'], 'user_id = ?', [req.user.id], {
      orderBy: 'created_at DESC'
    });
    res.json(orders);
  },

  orderDetail: async (req, res) => {
    const id = req.params.id;
    const [order] = await Xdb.select('orders', ['id', 'total_price', 'created_at'], 'id = ? AND user_id = ?', [id, req.user.id]);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const items = await Xdb.select('order_items', ['account_snapshot', 'price'], 'order_id = ?', [id]);
    res.json({ ...order, items });
  },

  create: async (req, res) => {
    const schema = Joi.object({
      account_ids: Joi.array().items(Joi.number().integer()).min(1).required()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const userId = req.user.id;
    const accountIds = req.body.account_ids;

    const accounts = await Xdb.select('accounts', ['id', 'email', 'password', 'price', 'recovery_email', 'twofa_code', 'cookies', 'backup_codes', 'notes'],
      `id IN (${accountIds.map(() => '?').join(',')}) AND status = 'available'`, accountIds);

    if (accounts.length !== accountIds.length) {
      return res.status(400).json({ message: 'Some accounts are no longer available' });
    }

    const total = accounts.reduce((sum, acc) => sum + acc.price, 0);
    const [user] = await Xdb.select('users', ['balance'], 'id = ?', [userId]);
    if (user.balance < total) return res.status(400).json({ message: 'Insufficient balance' });

    const result = await Xdb.transaction(async (db) => {
      const orderId = await db.insert('orders', { user_id: userId, total_price: total });

      for (const acc of accounts) {
        const snapshot = {
          email: acc.email,
          password: acc.password,
          recovery_email: acc.recovery_email,
          twofa_code: acc.twofa_code,
          cookies: acc.cookies,
          backup_codes: acc.backup_codes,
          notes: acc.notes
        };
        await db.insert('order_items', {
          order_id: orderId,
          account_id: acc.id,
          price: acc.price,
          account_snapshot: JSON.stringify(snapshot)
        });
        await db.update('accounts', { status: 'sold' }, 'id = ?', [acc.id]);
      }

      await db.query('UPDATE users SET balance = balance - ? WHERE id = ?', [total, userId]);
      return orderId;
    });

    res.json({ order_id: result, message: 'Purchase successful' });
  }
};
