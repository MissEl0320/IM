const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Enable CORS for your Next.js development server running on port 3000
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// 1. MySQL Database Connection configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'rentgo_db'
});

db.connect((err) => {
    if (err) return console.error('Database connection failed: ' + err.stack);
    console.log('Connected to MySQL Database.');
    
    // Auto-seed a Default Master Admin Account if it doesn't exist yet
    const checkAdminSql = "SELECT * FROM users WHERE email = 'admin@rentgo.com'";
    db.query(checkAdminSql, async (err, results) => {
        if (!err && results.length === 0) {
            const adminHash = await bcrypt.hash('admin123', 10);
            const seedSql = "INSERT INTO users (username, email, password) VALUES ('Admin', 'admin@rentgo.com', ?)";
            db.query(seedSql, [adminHash]);
            console.log("Master admin account provisioned: admin@rentgo.com / admin123");
        }
    });
});

// 2. Configure Real Email Mailing Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'YOUR_GMAIL_HERE@gmail.com', 
        pass: 'YOUR_16_DIGIT_GOOGLE_APP_PASSWORD_HERE' 
    }
});

// Temporary memory store for password verification reset pins (Email -> Code mapping)
const verificationCodes = new Map();

// --- API ENDPOINTS ---

// A. USER SIGNUP
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Account already exists." });
                return res.status(500).json({ message: err.message });
            }
            res.status(201).json({ message: "Registered successfully!" });
        });
    } catch (error) {
        res.status(500).json({ message: "Encryption failure." });
    }
});

// B. SECURE USER LOGIN (Fixed parameter to support identifier from frontend)
app.post('/api/login', (req, res) => {
    // Destructured identifier to match Next.js login request JSON body payload exactly
    const { identifier, password } = req.body; 

    // Safe fallback check if identifier isn't supplied
    const lookupValue = identifier || req.body.email;

    if (!lookupValue) {
        return res.status(400).json({ message: "Username or email is required." });
    }

    const sql = "SELECT * FROM users WHERE email = ? OR username = ?";
    db.query(sql, [lookupValue, lookupValue], async (err, results) => {
        if (err) return res.status(500).json({ message: err.message });
        if (results.length === 0) return res.status(401).json({ message: "Invalid credentials." });

        const user = results[0];

        // Decrypt and match database hash with plaintext input password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });

        // Match found! Safe to log in
        res.status(200).json({
            message: "Login successful",
            user: { id: user.id, username: user.username, email: user.email }
        });
    });
});

// C. FORGOT PASSWORD (Generates & dispatches a real verification email)
app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err || results.length === 0) return res.status(400).json({ message: "Email not found." });

        // Generate 6-digit random code string
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        verificationCodes.set(email, { code, expires: Date.now() + 600000 }); // Valid for 10 minutes

        const mailOptions = {
            from: 'YOUR_GMAIL_HERE@gmail.com',
            to: email,
            subject: 'RentGo Password Reset OTP Code',
            text: `Your confirmation code for resetting your account security password is: ${code}. Do not share this pin.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return res.status(500).json({ message: "Failed to dispatch email helper." });
            res.status(200).json({ message: "Verification code transmitted." });
        });
    });
});

// D. RESET PASSWORD (Validates pin and saves new hash)
app.post('/api/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;
    const record = verificationCodes.get(email);

    if (!record || record.code !== code || Date.now() > record.expires) {
        return res.status(400).json({ message: "Invalid or expired confirmation code token." });
    }

    try {
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const sql = "UPDATE users SET password = ? WHERE email = ?";
        
        db.query(sql, [hashedNewPassword, email], (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            
            verificationCodes.delete(email); // Invalidate code upon successful consumption
            res.status(200).json({ message: "Password updated successfully!" });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error resetting user configuration records." });
    }
});

// --- ACTIVATION LISTEN CALL ---
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`  Secure System Server executing on port ${PORT}`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`===================================================`);
});