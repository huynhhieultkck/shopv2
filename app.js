require('dotenv').config();
require('./config/db').connect();
const express = require('express');
const app = express();

app.use(require('cors')());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load routes
app.use('/api', require('./routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
