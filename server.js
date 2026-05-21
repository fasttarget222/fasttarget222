const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'vendors.json');

function readDB() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 4), 'utf8');
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            }
        });
    }
    else if (req.url === '/api/vendors' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(readDB()));
    }
    else if (req.url === '/api/vendors/register' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const newVendor = JSON.parse(body);
                const vendors = readDB();
                
                newVendor.id = Date.now();
                newVendor.status = 'pending';
                newVendor.distance = (Math.random() * 2.8 + 0.2).toFixed(1);
                newVendor.rating = "4.5";
                
                // 4 ہندسوں کا یونیک ڈیلیٹ کوڈ بنانا
                const uniqueCode = Math.floor(1000 + Math.random() * 9000).toString();
                newVendor.deleteCode = uniqueCode;
                
                vendors.push(newVendor);
                writeDB(vendors);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, deleteCode: uniqueCode }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid Data');
            }
        });
    }
    else if (req.url === '/api/vendors/action' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { id, action } = JSON.parse(body);
                let vendors = readDB();
                
                if (action === 'approve') {
                    vendors = vendors.map(v => v.id === id ? { ...v, status: 'approved' } : v);
                } else if (action === 'reject' || action === 'delete') {
                    vendors = vendors.filter(v => v.id !== id);
                }
                
                writeDB(vendors);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid request');
            }
        });
    }
    // وینڈر خود اپنا کوڈ ڈال کر ڈیلیٹ کر سکے
    else if (req.url === '/api/vendors/self-delete' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { phone, code } = JSON.parse(body);
                let vendors = readDB();
                
                const initialLength = vendors.length;
                // فون نمبر اور ڈیلیٹ کوڈ میچ کرنا
                vendors = vendors.filter(v => !(v.phone === phone && v.deleteCode === code));
                
                if (vendors.length < initialLength) {
                    writeDB(vendors);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Deleted successfully' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'غلط فون نمبر یا سیکیورٹی کوڈ!' }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Error');
            }
        });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

