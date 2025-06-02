// controllers/account.controller.js
const Xdb = require('../config/Xdb');
const Joi = require('joi');
const Xerror = require('../config/Xerror');

// -----Admin-----

const list = async (req, res) => {
  const schema = Joi.object({
    category_id: Joi.number().integer().optional(),
    status: Joi.string().valid('available', 'sold', 'locked').optional(),
    page: Joi.number().integer().min(1)
  })

  const { error, value: { category_id, status, page } } = schema.validate(req.query);
  if (error) throw new Xerror('Thông tin không hợp lệ !', 403);

  try {
    const where = [];
    const params = [];
    const option = { orderBy: 'id DESC', limit: 20 };

    if (category_id) { where.push('category_id = ?'); params.push(category_id); }
    if (status) { where.push('status = ?'); params.push(status); }
    if (page) option.offset = (page - 1) * 20;

    const accounts = await Xdb.select('accounts', [], where.join(' AND '), params, option);
    return res.json({ success: true, accounts });
  } catch (err) { throw new Xerror('Lấy danh sách accounts không thành công !', 500); }
}

const add = async (req, res) => {
  const schema = Joi.array().items(Joi.object({
    category_id: Joi.number().required(),
    data: Joi.string().required()
  })).min(1).required();
  const { error, value } = schema.validate([req.body].flat());
  if (error) throw new Xerror('Thông tin không hợp lệ !', 403);

  try {
    let ids = [];
    await Xdb.transaction(async (tx) => { ids = await tx.insertMany('accounts', value); });
    return res.json({ success: true, ids });
  } catch (err) { throw new Xerror('Thêm account không thành công !', 500); }
}
const update = async (req, res) => {
  const id = req.params.id;
  const schema = Joi.object({
    data: Joi.string(),
    status: Joi.string().valid('available', 'sold', 'locked'),
    category_id: Joi.number()
  });
  const { error, value } = schema.validate(req.body);
  if (error) throw new Xerror('Thông tin không hợp lệ !', 403);

  try {
    await Xdb.update('accounts', value, 'id = ?', [id]);
    return res.json({ success: true });
  } catch (err) { throw new Xerror('Cập nhật account không thành công !', 500); }
}

const del = async (req, res) => {
  try {
    const id = req.params.id;
    await Xdb.delete('accounts', 'id = ?', [id]);
    return res.json({ success: true });
  } catch (err) { throw new Xerror('Xoá account không thành công !', 500); }
}
module.exports = {
  list,
  add,
  update,
  del
};
