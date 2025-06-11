require('dotenv').config();
require('xsupport').Xdb.connect();
require('./cron')();
const express = require('express');
const app = express();

app.use(require('cors')());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load routes
app.use('/api', require('./routes'));


app.use((err, req, res, next) => {
    console.warn(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message,
        code: err.code || 'UNKNOWN_ERROR'
    });
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
