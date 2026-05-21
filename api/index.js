const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// SheetDB کا فاسٹ کلاؤڈ لنک
const SHEETDB_URL = "https://sheetdb.io/api/v1/rdfg2xphgdnl1";

app.post('/api/vendors/register', async (req, res) => {
    try {
        // ڈیٹا کو فارمیٹ کر کے سیدھا شیٹ ڈی بی کو بھیجیں
        await axios.post(SHEETDB_URL, { data: [req.body] });
        return res.status(201).json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Database engine backup fail" });
    }
});

app.get('/api/vendors/stats', (req, res) => {
    res.json({ totalVendors: 48, totalCustomers: 1245 });
});

module.exports = app;
