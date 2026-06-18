import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const Cart = () => {
  const { cart, cartLoading, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartLoading) return <Loader />;

  const shippingPrice = cart.totalPrice > 500 ? 0 : 50;
  const grandTotal    = cart.totalPrice + shippingPrice;

  const handleRemove = async (productId, name) => {
    try {
      await removeFromCart(productId);
      toast.success(`${name} removed`);
    } catch { toast.error("Failed to remove item"); }
  };

  const handleQty = async (productId, qty) => {
    try { await updateQuantity(productId, qty); }
    catch { toast.error("Failed to update quantity"); }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container">
        <div className="empty-state" style={{ minHeight: "60vh" }}>
          <ShoppingBag size={64} />
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <div className="page-header">
        <h1 className="page-title">Your <span>Cart</span></h1>
        <p className="page-subtitle">{cart.items.length} item{cart.items.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="cart-layout">
        {/* Items list */}
        <div className="cart-items">
          <div className="cart-items-header">
            <span>Product</span>
            <span>Qty</span>
            <span>Price</span>
            <span></span>
          </div>

          {cart.items.map((item) => {
            const product = item.product;
            if (!product) return null;
            return (
              <div key={product._id} className="cart-item">
                <div className="cart-item-info">
                  <img
                    src={product.thumbnail || `https://placehold.co/80x80/ffffff/2563eb?text=${encodeURIComponent(product.name)}`}
                    alt={product.name}
                  />
                  <div>
                    <Link to={`/products/${product._id}`} className="cart-item-name">
                      {product.name}
                    </Link>
                    <p className="cart-item-category">{product.category}</p>
                    <p className="cart-item-unit-price">₹{item.price} each</p>
                  </div>
                </div>

                <div className="qty-control cart-qty">
                  <button onClick={() => handleQty(product._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}>
                    <Minus size={13} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQty(product._id, item.quantity + 1)}
                    disabled={item.quantity >= product.stock}>
                    <Plus size={13} />
                  </button>
                </div>

                <p className="cart-item-total">₹{(item.price * item.quantity).toLocaleString()}</p>

                <button className="cart-remove-btn"
                  onClick={() => handleRemove(product._id, product.name)}>
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          <button className="clear-cart-btn" onClick={() => { clearCart(); toast.success("Cart cleared"); }}>
            <Trash2 size={14} /> Clear cart
          </button>
        </div>

        {/* Order summary */}
        <div className="cart-summary">
          <h3 className="summary-title">Order Summary</h3>

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
            {shippingPrice > 0 && (
              <p className="shipping-hint">Add ₹{500 - cart.totalPrice} more for free shipping</p>
            )}
          </div>

          <hr className="divider" />

          <div className="summary-total">
            <span>Total</span>
            <span>₹{grandTotal.toLocaleString()}</span>
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout <ArrowRight size={16} />
          </button>

          <Link to="/products" className="btn btn-outline btn-full" style={{ marginTop: 10 }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;