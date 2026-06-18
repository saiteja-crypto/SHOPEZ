import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ShoppingBag, CreditCard, Smartphone, Building, Banknote } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const PAYMENT_METHODS = [
  { value: "Online", label: "Pay Online",        emoji: "💳", desc: "UPI, Card, NetBanking", icon: <CreditCard size={18}/> },
  { value: "COD",    label: "Cash on Delivery",  emoji: "💵", desc: "Pay when delivered",   icon: <Banknote size={18}/> },
];

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street:  user?.address?.street  || "",
    city:    user?.address?.city    || "",
    state:   user?.address?.state   || "",
    pincode: user?.address?.pincode || "",
    country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("Online");
  const [placing, setPlacing]   = useState(false);
  const [placed, setPlaced]     = useState(false);
  const [orderId, setOrderId]   = useState("");

  const shippingPrice = (cart.totalPrice || 0) > 500 ? 0 : 50;
  const grandTotal    = (cart.totalPrice || 0) + shippingPrice;

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleChange = (e) =>
    setAddress({ ...address, [e.target.name]: e.target.value });

  const validateForm = () => {
    const { street, city, state, pincode } = address;
    if (!street || !city || !state || !pincode) {
      toast.error("Please fill in all address fields");
      return false;
    }
    if (!cart.items || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return false;
    }
    return true;
  };

  // Place COD order
  const placeCODOrder = async () => {
    setPlacing(true);
    try {
      const { data } = await API.post("/orders", {
        shippingAddress: address,
        paymentMethod: "COD",
      });
      setOrderId(data.order._id);
      setPlaced(true);
      toast.success("Order placed successfully! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  // Place Online order via Razorpay
  const placeOnlineOrder = async () => {
    setPlacing(true);
    try {
      // Step 1: Create shop order first
      const orderRes = await API.post("/orders", {
        shippingAddress: address,
        paymentMethod: "Online",
      });
      const shopOrder = orderRes.data.order;

      // Step 2: Create Razorpay order
      const payRes = await API.post("/payment/create-order", {
        amount: grandTotal,
      });

      // Step 3: Open Razorpay checkout
      const options = {
        key:         payRes.data.keyId,
        amount:      payRes.data.amount,
        currency:    payRes.data.currency,
        name:        "ShopEZ",
        description: "Order Payment",
        order_id:    payRes.data.orderId,
        prefill: {
          name:    user.name,
          email:   user.email,
          contact: user.phone || "",
        },
        theme: { color: "#2563eb" },
        handler: async (response) => {
          try {
            // Step 4: Verify payment
            await API.post("/payment/verify", {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              shopOrderId:         shopOrder._id,
            });
            setOrderId(shopOrder._id);
            setPlaced(true);
            toast.success("Payment successful! Order placed 🎉");
          } catch {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
            setPlacing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
      setPlacing(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (paymentMethod === "COD") {
      await placeCODOrder();
    } else {
      await placeOnlineOrder();
    }
  };

  // Success screen
  if (placed) {
    return (
      <div className="container">
        <div className="order-success">
          <div className="success-icon"><CheckCircle size={64} /></div>
          <h2>Order Placed!</h2>
          <p>Your order has been placed successfully.</p>
          {paymentMethod === "Online" && (
            <p className="success-paid">✅ Payment confirmed</p>
          )}
          {paymentMethod === "COD" && (
            <p className="success-cod">💵 Pay on delivery</p>
          )}
          <p className="order-id-label">Order ID: <strong>#{orderId.slice(-8).toUpperCase()}</strong></p>
          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => navigate("/orders")}>
              View My Orders
            </button>
            <button className="btn btn-outline" onClick={() => navigate("/products")}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page container">
      <div className="page-header">
        <h1 className="page-title">Check<span>out</span></h1>
        <p className="page-subtitle">Complete your order</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="checkout-layout">
        {/* Left */}
        <div className="checkout-left">

          {/* Shipping address */}
          <div className="checkout-section">
            <h3 className="checkout-section-title">📦 Shipping Address</h3>
            <div className="checkout-fields">
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Street Address</label>
                <input name="street" className="form-input"
                  placeholder="House no., Street, Area"
                  value={address.street} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input name="city" className="form-input" placeholder="City"
                  value={address.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input name="state" className="form-input" placeholder="State"
                  value={address.state} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input name="pincode" className="form-input" placeholder="6-digit pincode"
                  value={address.pincode} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input name="country" className="form-input" value={address.country} readOnly />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="checkout-section">
            <h3 className="checkout-section-title">💳 Payment Method</h3>
            <div className="payment-options">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`payment-option ${paymentMethod === m.value ? "active" : ""}`}
                >
                  <input
                    type="radio" name="payment"
                    value={m.value}
                    checked={paymentMethod === m.value}
                    onChange={() => setPaymentMethod(m.value)}
                  />
                  <div className="payment-option-icon">{m.icon}</div>
                  <div className="payment-option-info">
                    <span className="payment-option-label">{m.label}</span>
                    <span className="payment-option-desc">{m.desc}</span>
                  </div>
                  {paymentMethod === m.value && (
                    <div className="payment-option-check">✓</div>
                  )}
                </label>
              ))}
            </div>

            {paymentMethod === "Online" && (
              <div className="razorpay-info">
                <p>🔒 Secured by Razorpay</p>
                <div className="razorpay-methods">
                  <span>💳 Cards</span>
                  <span>📱 UPI</span>
                  <span>🏦 NetBanking</span>
                  <span>👛 Wallets</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — Order summary */}
        <div className="checkout-right">
          <div className="checkout-summary">
            <h3 className="summary-title">Order Summary</h3>

            <div className="checkout-items-list">
              {cart.items?.map((item) => (
                item.product && (
                  <div key={item.product._id} className="checkout-item">
                    <img
                      src={item.product.thumbnail || `https://placehold.co/50x50/ffffff/2563eb?text=P`}
                      alt={item.product.name}
                    />
                    <div className="checkout-item-info">
                      <p>{item.product.name}</p>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <p className="checkout-item-price">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                )
              ))}
            </div>

            <hr className="divider" />

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cart.totalPrice?.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className={shippingPrice === 0 ? "free-shipping" : ""}>
                  {shippingPrice === 0 ? "FREE" : `₹${shippingPrice}`}
                </span>
              </div>
            </div>

            <hr className="divider" />

            <div className="summary-total">
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={placing}
            >
              {placing ? (
                "Processing..."
              ) : paymentMethod === "Online" ? (
                <><CreditCard size={18}/> Pay ₹{grandTotal.toLocaleString()}</>
              ) : (
                <><ShoppingBag size={18}/> Place Order</>
              )}
            </button>

            {paymentMethod === "Online" && (
              <p className="secure-note">🔒 100% secure payment via Razorpay</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;