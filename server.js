require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = process.env.PORT || 3000;

// CORS setup
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"], // Allow frontend to access backend
  methods: ["POST", "GET"],
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ', err);
        return;
    }
    console.log('Connected to MySQL Database');
});

// Login Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.json({ success: false, message: "Missing username or password" });
    }

    const sql = "SELECT * FROM employees WHERE UserName = ?";
    db.query(sql, [username], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        if (result.length === 0) {
            return res.json({ success: false, message: "User not found" });
        }

        const user = result[0];
        if (user.Password !== password) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        return res.json({ success: true, message: "Login successful", role: user.Role });
    });
});

// Add Employee Route
app.post('/add-employee', (req, res) => {
    const { fullName, contact, address, username, password, role } = req.body;
    const sql = `INSERT INTO employees (EmployeeName, Contact, Address, UserName, Password, Role) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [fullName, contact, address, username, password, role];
    db.query(sql, params, (err, result) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Employee added successfully!', id: result.insertId });
    });
});

// Remove Employee Route
app.post('/remove-employee', (req, res) => {
    const { username } = req.body;
    const sql = `DELETE FROM employees WHERE UserName = ?`;
    db.query(sql, [username], (err, result) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Employee removed successfully!' });
    });
});

// Fetch Employees Route
app.get('/employees', (req, res) => {
    const sql = `SELECT * FROM employees`;
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

// Fetch Single Employee Route
app.get('/employees/:id', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM employees WHERE Employee_ID = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result[0]);
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});