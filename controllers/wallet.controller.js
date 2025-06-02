// controllers/wallet.controller.js
const Joi = require('joi');
const Xdb = require('../config/Xdb');
const Xerror = require('../config/Xerror');

const balance = async (req, res) => {
  try {
    const { id } = req.user;
    const [user] = await Xdb.select('users', ['balance'], 'id = ?', [id]);
    return res.json({ success: true, balance: user.balance });
  } catch (err) { throw new Xerror('Lấy số dư không thành công !', 500); }
}

const topupHistory = async (req, res) => {
  let { error, value } = Joi.number().integer().min(1).validate(req.query.page);
  if (error) throw new Xerror('Thông tin không hợp lệ !', 500);

  try {
    const option = { orderBy: 'created_at DESC', limit: 20 };
    if (value) option.offset = (value - 1) * 20;

    const { id: user_id } = req.user;

    const history = await Xdb.select('topup', ['amount', 'created_at'], 'user_id = ?', [user_id], option);
    return res.json({ success: true, history });
  } catch (err) { throw new Xerror('Lấy lịch sử nạp tiền không thành công !', 500); }
}

module.exports = {
  balance,
  topupHistory
}
