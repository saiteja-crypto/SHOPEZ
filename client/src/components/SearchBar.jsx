import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, TrendingUp } from "lucide-react";
import API from "../api/axios";

const TRENDING = ["MacBook", "Nike", "Sony", "Books", "Yoga Mat"];

const SearchBar = ({ mobile = false, onClose }) => {
  const [query, setQuery]           = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [showDrop, setShowDrop]     = useState(false);
  const navigate  = useNavigate();
  const inputRef  = useRef(null);
  const timerRef  = useRef(null);
  const wrapRef   = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/products?search=${encodeURIComponent(query)}&limit=6`);
        setSuggestions(data.products || []);
      } catch { setSuggestions([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    setQuery(""); setShowDrop(false);
    if (onClose) onClose();
  };

  const handleSuggestionClick = (product) => {
    navigate(`/products/${product._id}`);
    setQuery(""); setShowDrop(false);
    if (onClose) onClose();
  };

  const handleTrending = (term) => {
    navigate(`/products?search=${encodeURIComponent(term)}`);
    setQuery(""); setShowDrop(false);
    if (onClose) onClose();
  };

  return (
    <div ref={wrapRef} className={`searchbar-wrap ${mobile ? "searchbar-mobile" : ""}`}>
      <form className={`searchbar ${showDrop ? "open" : ""}`} onSubmit={handleSearch}>
        <Search size={16} className="searchbar-icon" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={e => { setQuery(e.target.value); setShowDrop(true); }}
          onFocus={() => setShowDrop(true)}
          autoComplete="off"
        />
        {query && (
          <button type="button" className="searchbar-clear" onClick={() => { setQuery(""); setSuggestions([]); inputRef.current.focus(); }}>
            <X size={14} />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {showDrop && (
        <div className="search-dropdown">
          {/* Loading */}
          {loading && (
            <div className="search-loading">
              <div className="spinner" style={{ width: 18, height: 18 }} />
              <span>Searching...</span>
            </div>
          )}

          {/* Suggestions */}
          {!loading && suggestions.length > 0 && (
            <div className="search-section">
              <p className="search-section-label">Products</p>
              {suggestions.map(p => (
                <button
                  key={p._id}
                  className="search-suggestion"
                  onClick={() => handleSuggestionClick(p)}
                >
                  <img
                    src={p.thumbnail || `https://placehold.co/36x36/eff6ff/2563eb?text=P`}
                    alt=""
                  />
                  <div className="suggestion-info">
                    <span className="suggestion-name">{p.name}</span>
                    <span className="suggestion-category">{p.category}</span>
                  </div>
                  <span className="suggestion-price">
                    ₹{p.discountPrice || p.price}
                  </span>
                </button>
              ))}
              {query && (
                <button className="search-view-all" onClick={handleSearch}>
                  View all results for "{query}" →
                </button>
              )}
            </div>
          )}

          {/* No results */}
          {!loading && query && suggestions.length === 0 && (
            <div className="search-empty">
              <p>No products found for "{query}"</p>
            </div>
          )}

          {/* Trending — shown when no query */}
          {!query && (
            <div className="search-section">
              <p className="search-section-label"><TrendingUp size={12}/> Trending</p>
              {TRENDING.map(term => (
                <button key={term} className="search-trending" onClick={() => handleTrending(term)}>
                  <Search size={13} />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;