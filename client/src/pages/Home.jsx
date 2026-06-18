import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingBag, Zap, Shield, Truck, RotateCcw, Star } from "lucide-react";
import API from "../api/axios";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

const CATEGORIES = [
  { name: "Electronics",   emoji: "💻", color: "#4f8ef7" },
  { name: "Clothing",      emoji: "👕", color: "#2563eb" },
  { name: "Footwear",      emoji: "👟", color: "#f0c040" },
  { name: "Home & Living", emoji: "🏠", color: "#4caf7d" },
  { name: "Books",         emoji: "📚", color: "#b47cf7" },
  { name: "Beauty",        emoji: "✨", color: "#f77fc1" },
  { name: "Sports",        emoji: "⚽", color: "#f0a040" },
  { name: "Toys",          emoji: "🎮", color: "#40c0f0" },
];

const FEATURES = [
  { icon: <Truck size={22} />,     title: "Free Delivery",     desc: "On orders above ₹500" },
  { icon: <RotateCcw size={22} />, title: "Easy Returns",      desc: "7-day hassle-free returns" },
  { icon: <Shield size={22} />,    title: "Secure Payments",   desc: "100% safe transactions" },
  { icon: <Zap size={22} />,       title: "Fast Shipping",     desc: "Delivered within 3–5 days" },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/products/featured")
      .then(({ data }) => setFeatured(data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg-grid" />
        <div className="hero-glow" />
        <div className="container hero-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Zap size={13} /> New arrivals every week
            </div>
            <h1 className="hero-title">
              Shop Smarter,<br />
              Live <span>Better</span>
            </h1>
            <p className="hero-desc">
              Discover thousands of products across every category.
              Unbeatable prices, lightning-fast delivery, zero hassle.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/products?category=Electronics" className="btn btn-outline">
                Explore Electronics
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><strong>50K+</strong><span>Products</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>10K+</strong><span>Customers</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>4.8</strong><span><Star size={12} fill="currentColor" /> Rating</span></div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card hero-card-main">
              <ShoppingBag size={48} />
              <p>Everything<br />you need</p>
            </div>
            <div className="hero-card hero-card-float hero-card-1">
              <span>🔥</span> Trending
            </div>
            <div className="hero-card hero-card-float hero-card-2">
              <span>🚀</span> Fast Delivery
            </div>
            <div className="hero-card hero-card-float hero-card-3">
              <span>💎</span> Premium
            </div>
          </div>
        </div>
      </section>

      {/* ── Features strip ── */}
      <section className="features-strip">
        <div className="container features-grid">
          {FEATURES.map((f, i) => (
            <div className="feature-item" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Shop by <span>Category</span></h2>
            <p className="section-subtitle">Browse our wide selection of product categories</p>
          </div>
        </div>
        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="category-card"
              style={{ "--cat-color": cat.color }}
            >
              <span className="cat-emoji">{cat.emoji}</span>
              <span className="cat-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured <span>Products</span></h2>
            <p className="section-subtitle">Hand-picked deals you'll love</p>
          </div>
          <Link to="/products" className="view-all">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? <Loader /> : (
          featured.length > 0 ? (
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="no-featured">
              <ShoppingBag size={40} />
              <p>No featured products yet. <Link to="/products">Browse all products →</Link></p>
            </div>
          )
        )}
      </section>

      {/* ── Promo Banner ── */}
      <section className="container">
        <div className="promo-banner">
          <div className="promo-glow" />
          <div className="promo-content">
            <span className="promo-tag">Limited Time Offer</span>
            <h2>Get <span>20% OFF</span> your first order</h2>
            <p>Use code <strong>SHOPEZ20</strong> at checkout. New users only.</p>
            <Link to="/register" className="btn btn-gold">
              Claim Offer <ArrowRight size={16} />
            </Link>
          </div>
          <div className="promo-decoration">
            <div className="promo-circle c1" />
            <div className="promo-circle c2" />
            <div className="promo-circle c3" />
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;