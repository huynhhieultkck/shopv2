// controllers/order.controller.js
const Xdb = require('../config/Xdb');
const Joi = require('joi');
const Xerror = require('../config/Xerror');

const list = async (req, res) => {
  let { error, value } = Joi.number().integer().min(1).validate(req.query.page);
  if (error) throw new Xerror('Thông tin không hợp lệ !', 500);

  try {
    const option = { orderBy: 'created_at DESC', limit: 20 };
    if (value) option.offset = (value - 1) * 20;

    const orders = await Xdb.select('orders', ['id', 'total_price', 'created_at'], 'user_id = ?', [req.user.id], option);
    return res.json({ success: true, orders });
  } catch (err) { throw new Xerror('Lấy danh sách order không thành công !', 500); }
}

const orderDetail = async (req, res) => {
  try {
    const id = req.params.id;

    const [order] = await Xdb.select('orders', ['id', 'total_price', 'created_at'], 'id = ? AND user_id = ?', [id, req.user.id]);
    if (!order) return res.status(403).json({ success: false, message: 'Thông tin không hợp lệ !' });

    const accounts = await Xdb.select('accounts', ['data'], 'order_id = ?', [id]);
    return res.json({ success: true, ...order, accounts });
  } catch (err) { throw new Xerror('Lấy thông tin order không thành công !', 500); }
}
const create = async (req, res) => {
  const schema = Joi.object({
    category_id: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).required()
  });
  const { error, value: { category_id, quantity } } = schema.validate(req.body);
  if (error) throw new Xerror('Thông tin không hợp lệ !', 403);

  try {
    const userId = req.user.id;

    //Kiểm tra category và số lượng account
    const [category] = await Xdb.select('categories', ['id', 'price', 'available'], 'id = ?', [category_id]);
    if (!category) return res.status(403).json({ success: false, message: 'Category không tồn tại !' });
    if (category.available < quantity) return res.status(403).json({ success: false, message: 'Số lượng account không đủ !' });

    //Kiểm tra balance
    const [{ balance }] = await Xdb.select('users', ['balance'], 'id = ?', [userId]);
    const total = quantity * category.price;
    if (!balance || balance < total) return res.status(403).json({ success: false, message: 'Số dư không đủ !' });

    const result = await Xdb.transaction(async (tx) => {
      const orderId = await tx.insert('orders', { user_id: userId, total_price: total });
      const affectedRows = await tx.update('accounts', { status: 'sold', order_id: orderId }, 'category_id = ? AND status = ?', [category_id, 'available'], quantity);
      if (affectedRows < quantity) throw new Xerror('Tạo order không thành công !', 500);
      await tx.query('UPDATE users SET balance = balance - ? WHERE id = ?', [total, userId]);
      return orderId;
    })

    return res.json({ success: true, orderId: result });
  } catch (err) { throw new Xerror('Tạo order không thành công !', 500); }
}

module.exports = {
  list,
  orderDetail,
  create
};
