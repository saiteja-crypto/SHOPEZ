import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X, Package, LogOut, LayoutDashboard, Search, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import SearchBar from "./SearchBar";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/");
    setUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMenuOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span>SHOPEZ</span>
        </Link>

        {/* Search bar — desktop */}
        <SearchBar />

        {/* Nav links — desktop */}
        <div className="navbar-links">
          <Link to="/products" className="nav-link">Products</Link>

          {/* Wishlist */}
          {user && (
            <Link to="/wishlist" className="nav-icon-btn">
              <Heart size={20} />
              {wishlist.length > 0 && <span className="cart-badge">{wishlist.length}</span>}
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" className="nav-icon-btn">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* User menu */}
          {user ? (
            <div className="user-menu-wrap">
              <button
                className="nav-icon-btn user-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="user-avatar">{user.name[0].toUpperCase()}</div>
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <p className="user-dropdown-name">{user.name}</p>
                    <p className="user-dropdown-email">{user.email}</p>
                  </div>
                  <Link to="/profile"  className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <User size={15} /> Profile
                  </Link>
                  <Link to="/orders"   className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <Package size={15} /> My Orders
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin" className="dropdown-item admin-link" onClick={() => setUserMenuOpen(false)}>
                      <LayoutDashboard size={15} /> Admin Panel
                    </Link>
                  )}
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login"    className="btn-ghost">Login</Link>
              <Link to="/register" className="btn-primary-sm">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <SearchBar mobile onClose={() => setMenuOpen(false)} />
          <Link to="/products" className="mobile-link" onClick={() => setMenuOpen(false)}>Products</Link>
          <Link to="/cart"     className="mobile-link" onClick={() => setMenuOpen(false)}>
            Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>Profile</Link>
              <Link to="/orders"  className="mobile-link" onClick={() => setMenuOpen(false)}>My Orders</Link>
              {user.role === "admin" && (
                <Link to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
              )}
              <button className="mobile-link mobile-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="mobile-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="mobile-link" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;