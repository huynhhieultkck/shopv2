const Joi = require("joi");
const { Xcrud } = require("xsupport");

const schema = Joi.object({
    name: Joi.string(),
    code: Joi.string(),
    account_number: Joi.string(),
    password: Joi.string(),
    token: Joi.string(),
    enabled: Joi.boolean()
});
const CRUD = new Xcrud('banks', schema);

const create = async ({ name, code, account_number, password, token, enabled }) => await CRUD.create({ name, code, account_number, password, token, enabled }, ['name', 'code', 'account_number', 'password', 'token']);
const list = async (data) => await CRUD.read(data);
const view = async (id) => (await CRUD.read({ id, limit: 1 }))?.at(0);
const update = async (id, { name, code, account_number, password, token, enabled }) => await CRUD.update(id, { name, code, account_number, password, token, enabled });
const del = async (id) => await CRUD.del(id);


module.exports = {
    create,
    list,
    view,
    update,
    del
}