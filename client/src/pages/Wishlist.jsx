import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const Wishlist = () => {
  const { wishlist, wishlistLoading, toggleWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlistLoading) return <Loader />;

  const handleRemove = async (productId, name) => {
    try {
      await toggleWishlist(productId);
      toast.success(`${name} removed from wishlist`);
    } catch { toast.error("Failed to remove"); }
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId);
      toast.success("Added to cart!");
    } catch { toast.error("Failed to add to cart"); }
  };

  return (
    <div className="wishlist-page container">
      <div className="page-header">
        <h1 className="page-title">My <span>Wishlist</span></h1>
        <p className="page-subtitle">{wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <Heart size={64} />
          <h3>Your wishlist is empty</h3>
          <p>Save items you love by clicking the heart icon on any product.</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <>
          <div className="wishlist-grid">
            {wishlist.map(product => (
              <div key={product._id} className="wishlist-card">
                <Link to={`/products/${product._id}`} className="wishlist-img">
                  <img
                    src={product.thumbnail || `https://placehold.co/300x300/ffffff/2563eb?text=${encodeURIComponent(product.name)}`}
                    alt={product.name}
                  />
                  {product.discountPrice && (
                    <span className="discount-badge">
                      {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                    </span>
                  )}
                </Link>

                <div className="wishlist-info">
                  <span className="product-category">{product.category}</span>
                  <Link to={`/products/${product._id}`} className="wishlist-name">
                    {product.name}
                  </Link>
                  <div className="wishlist-price-row">
                    <div className="product-prices">
                      {product.discountPrice ? (
                        <>
                          <span className="price-current">₹{product.discountPrice}</span>
                          <span className="price-original">₹{product.price}</span>
                        </>
                      ) : (
                        <span className="price-current">₹{product.price}</span>
                      )}
                    </div>
                    <span style={{
                      fontSize: 12,
                      color: product.stock > 0 ? "var(--success)" : "var(--error)",
                      fontWeight: 600
                    }}>
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  <div className="wishlist-actions">
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: 13, padding: "9px 14px" }}
                      onClick={() => handleAddToCart(product._id)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart size={15} /> Add to Cart
                    </button>
                    <button
                      className="wishlist-remove-btn"
                      onClick={() => handleRemove(product._id, product.name)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="clear-wishlist-btn"
            onClick={() => { clearWishlist(); toast.success("Wishlist cleared"); }}
          >
            <Trash2 size={14} /> Clear Wishlist
          </button>
        </>
      )}
    </div>
  );
};

export default Wishlist;