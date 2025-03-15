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

// Logout Route
app.post('/logout', (req, res) => {
    res.json({ success: true, message: "Logged out successfully" });
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

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    const sql = `DELETE FROM employees WHERE LOWER(UserName) = LOWER(?)`;
    db.query(sql, [username], (err, result) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ success: true, message: 'Employee removed successfully!' });
    });
});

// Update Stock Changes
app.post("/update-stock", (req, res) => {
    const { productName, newStock } = req.body;

    const sql = "UPDATE productdetails SET StockQuantity = ? WHERE ProductName = ?";
    db.query(sql, [newStock, productName], (err, result) => {
        if (err) {
            console.error("Error updating stock:", err);
            res.status(500).json({ success: false, error: "Failed to update stock" });
            return;
        }
        res.json({ success: true, message: "Stock updated successfully" });
    });
});


// Fetch Inventory Route
app.get("/inventory", (req, res) => {
    const sql = "SELECT ProductName, StockQuantity FROM productdetails";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching inventory:", err);
            res.status(500).json({ error: "Failed to retrieve inventory" });
            return;
        }
        res.json(results);
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

// Fetch Current User Route
app.get('/current-user', (req, res) => {
    const username = req.query.username; // Get username from query parameter

    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    const sql = `SELECT EmployeeName, Contact, Address, UserName FROM employees WHERE UserName = ?`;
    db.query(sql, [username], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json(result[0]); // Send user details without the password
    });
});

// Orders Route
app.get('/orders', (req, res) => {
    const date = req.query.date;
    console.log(`Received request for orders on date: ${date}`);

    const query = `
        SELECT 
            o.Order_ID as order_id,
            p.ProductName as product_name, 
            o.Quantity as quantity,
            p.Price as price,  // Changed from o.Price to p.Price assuming price is in productdetails table
            o.Total as total
        FROM orders o
        JOIN productdetails p ON o.product_id = p.Product_ID
        WHERE o.Date = ?
        ORDER BY o.Order_ID;
    `;

    db.query(query, [date], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
    
        if (results.length === 0) {
            return res.json({ message: 'No orders found for the selected date.' });
        }

        res.json(results);
    });
});

// Sales Report Route
app.get('/sales-report', (req, res) => {
    const date = req.query.date;
    console.log(`Received request for date: ${date} Type: daily`);

    const query = `
        SELECT 
    p.ProductName AS product_name, 
    SUM(o.quantity) AS total_sold,
    CASE 
        WHEN o.ProductType = 1 THEN COALESCE(pc.RefillPrice, 0)
        WHEN o.ProductType = 2 THEN COALESCE(pc.ProductPrice, 0)
        ELSE NULL
    END AS price,
    CASE 
        WHEN o.ProductType = 1 THEN 'Refill'
        WHEN o.ProductType = 2 THEN 'Bought'
        ELSE 'Unknown'
    END AS classification
FROM orders o
JOIN productdetails p ON o.product_id = p.Product_ID
JOIN productcategories pc ON p.Category_ID = pc.Category_ID
WHERE o.Date = ?
GROUP BY o.product_id, p.ProductName, o.ProductType, pc.RefillPrice, pc.ProductPrice
ORDER BY total_sold DESC;
    `;

    const totalQuery = `
        SELECT 
            SUM(o.quantity * 
                CASE 
                    WHEN o.ProductType = 1 THEN pc.RefillPrice
                    WHEN o.ProductType = 2 THEN pc.ProductPrice
                    ELSE 0 
                END
            ) AS total_gained
        FROM orders o
        JOIN productdetails p ON o.product_id = p.Product_ID
        JOIN productcategories pc ON p.Category_ID = pc.Category_ID
        WHERE o.Date = ?;
    `;

    db.query(query, [date], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
    
        console.log('🛠️ DEBUG: Query results before sending to frontend:', JSON.stringify(results, null, 2));
    
        if (results.length === 0) {
            return res.json({ message: 'No sales data found for the selected date.' });
        }
    
        db.query(totalQuery, [date], (err, totalResult) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
    
            const totalGained = totalResult[0].total_gained || 0;
            res.json({ salesData: results, totalGained });
        });
    });
    
});

// Fetch Materials Route
app.get('/materials', (req, res) => {
    const sql = `SELECT Item_ID, Item_name, Cost FROM materials ORDER BY Item_ID`;
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

// Change Password Route
app.post('/change-password', (req, res) => {
    const { username, currentPassword, newPassword } = req.body;

    if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const sqlSelect = "SELECT * FROM employees WHERE UserName = ?";
    db.query(sqlSelect, [username], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = result[0];
        if (user.Password !== currentPassword) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        const sqlUpdate = "UPDATE employees SET Password = ? WHERE UserName = ?";
        db.query(sqlUpdate, [newPassword, username], (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Database error" });
            }
            res.json({ message: "Password changed successfully" });
        });
    });
});

// Fetch Products Route
app.get("/products", (req, res) => {
    const sql = "SELECT Product_ID, ProductName, StockQuantity FROM productdetails";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching products:", err);
            res.status(500).json({ error: "Failed to retrieve products" });
            return;
        }
        res.json(results);
    });
});

// Place Order Route
app.post("/place-order", (req, res) => {
    const { customerName, customerContact, customerAddress, product_id, quantity, productType, orderStatus } = req.body;

    if (!customerName || !customerContact || !customerAddress || !product_id || !quantity || !productType || !orderStatus) {
        return res.status(400).json({ error: "All fields are required." });
    }

    console.log(" Debug: Received Order Data:", req.body);

    const customerQuery = `
        INSERT INTO customers (Name, Contact, Address) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE Name=VALUES(Name), Contact=VALUES(Contact), Address=VALUES(Address)
    `;

    db.query(customerQuery, [customerName, customerContact, customerAddress], (err, result) => {
        if (err) {
            console.error(" Error inserting customer:", err);
            return res.status(500).json({ error: "Failed to insert customer." });
        }

        const customer_id = result.insertId || result.affectedRows;
        console.log(" Debug: Inserted/Retrieved Customer ID:", customer_id);

        const orderQuery = `
            INSERT INTO orders (Product_ID, Customer_ID, Quantity, ProductType, Status_ID) 
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(orderQuery, [product_id, customer_id, quantity, productType, orderStatus], (err, orderResult) => {
            if (err) {
                console.error(" Error inserting order:", err);
                return res.status(500).json({ error: "Failed to place order." });
            }

            console.log(" Debug: Inserted Order ID:", orderResult.insertId);
            res.json({ message: "Order placed successfully!" });
        });
    });
});




// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});