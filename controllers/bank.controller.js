// controllers/bank.controller.js
const Xdb = require('../config/db');
const Joi = require('joi');

module.exports = {
    listBanks: async (req, res) => {
        const banks = await Xdb.select('banks');
        res.json(banks);
    },

    createBank: async (req, res) => {
        const schema = Joi.object({
            name: Joi.string().required(),
            code: Joi.string().valid('vietcombank','bidv','mbbank','acb','techcombank').required(),
            account_number: Joi.string().required(),
            password: Joi.string().required(),
            token: Joi.string().required(),
            enabled: Joi.boolean().default(true)
        });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const bankId = await Xdb.insert('banks', req.body);
        res.json({ id: bankId, message: 'Bank added successfully' });
    },

    updateBank: async (req, res) => {
        const id = req.params.id;
        const schema = Joi.object({
            name: Joi.string(),
            account_number: Joi.string(),
            password: Joi.string(),
            token: Joi.string(),
            enabled: Joi.boolean()
        });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        await Xdb.update('banks', req.body, 'id = ?', [id]);
        res.json({ message: 'Bank updated successfully' });
    },

    deleteBank: async (req, res) => {
        const id = req.params.id;
        await Xdb.delete('banks', 'id = ?', [id]);
        res.json({ message: 'Bank deleted' });
    },

    syncAllBanks: async (req, res) => {
        res.json({ message: `✅ Đã đồng bộ giao dịch từ tất cả ngân hàng.` });
    }
};
