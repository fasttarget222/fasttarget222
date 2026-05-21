import os

filename = "server.js"
if not os.path.exists(filename):
    # اگر فائل کسی اور نام سے ہے تو تلاش کریں
    files = [f for f in os.listdir('.') if f.endswith('.js')]
    if files: filename = files[0]

with open(filename, "r", encoding="utf-8") as f:
    code = f.read()

# ایڈمن کے لیے پینڈنگ لسٹ اور اپروول کے ضروری لنکس
admin_endpoints = """
// --- ADMIN APPROVAL SYSTEM API ---
app.get('/api/vendors/pending', async (req, res) => {
    try {
        // ڈیٹا بیس سے وہ وینڈرز نکالنا جو ابھی اپروو نہیں ہوئے
        const pendingVendors = await Vendor.find({ status: { $ne: 'approved' } });
        res.json(pendingVendors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/vendors/:id/approve', async (req, res) => {
    try {
        const updated = await Vendor.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
        res.json({ success: true, vendor: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
"""

if "/api/vendors/pending" not in code:
    if "app.listen" in code:
        code = code.replace("app.listen", admin_endpoints + "\napp.listen")
        with open(filename, "w", encoding="utf-8") as f:
            f.write(code)
        print("SUCCESS: Admin routes successfully injected into backend server file!")
    else:
        print("ERROR: app.listen not found, please check server structure.")
else:
    print("INFO: Admin routes already exist in server file.")
