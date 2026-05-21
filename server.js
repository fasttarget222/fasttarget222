const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. ڈیٹا بیس کنکشن (MongoDB Connection)
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://fasttarget222:AliYar1992@cluster0.v9wux.mongodb.net/abbottabad?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI)
  .then(() => console.log("🟢 MongoDB connected successfully!"))
  .catch(err => console.error("🔴 MongoDB connection error:", err));

// 2. وینڈر ڈیٹا بیس اسکیمہ (Vendor Schema with Status Tracking)
const vendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    category: { type: String, required: true },
    experience: { type: String },
    description: { type: String },
    status: { type: String, default: 'pending' } // pending or approved
}, { timestamps: true });

const Vendor = mongoose.model('Vendor', vendorSchema);

// 3. ریویو ڈیٹا بیس اسکیمہ (Review Schema)
const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    service: { type: String, required: true },
    rating: { type: Number, required: true },
    message: { type: String, required: true }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

// --- لائیو اے پی آئی لنکس (API ENDPOINTS) ---

// A. وینڈر رجسٹریشن (Register Vendor)
app.post('/api/vendors/register', async (req, res) => {
    try {
        const { name, phone, address, category, experience, description } = req.body;
        // اگر وینڈر پہلے سے موجود ہو تو پرانا والا اپڈیٹ کر دیں یا نیا بنائیں
        let vendor = await Vendor.findOne({ phone });
        if (vendor) {
            vendor.name = name;
            vendor.address = address;
            vendor.category = category;
            vendor.experience = experience;
            vendor.description = description;
            vendor.status = 'pending'; // دوبارہ ایڈمن اپروول کے لیے بھیجیں
            await vendor.save();
        } else {
            vendor = new Vendor({ name, phone, address, category, experience, description, status: 'pending' });
            await vendor.save();
        }
        res.status(201).json({ success: true, message: "Application submitted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// B. وینڈر تلاش کرنا (Self Lookup)
app.get('/api/vendors/lookup', async (req, res) => {
    try {
        const phone = req.query.phone;
        const vendor = await Vendor.findOne({ phone });
        if (!vendor) return res.status(404).json({ error: "Vendor not found" });
        res.json(vendor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// C. وینڈر سیلف اپڈیٹ (Self Update)
app.put('/api/vendors/:phone', async (req, res) => {
    try {
        const updated = await Vendor.findOneAndUpdate({ phone: req.params.phone }, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// D. وینڈر سیلف ڈیلیٹ (Self Delete)
app.delete('/api/vendors/:phone', async (req, res) => {
    try {
        await Vendor.findOneAndDelete({ phone: req.params.phone });
        res.json({ success: true, message: "Listing deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// E. ایڈمن: تمام پینڈنگ وینڈرز کی لسٹ (Admin Pending List)
app.get('/api/vendors/pending', async (req, res) => {
    try {
        const pending = await Vendor.find({ status: 'pending' });
        res.json(pending);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// F. ایڈمن: وینڈر اپروو کرنا (Admin Approve Action)
app.put('/api/vendors/:id/approve', async (req, res) => {
    try {
        const approvedVendor = await Vendor.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
        res.json({ success: true, vendor: approvedVendor });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// G. ایڈمن: رجسٹریشن ریجیکٹ/ڈیلیٹ کرنا (Admin Reject Action)
app.delete('/api/vendors/:id', async (req, res) => {
    try {
        await Vendor.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Vendor removed by admin" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// H. رئیل ٹائم سٹیٹس کاؤنٹر (Real Base Database Counter)
app.get('/api/vendors/stats', async (req, res) => {
    try {
        const approvedCount = await Vendor.countDocuments({ status: 'approved' });
        res.json({
            totalVendors: 46 + approvedCount,
            totalCustomers: 1200 + (approvedCount * 3)
        });
    } catch (err) {
        res.json({ totalVendors: 46, totalCustomers: 1200 });
    }
});

// I. ریویو سبمٹ کرنا (Submit Review)
app.post('/api/reviews/submit', async (req, res) => {
    try {
        const review = new Review(req.body);
        await review.save();
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// سرور پورٹ سیٹنگز
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Live Server running perfectly on port ${PORT}`));
