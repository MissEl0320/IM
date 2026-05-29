require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Enable CORS for deployed frontend
app.use(cors({
    origin: 'https://im-nvlb.vercel.app',
    credentials: true
}));

app.use(express.json());

// ===============================
// MYSQL DATABASE CONNECTION (SERVERLESS POOL OPTIMIZED)
// ===============================
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Use pool for all queries to prevent "closed state" errors
const db = pool; 

// Auto-seed default admin account stably without db.connect()
const checkAdminSql = "SELECT * FROM users WHERE email = 'admin@rentgo.com'";
db.query(checkAdminSql, (err, results) => {
    if (!err && results && results.length === 0) {
        bcrypt.hash('admin123', 10, (hashErr, adminHash) => {
            if (hashErr) return;
            
            const seedSql =
                "INSERT INTO users (username, email, password) VALUES ('Admin', 'admin@rentgo.com', ?)";

            db.query(seedSql, [adminHash]);
            console.log("Master admin account provisioned.");
        });
    }
});

// ===============================
// EMAIL TRANSPORTER
// ===============================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'YOUR_GMAIL_HERE@gmail.com',
        pass: 'YOUR_16_DIGIT_GOOGLE_APP_PASSWORD_HERE'
    }
});

const verificationCodes = new Map();

// ===============================
// USER SIGNUP (WORKING)
// ===============================
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({
                        message: "Account already exists."
                    });
                }
                return res.status(500).json({
                    message: err.message
                });
            }

            res.status(201).json({
                message: "Registered successfully!"
            });
        });

    } catch (error) {
        res.status(500).json({
            message: "Encryption failure."
        });
    }
});

// ===============================
// USER LOGIN (WORKING)
// ===============================
app.post('/api/login', (req, res) => {
    const { identifier, password } = req.body;
    const lookupValue = identifier || req.body.email;

    if (!lookupValue) {
        return res.status(400).json({
            message: "Username or email is required."
        });
    }

    const sql = "SELECT * FROM users WHERE email = ? OR username = ?";

    db.query(sql, [lookupValue, lookupValue], async (err, results) => {
        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }

        if (!results || results.length === 0) {
            return res.status(401).json({
                message: "Invalid credentials."
            });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials."
            });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    });
});

// ===============================
// FORGOT PASSWORD
// ===============================
app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], (err, results) => {
        if (err || !results || results.length === 0) {
            return res.status(400).json({
                message: "Email not found."
            });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        verificationCodes.set(email, {
            code,
            expires: Date.now() + 600000
        });

        const mailOptions = {
            from: 'YOUR_GMAIL_HERE@gmail.com',
            to: email,
            subject: 'RentGo Password Reset OTP Code',
            text: `Your confirmation code is: ${code}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({
                    message: "Failed to send email."
                });
            }
            res.status(200).json({
                message: "Verification code sent."
            });
        });
    });
});

// ===============================
// RESET PASSWORD
// ===============================
app.post('/api/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;
    const record = verificationCodes.get(email);

    if (!record || record.code !== code || Date.now() > record.expires) {
        return res.status(400).json({
            message: "Invalid or expired code."
        });
    }

    try {
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const sql = "UPDATE users SET password = ? WHERE email = ?";

        db.query(sql, [hashedNewPassword, email], (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }
            verificationCodes.delete(email);
            res.status(200).json({
                message: "Password updated successfully!"
            });
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error."
        });
    }
});

// ===============================
// SERVER LISTEN
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server executing on port ${PORT}`);
});

module.exports = app;