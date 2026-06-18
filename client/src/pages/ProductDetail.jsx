import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShoppingCart, Star, Truck, Shield, RotateCcw,
  Plus, Minus, Package, ChevronLeft, ChevronRight
} from "lucide-react";
import API from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [qty, setQty]             = useState(1);
  const [adding, setAdding]       = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef(null);

  // Review form
  const [review, setReview]         = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch(() => navigate("/products"))
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-slide logic
  const nextImage = useCallback((images) => {
    setActiveImg(prev => (prev + 1) % images.length);
  }, []);

  const prevImage = useCallback((images) => {
    setActiveImg(prev => (prev - 1 + images.length) % images.length);
  }, []);

  useEffect(() => {
    if (!product) return;
    const images = getImages(product);
    if (images.length <= 1 || !isAutoPlaying) return;

    autoPlayRef.current = setInterval(() => {
      nextImage(images);
    }, 3000);

    return () => clearInterval(autoPlayRef.current);
  }, [product, isAutoPlaying, nextImage]);

  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    clearInterval(autoPlayRef.current);
    // Resume after 6 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 6000);
  };

  const getImages = (p) => {
    if (p.images?.length > 0) return p.images;
    if (p.thumbnail) return [p.thumbnail];
    return [`https://placehold.co/600x600/ffffff/2563eb?text=${encodeURIComponent(p.name)}`];
  };

  if (loading) return <Loader />;
  if (!product) return null;

  const images = getImages(product);

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (!user) { navigate("/login"); return; }
    setAdding(true);
    try {
      await addToCart(product._id, qty);
      toast.success(`${qty} item${qty > 1 ? "s" : ""} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally { setAdding(false); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    setSubmitting(true);
    try {
      await API.post(`/products/${id}/review`, review);
      toast.success("Review submitted!");
      const { data } = await API.get(`/products/${id}`);
      setProduct(data.product);
      setReview({ rating: 5, comment: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="product-detail-page container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`}>{product.category}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      {/* Main grid */}
      <div className="pd-grid">
        {/* Images */}
        <div className="pd-images">
          {/* Main image with slider */}
          <div className="pd-slider">
            {/* Slides */}
            <div className="pd-slides-wrap">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`pd-slide ${i === activeImg ? "active" : ""}`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </div>
              ))}
            </div>

            {/* Discount badge */}
            {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}

            {/* Arrows — only show if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  className="slider-arrow slider-prev"
                  onClick={() => { prevImage(images); pauseAutoPlay(); }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="slider-arrow slider-next"
                  onClick={() => { nextImage(images); pauseAutoPlay(); }}
                >
                  <ChevronRight size={20} />
                </button>

                {/* Dot indicators */}
                <div className="slider-dots">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      className={`slider-dot ${i === activeImg ? "active" : ""}`}
                      onClick={() => { setActiveImg(i); pauseAutoPlay(); }}
                    />
                  ))}
                </div>

                {/* Auto-play progress bar */}
                {isAutoPlaying && (
                  <div className="slider-progress">
                    <div
                      key={activeImg}
                      className="slider-progress-bar"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="pd-thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`pd-thumb ${i === activeImg ? "active" : ""}`}
                  onClick={() => { setActiveImg(i); pauseAutoPlay(); }}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pd-info">
          <span className="product-category">{product.category}</span>
          {product.brand && <span className="pd-brand"> · {product.brand}</span>}
          <h1 className="pd-name">{product.name}</h1>

          {/* Rating */}
          <div className="pd-rating">
            <div className="stars">
              {[1,2,3,4,5].map(n => (
                <Star key={n} size={16}
                  fill={n <= Math.round(product.rating) ? "currentColor" : "none"}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span>{product.rating?.toFixed(1)}</span>
            <span className="text-muted">({product.numReviews} review{product.numReviews !== 1 ? "s" : ""})</span>
          </div>

          {/* Price */}
          <div className="pd-price-block">
            {product.discountPrice ? (
              <>
                <span className="pd-price">₹{product.discountPrice}</span>
                <span className="pd-price-old">₹{product.price}</span>
                <span className="pd-discount-tag">Save ₹{product.price - product.discountPrice}</span>
              </>
            ) : (
              <span className="pd-price">₹{product.price}</span>
            )}
          </div>

          <p className="pd-desc">{product.description}</p>

          {/* Stock */}
          <div className="pd-stock">
            {product.stock > 0 ? (
              <span className="in-stock">✓ In Stock ({product.stock} available)</span>
            ) : (
              <span className="out-stock">✗ Out of Stock</span>
            )}
          </div>

          {/* Qty + Cart */}
          {product.stock > 0 && (
            <div className="pd-actions">
              <div className="qty-control">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={14}/></button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}><Plus size={14}/></button>
              </div>
              <button
                className="btn btn-primary pd-cart-btn"
                onClick={handleAddToCart}
                disabled={adding}
              >
                <ShoppingCart size={18} />
                {adding ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          )}

          {/* Delivery info */}
          <div className="pd-features">
            <div className="pd-feature"><Truck size={16} /> Free delivery on orders above ₹500</div>
            <div className="pd-feature"><RotateCcw size={16} /> 7-day easy return policy</div>
            <div className="pd-feature"><Shield size={16} /> Secure & encrypted payment</div>
            <div className="pd-feature"><Package size={16} /> Ships within 24 hours</div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="reviews-section">
        <h2 className="section-title">Customer <span>Reviews</span></h2>

        {product.reviews?.length > 0 ? (
          <div className="reviews-list">
            {product.reviews.map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-header">
                  <div className="review-avatar">{r.name[0]}</div>
                  <div>
                    <p className="review-name">{r.name}</p>
                    <div className="stars small">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} size={12}
                          fill={n <= r.rating ? "currentColor" : "none"}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="review-date">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                  </span>
                </div>
                <p className="review-comment">{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        )}

        {/* Write review */}
        {user && (
          <div className="review-form-wrap">
            <h3>Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className="review-form">
              <div className="form-group">
                <label className="form-label">Your Rating</label>
                <div className="star-picker">
                  {[1,2,3,4,5].map(n => (
                    <button type="button" key={n}
                      className={`star-pick ${n <= review.rating ? "active" : ""}`}
                      onClick={() => setReview({ ...review, rating: n })}
                    >
                      <Star size={24} fill={n <= review.rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea className="form-input" rows={4}
                  placeholder="Share your experience..."
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;