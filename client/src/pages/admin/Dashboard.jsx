import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart,
  Users, TrendingUp, DollarSign, Star
} from "lucide-react";
import API from "../../api/axios";
import Loader from "../../components/Loader";

export const AdminSidebar = () => {
  const { pathname } = useLocation();
  const links = [
    { to: "/admin",          label: "Dashboard",   icon: <LayoutDashboard size={17}/> },
    { to: "/admin/products", label: "Products",    icon: <Package size={17}/> },
    { to: "/admin/orders",   label: "Orders",      icon: <ShoppingCart size={17}/> },
  ];
  return (
    <aside className="admin-sidebar">
      <p className="admin-sidebar-label">Admin Panel</p>
      {links.map(l => (
        <Link key={l.to} to={l.to}
          className={`admin-nav-item ${pathname === l.to ? "active" : ""}`}>
          {l.icon} {l.label}
        </Link>
      ))}
      <div style={{ marginTop: "auto" }}>
        <Link to="/" className="admin-nav-item">← Back to Store</Link>
      </div>
    </aside>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: `${color}18`, color }}>{icon}</div>
    <div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/admin/stats")
      .then(({ data }) => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-page">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-header">
          <h1 className="admin-title">Dashboard</h1>
          <p className="admin-subtitle">Welcome back, Admin</p>
        </div>

        {loading ? <Loader /> : stats && (
          <>
            <div className="stats-grid">
              <StatCard icon={<Users size={22}/>}        label="Total Users"    value={stats.totalUsers}    color="#4f8ef7" />
              <StatCard icon={<Package size={22}/>}      label="Total Products" value={stats.totalProducts} color="#2563eb" />
              <StatCard icon={<ShoppingCart size={22}/>} label="Total Orders"   value={stats.totalOrders}   color="#f0c040" />
              <StatCard icon={<DollarSign size={22}/>}   label="Revenue (Paid)" value={`₹${stats.revenue?.toLocaleString()}`} color="#4caf7d" />
            </div>

            <div className="admin-quick-links">
              <h3 className="admin-section-title">Quick Actions</h3>
              <div className="quick-links-grid">
                <Link to="/admin/products" className="quick-link-card">
                  <Package size={28}/>
                  <span>Manage Products</span>
                  <p>Add, edit or remove products</p>
                </Link>
                <Link to="/admin/orders" className="quick-link-card">
                  <ShoppingCart size={28}/>
                  <span>Manage Orders</span>
                  <p>Update order status & track</p>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;