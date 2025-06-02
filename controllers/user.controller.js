// controllers/user.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const Xdb = require('../config/Xdb');
const Xerror = require('../config/Xerror');
const { v4: uuidv4 } = require('uuid');

const SECRET = process.env.JWT_SECRET || 'ngohuynhhieu';

const randomWallet = async () => {
  while (true) {
    let wallet = uuidv4().split('-')[0].toUpperCase();
    if (await Xdb.exists('users', 'wallet = ?', [wallet])) continue;
    else return wallet;
  }
}

// Đăng kí
const register = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(100).required()
  });
  const { error } = schema.validate(req.body);
  if (error) throw new Xerror('Thông tin đăng kí không hợp lệ !', 403);

  try {
    const { email, password, name } = req.body;
    const exists = await Xdb.exists('users', 'email = ?', [email]);
    if (exists) throw new Xerror('Email đã tồn tại !', 403);

    const hashed = bcrypt.hashSync(password, 10);
    const wallet = await randomWallet();
    const userId = await Xdb.insert('users', { email, password: hashed, name, wallet });
    return res.json({ success: true, userId, message: 'Đăng kí thành công !' });
  } catch (err) { throw new Xerror('Không thể đang kí tài khoản !', 500); }
}

// Đăng nhập
const login = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  const { error } = schema.validate(req.body);
  if (error) throw new Xerror('Thông tin đăng nhập không hợp lệ !', 403);

  try {
    const { email, password } = req.body;
    const [user] = await Xdb.select('users', ['id', 'password', 'name', 'role'], 'email = ?', [email]);
    if (!user) throw new Xerror('Tài khoản không tồn tại !', 403);

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) throw new Xerror('Mật khẩu không chính xác !', 403);

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1d' });
    delete user.password;
    return res.json({ success: true, token, user });
  } catch (err) { throw new Xerror('Đăng nhập không thành công !', 500); }
}

// thông tin tài khoản
const profile = async (req, res) => {
  try {
    const { id } = req.user;
    const [user] = await Xdb.select('users', ['id', 'email', 'name', 'role', 'balance', 'wallet'], 'id = ?', [id]);
    return res.json({ success: true, user });
  } catch (err) { throw new Xerror('Lấy thông tin tài khoản không thành công !', 500); }
}

// Cập nhật tài khoản
const update = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    password: Joi.string().min(6).optional()
  });
  const { error } = schema.validate(req.body);
  if (error) throw new Xerror('Thông tin không hợp lệ !', 403);

  try {
    const { id } = req.user;
    const { name, password } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (password) updateData.password = bcrypt.hashSync(password, 10);
    await Xdb.update('users', updateData, 'id = ?', [id]);
    return res.json({ success: true, message: 'Cập nhật tài khoảnn thành công !' });
  } catch (err) { throw new Xerror('Cập nhật thông tin tài khoản không thành công !', 500); }
}
module.exports = {
  register,
  login,
  profile,
  update
};
