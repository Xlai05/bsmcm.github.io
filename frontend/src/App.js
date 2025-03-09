import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import Suppliers from "./pages/Suppliers";
import EmployeeManagement from "./pages/EmployeeManagement";
import SalesReport from "./pages/SalesReport";
import Settings from "./pages/Settings";

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
