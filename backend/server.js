const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mysql = require('mysql2/promise'); 
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors({
    origin: '*', 
    credentials: true
}));

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || '', 
    database: process.env.DB_NAME || 'rentgo_db', 
    port: parseInt(process.env.DB_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- API ENDPOINTS ---

app.post('/api/login', async (req, res) => {
    const { identifier, password } = req.body; 
    try {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?', 
            [identifier, identifier, password]
        );
        if (rows.length > 0) {
            res.status(200).json({ success: true, message: "Login successful" });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "Username or Email already exists" });
        }
        await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
        res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server executing on port ${PORT}`);
});

module.exports = app;