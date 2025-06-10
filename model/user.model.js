const { Xcrud, Xcode, Xerror } = require("xsupport");
const SERECT = process.env.JWT_SECRET;
const SERECT_EXPIRES = process.env.JWT_EXPIRES_IN;

const schema = Joi.object({
    email: Joi.string().email(),
    password: Joi.string().min(5),
    name: Joi.string(),
    role: Joi.string().valid('user', 'admin').default('user'),
    balance: Joi.number().integer().default(0),
    wallet: Joi.string()
})
const CRUD = new Xcrud('users', schema);


const login = async ({ email, password }) => {
    const [user] = await CRUD.read({ email }, ['email'], [], { verify: true, limit: 1 });
    if (!user || !Xcode.password.compare(password, user.password)) throw new Xerror('User hoặc mật khẩu không chính xác !', { status: 403 });
    const token = Xcode.jwt.sign({ id: user.id, role: user.role }, SERECT, SERECT_EXPIRES);
    delete user.password;
    return { token, user };
}

// -----CRUD-----
const create = async ({ email, password, name, role }) => await CRUD.create({ email, password: password && Xcode.password.hash(password), name, role, wallet: Xcode.uuid.v4().split('-')[0].toUpperCase() }, ['email', 'password', 'name', 'wallet']);
const list = async (data) => await CRUD.read(data, [], ['id', 'email', 'name', 'role', 'balance', 'wallet', 'created_at']);
const view = async (id) => (await CRUD.read({ id, limit: 1 }, ['id'], ['id', 'email', 'name', 'role', 'balance', 'wallet', 'created_at']))?.at(0);
const update = async (id, { email, password, name, role, balance }) => await CRUD.update(id, { email, password: password && Xcode.password.hash(password), name, role, balance });
const del = async (id) => await CRUD.del(id);


module.exports = {
    login,
    create,
    list,
    view,
    update,
    del
}