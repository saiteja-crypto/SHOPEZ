import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AdminSidebar } from "./Dashboard";
import API from "../../api/axios";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["Processing", "Shipped", "Delivered", "Cancelled"];
const STATUS_CLASS = {
  Processing: "badge-processing",
  Shipped:    "badge-shipped",
  Delivered:  "badge-delivered",
  Cancelled:  "badge-cancelled",
};

const ManageOrders = () => {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    API.get("/orders")
      .then(({ data }) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const { data } = await API.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
      toast.success(`Order marked as ${newStatus}`);
    } catch {
      toast.error("Status update failed");
    } finally { setUpdating(null); }
  };

  return (
    <div className="admin-page">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Orders</h1>
            <p className="admin-subtitle">{orders.length} total orders</p>
          </div>
        </div>

        {loading ? <Loader /> : (
          <div className="orders-list admin-orders">
            {orders.length === 0 && (
              <p style={{ color: "var(--text-2)", padding: 40, textAlign: "center" }}>No orders yet.</p>
            )}
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-card-header"
                  onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                  <div className="order-meta">
                    <div>
                      <p className="order-id">#{order._id.slice(-8).toUpperCase()}</p>
                      <p className="order-date">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                      <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>
                        {order.user?.name} · {order.user?.email}
                      </p>
                    </div>
                    <div className="order-badges">
                      <span className={`badge ${STATUS_CLASS[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                      <span className={`badge ${order.paymentStatus === "Paid" ? "badge-paid" : "badge-pending"}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="order-total-col">
                      <p className="order-total">₹{order.totalPrice.toLocaleString()}</p>
                      <p className="order-method">{order.paymentMethod}</p>
                    </div>
                    {/* Status selector */}
                    <select
                      className="status-select"
                      value={order.orderStatus}
                      onChange={e => { e.stopPropagation(); handleStatusChange(order._id, e.target.value); }}
                      onClick={e => e.stopPropagation()}
                      disabled={updating === order._id}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <button className="order-expand-btn">
                    {expanded === order._id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                  </button>
                </div>

                {expanded === order._id && (
                  <div className="order-detail">
                    <div className="order-items-list">
                      {order.items.map((item, i) => (
                        <div key={i} className="order-item">
                          <img src={item.thumbnail || `https://placehold.co/56x56/ffffff/2563eb?text=P`} alt={item.name} />
                          <div className="order-item-info">
                            <p>{item.name}</p>
                            <span>Qty: {item.quantity} × ₹{item.price}</span>
                          </div>
                          <p className="order-item-total">₹{(item.quantity * item.price).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <div className="order-detail-bottom">
                      <div className="order-address">
                        <h4>Ship to</h4>
                        <p>
                          {order.shippingAddress.street},<br />
                          {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                        </p>
                      </div>
                      <div className="order-price-breakdown">
                        <div className="summary-row"><span>Items</span><span>₹{order.itemsPrice?.toLocaleString()}</span></div>
                        <div className="summary-row">
                          <span>Shipping</span>
                          <span>{order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice}`}</span>
                        </div>
                        <div className="summary-total">
                          <span>Total</span>
                          <span>₹{order.totalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;