require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Use a Connection Pool for Stability
const db = mysql.createPool({
  connectionLimit: 10, // Prevent too many open connections
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  queueLimit: 0,
});

// Handle Database Connection Errors
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  } else {
    console.log("✅ Connected to MySQL database");
    connection.release(); // Release connection back to pool
  }
});

// Keep Connection Alive
setInterval(() => {
  db.query("SELECT 1", (err) => {
    if (err) console.error("⚠️ MySQL keep-alive error:", err.message);
  });
}, 30000);

// Example Route to Check Server
app.get("/", (req, res) => res.send("🚀 Server is running..."));

// Fetch Customers (Using Pool)
app.get("/customers", (req, res) => {
  db.query("SELECT * FROM customers", (err, results) => {
    if (err) {
      console.error("❌ Error fetching customers:", err.message);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
