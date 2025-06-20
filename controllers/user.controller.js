// controllers/user.controller.js
const Joi = require('joi');
const { Xcode, Xcrud, Xerror } = require('xsupport');
const SERECT = process.env.JWT_SECRET;
const SERECT_EXPIRES = process.env.JWT_EXPIRES_IN;

const schema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(5),
  name: Joi.string(),
  role: Joi.string().valid('user', 'admin'),
  balance: Joi.number().integer(),
  wallet: Joi.string(),
  enabled: Joi.boolean()
})
const CRUD = new Xcrud('users', schema);

// Client
const register = async (req, res) => {
  let { email, password, name } = req.body;
  if (password) password = Xcode.password.hash(password);
  const wallet = Xcode.uuid.v4().split('-')[0].toUpperCase();
  const userId = await CRUD.create({ email, password, name, role: 'user', wallet, enabled: true }, ['email', 'password', 'name']);
  return res.json({ success: true, userId });
}
const login = async (req, res) => {
  let { email, password } = req.body;
  const [user] = await CRUD.read({ email, enabled: true, limit: 1 }, ['email'], [], { verify: true });  
  if (!user || !Xcode.password.compare(password, user.password)) throw new Xerror('Tài khoản hoặc mật khẩu không chính xác !', { status: 403 });
  const token = Xcode.jwt.sign({ id: user.id, role: user.role }, SERECT, SERECT_EXPIRES);
  delete user.password;
  return res.json({ success: true, user, token });
}
const profile = async (req, res) => {
  const [user] = await CRUD.read({ id: req.user.id }, ['id']);
  delete user.password;
  return res.json({ success: true, user });
}
const updatePassword = async (req, res) => {
  let { password, newPassword } = req.body;
  if (newPassword) newPassword = Xcode.password.hash(newPassword);
  const [user] = await CRUD.read({ id, enabled: true }, ['id']);
  if (!user || !Xcode.password.compare(password, user.password)) throw new Xerror('Tài khoản hoặc mật khẩu không chính xác !', { status: 403 });
  await CRUD.update(req.user.id, { password: Xcode.password.hash(newPassword) });
  return res.json({ success: true });
}
// Admin
const create = async (req, res) => {
  let { email, password, name, role, enabled } = req.body;
  if (password) password = Xcode.password.hash(password);
  const wallet = Xcode.uuid.v4().split('-')[0].toUpperCase();
  const userId = await CRUD.create({ email, password, name, wallet, role, enabled }, ['email', 'password', 'name', 'wallet']);
  return res.json({ success: true, userId });
}
const list = async (req, res) => {
  const users = await CRUD.read(req.query);
  return res.json({ success: true, users });
}
const count = async (req, res) => {
  const result = await CRUD.read({ ...req.query, count: true });
  return res.json({ success: true, count: result })
}
const view = async (req, res) => {
  const [user] = await CRUD.read({ id: req.params.id }, ['id']);
  delete user.password;
  return res.json({ success: true, user });
}
const update = async (req, res) => {
  if (req.body.password) req.body.password = Xcode.password.hash(req.body.password);
  await CRUD.update(req.params.id, req.body, ['password', 'name', 'role', 'balance', 'enabled']);
  return res.json({ success: true });
}
const del = async (req, res) => {
  await CRUD.del(req.params.id);
  return res.json({ success: true });
}

module.exports = {
  client: { register, login, profile, updatePassword },
  admin: { create, list, count, view, update, del }
}