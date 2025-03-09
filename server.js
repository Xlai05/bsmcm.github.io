require("dotenv").config(); // Load environment variables from .env
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    return;
  }
  console.log("✅ Connected to MySQL database");
});

// ✅ Example Route to Check Connection
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// ✅ Fetch Customers (Example API)
app.get("/customers", (req, res) => {
  db.query("SELECT * FROM customers", (err, results) => {
    if (err) {
      console.error("❌ Error fetching customers:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results);
    }
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
