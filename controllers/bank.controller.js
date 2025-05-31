// controllers/bank.controller.js
const Xdb = require('../config/db');
const Joi = require('joi');
const axios = require('axios');

const BANK_URLS = {
    vietcombank: 'https://api.web2m.com/historyapivcbv3',
    bidv: 'https://api.web2m.com/historyapibidvv3',
    mbbank: 'https://api.web2m.com/historyapimbv3',
    acb: 'https://api.web2m.com/historyapiacbv3',
    techcombank: 'https://api.web2m.com/historyapitcbv3'
};
const sleep = (ms = 1000) => new Promise(rs => setTimeout(rs, ms))
let onCron = false;
const cron = async () => {
    if (onCron) return; else onCron = true;
    try {
        const activeBanks = await Xdb.select('banks', [], 'enabled = 1');
        let totalSynced = 0;

        for (const bank of activeBanks) {
            const url = `${BANK_URLS[bank.code]}/${bank.password}/AccountNumber/${bank.token}`;
            const response = await axios.get(url);
            const transactions = response.data.transactions || [];

            for (const tx of transactions) {
                if (tx.type !== 'IN') continue;

                const match = tx.description.match(/NAP([a-zA-Z0-9]+)/);
                if (!match) continue;
                const transaction_code = `NAP${match[1]}`;
                const amount = parseInt(tx.amount);

                const topups = await Xdb.select('topup_requests', ['id', 'user_id', 'status'], 'transaction_code = ? AND status = ?', [transaction_code, 'pending']);
                if (!topups.length) continue;

                const topup = topups[0];
                await Xdb.transaction(async (db) => {
                    await db.update('topup_requests', { status: 'completed' }, 'd i= ?', [topup.id]);
                    await db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, topup.user_id]);
                });

                totalSynced++;
            }
        }
        await sleep(5000);
        onCron = false;
    } catch (err) { }
}

module.exports = {
    listBanks: async (req, res) => {
        const banks = await Xdb.select('banks');
        res.json(banks);
    },

    createBank: async (req, res) => {
        const schema = Joi.object({
            name: Joi.string().required(),
            code: Joi.string().valid(...Object.keys(BANK_URLS)).required(),
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
        cron();
        res.json({ message: `✅ Đã đồng bộ ${totalSynced} giao dịch từ tất cả ngân hàng.` });
    }
};
