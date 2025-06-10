const Joi = require("joi");
const { Xcrud } = require("xsupport");

const schema = Joi.object({
    name: Joi.string(),
    slug: Joi.string(),
    image: Joi.string(),
    description: Joi.string(),
    parent_id: Joi.number().integer,
    price: Joi.number().integer()
});
const CRUD = new Xcrud('categories', schema);

const create = async ({ name, slug, image, description, parent_id, price }) => await CRUD.create({ name, slug, image, description, parent_id, price }, ['name', 'slug', 'price']);
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