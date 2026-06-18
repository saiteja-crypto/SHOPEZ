import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const navigate = useNavigate();

  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    try {
      await addToCart(product._id);
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    try {
      const action = await toggleWishlist(product._id);
      toast.success(action === "added" ? "Added to wishlist ❤️" : "Removed from wishlist");
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-img-wrap">
        <img
          src={product.thumbnail || `https://placehold.co/300x300/eff6ff/2563eb?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
        />
        {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
        {product.stock === 0 && <div className="out-of-stock-overlay">Out of Stock</div>}

        {/* Wishlist heart button */}
        <button
          className={`product-wishlist-btn ${wishlisted ? "wishlisted" : ""}`}
          onClick={handleWishlist}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>

        <div className="product-rating">
          <Star size={13} fill="currentColor" />
          <span>{product.rating?.toFixed(1) || "0.0"}</span>
          <span className="review-count">({product.numReviews})</span>
        </div>

        <div className="product-price-row">
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

          <button
            className="add-cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;