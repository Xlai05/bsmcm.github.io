import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

const Home = () => <h2>Home Page</h2>;
const Orders = () => <h2>Orders</h2>;
const Customers = () => <h2>Customers</h2>;
const Inventory = () => <h2>Inventory</h2>;
const Suppliers = () => <h2>Suppliers</h2>;
const EmployeeManagement = () => <h2>Employee Management</h2>;
const SalesReport = () => <h2>Sales Report</h2>;
const Settings = () => <h2>Settings</h2>;

const App = () => {
  return (
    <Router>
      <div style={{ display: "flex" }}>
        <nav style={{ width: "250px", padding: "10px", background: "#f4f4f4" }}>
          <h3>Navigation</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/orders">Orders</Link></li>
            <li><Link to="/customers">Customers</Link></li>
            <li><Link to="/inventory">Inventory</Link></li>
            <li><Link to="/suppliers">Suppliers</Link></li>
            <li><Link to="/employee-management">Employee Management</Link></li>
            <li><Link to="/sales-report">Sales Report</Link></li>
            <li><Link to="/settings">Settings</Link></li>
          </ul>
        </nav>
        <main style={{ marginLeft: "20px", padding: "10px", flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/employee-management" element={<EmployeeManagement />} />
            <Route path="/sales-report" element={<SalesReport />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
