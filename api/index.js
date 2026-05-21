const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// ڈائریکٹ منگو ڈی بی کلاؤڈ لنک
const MONGO_URI = "mongodb+srv://fasttarget222:AliYar1992@cluster0.v9wux.mongodb.net/abbottabad?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI)
  .then(() => console.log("🟢 Database Connected Directly!"))
  .catch(err => console.error("🔴 DB Error:", err));

const vendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    category: { type: String, required: true },
    experience: { type: String },
    description: { type: String },
    status: { type: String, default: 'pending' }
}, { timestamps: true });

const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);

// --- ڈائریکٹ اے پی آئی روٹس ---
app.post('/api/vendors/register', async (req, res) => {
    try {
        const { name, phone, address, category, experience, description } = req.body;
        let vendor = await Vendor.findOne({ phone });
        if (vendor) {
            Object.assign(vendor, { name, address, category, experience, description, status: 'pending' });
            await vendor.save();
        } else {
            vendor = new Vendor({ name, phone, address, category, experience, description, status: 'pending' });
            await vendor.save();
        }
        return res.status(201).json({ success: true });
    } catch (err) { return res.status(500).json({ error: err.message }); }
});

app.get('/api/vendors/pending', async (req, res) => {
    try { res.json(await Vendor.find({ status: 'pending' })); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/vendors/:id/approve', async (req, res) => {
    try {
        await Vendor.findByIdAndUpdate(req.params.id, { status: 'approved' });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/vendors/stats', async (req, res) => {
    try {
        const approvedCount = await Vendor.countDocuments({ status: 'approved' });
        res.json({ totalVendors: 46 + approvedCount, totalCustomers: 1200 + (approvedCount * 3) });
    } catch (err) { res.json({ totalVendors: 46, totalCustomers: 1200 }); }
});

module.exports = app;
