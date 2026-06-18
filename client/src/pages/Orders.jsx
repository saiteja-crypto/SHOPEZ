import { useState, useEffect } from "react";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import API from "../api/axios";
import Loader from "../components/Loader";

const STATUS_CLASS = {
  Processing: "badge-processing",
  Shipped:    "badge-shipped",
  Delivered:  "badge-delivered",
  Cancelled:  "badge-cancelled",
};
const PAY_CLASS = {
  Paid:    "badge-paid",
  Pending: "badge-pending",
  Failed:  "badge-cancelled",
};

const Orders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    API.get("/orders/my")
      .then(({ data }) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="orders-page container">
      <div className="page-header">
        <h1 className="page-title">My <span>Orders</span></h1>
        <p className="page-subtitle">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <Package size={60} />
          <h3>No orders yet</h3>
          <p>When you place an order, it will appear here.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              {/* Header */}
              <div
                className="order-card-header"
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}
              >
                <div className="order-meta">
                  <div>
                    <p className="order-id">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>
                  <div className="order-badges">
                    <span className={`badge ${STATUS_CLASS[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                    <span className={`badge ${PAY_CLASS[order.paymentStatus]}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="order-total-col">
                    <p className="order-total">₹{order.totalPrice.toLocaleString()}</p>
                    <p className="order-method">{order.paymentMethod}</p>
                  </div>
                </div>
                <button className="order-expand-btn">
                  {expanded === order._id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                </button>
              </div>

              {/* Expanded detail */}
              {expanded === order._id && (
                <div className="order-detail">
                  <div className="order-items-list">
                    {order.items.map((item, i) => (
                      <div key={i} className="order-item">
                        <img
                          src={item.thumbnail || `https://placehold.co/56x56/ffffff/2563eb?text=P`}
                          alt={item.name}
                        />
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
                      <h4>Shipping to</h4>
                      <p>
                        {order.shippingAddress.street},<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
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
  );
};

export default Orders;