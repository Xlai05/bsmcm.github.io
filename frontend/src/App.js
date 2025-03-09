import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import Suppliers from "./pages/Suppliers";
import Employees from "./pages/Employees";
import SalesReport from "./pages/SalesReport";
import Settings from "./pages/Settings";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <nav className="bg-blue-500 p-4 text-white">
          <ul className="flex space-x-4">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/orders">Orders</Link></li>
            <li><Link to="/customers">Customers</Link></li>
            <li><Link to="/inventory">Inventory</Link></li>
            <li><Link to="/suppliers">Suppliers</Link></li>
            <li><Link to="/employees">Employees</Link></li>
            <li><Link to="/sales-report">Sales Report</Link></li>
            <li><Link to="/settings">Settings</Link></li>
          </ul>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/sales-report" element={<SalesReport />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
