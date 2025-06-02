const Xdb = require('../config/Xdb');
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
    while (onCron) {
        try {
            const activeBanks = await Xdb.select('banks', [], 'enabled = 1');

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
                        await db.update('topup_requests', { status: 'completed' }, 'id = ?', [topup.id]);
                        await db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, topup.user_id]);
                    });
                }
            }
            await sleep(10000);
        } catch (err) { console.error(err); }
    }
}

module.exports = cron;
