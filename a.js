const Joi = require("joi");

console.log(Joi.object({
    value: Joi.string()
}).validate({ value: "0", keys: 1 }));
