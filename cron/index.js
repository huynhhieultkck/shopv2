const { Xdb, Xfetch } = require('xsupport');
const { bankCRUD } = require('../controllers/bank.controller');

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
    if (onCron) return;
    onCron = true;
    console.log('Cron job started...');
    const fetch = new Xfetch();
    while (onCron) {
        try {
            const activeBanks = await bankCRUD.read({ enabled: true });

            for (const bank of activeBanks) {

                const url = `${BANK_URLS[bank.code]}/${bank.password}/${bank.account_number}/${bank.token}`;
                const response = await fetch.get(url);

                const transactions = response.data?.transactions || [];

                for (const tx of transactions) {
                    if (tx.type !== 'IN') continue;

                    const bankTxId = tx.transactionID;
                    if (await Xdb.exists('topup', 'bank_transaction_id = ?', [bankTxId])) continue;

                    const match = tx.description.match(/\bVMMO([a-zA-Z0-9]+)/i);
                    if (!match || !match[1]) continue;
                    const walletCode = match[1].toUpperCase();
                    const amount = parseInt(tx.amount, 10);

                    try {
                        await Xdb.transaction(async (db) => {
                            const [user] = await db.select('users', ['id'], 'wallet = ?', [walletCode]);
                            if (!user) return;
                            await db.insert('topup', { user_id: user.id, amount: amount, bank_transaction_id: bankTxId, description: tx.description });
                            await db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, user.id]);
                        });
                    } catch (e) { console.error(`Lỗi khi xử lý giao dịch ${tx.transactionID}:`, e.message); }
                }
            }
        } catch (err) { console.error(err); }
        await sleep(20000);
    }
}

module.exports = cron;
