import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

import Navbar  from "./components/Navbar";
import Footer  from "./components/Footer";

import Home          from "./pages/Home";
import Products      from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart          from "./pages/Cart";
import Checkout      from "./pages/Checkout";
import Login         from "./pages/Login";
import Register      from "./pages/Register";
import Profile       from "./pages/Profile";
import Orders        from "./pages/Orders";
import Wishlist      from "./pages/Wishlist";
import About         from "./pages/About";
import Contact       from "./pages/Contact";
import Privacy       from "./pages/Privacy";
import Terms         from "./pages/Terms";

import AdminDashboard  from "./pages/admin/Dashboard";
import ManageProducts  from "./pages/admin/ManageProducts";
import ManageOrders    from "./pages/admin/ManageOrders";

// Separate component so useLocation works inside BrowserRouter
function AppRoutes() {
  const location = useLocation();
  return (
    <Routes>
      <Route path="/"             element={<Home />} />
      <Route path="/products"     element={<Products key={location.search} />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/login"        element={<Login />} />
      <Route path="/register"     element={<Register />} />

      <Route path="/cart" element={
        <ProtectedRoute><Cart /></ProtectedRoute>
      } />
      <Route path="/checkout" element={
        <ProtectedRoute><Checkout /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute><Orders /></ProtectedRoute>
      } />
      <Route path="/wishlist" element={
        <ProtectedRoute><Wishlist /></ProtectedRoute>
      } />
      <Route path="/about"   element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms"   element={<Terms />} />

      <Route path="/admin" element={
        <AdminRoute><AdminDashboard /></AdminRoute>
      } />
      <Route path="/admin/products" element={
        <AdminRoute><ManageProducts /></AdminRoute>
      } />
      <Route path="/admin/orders" element={
        <AdminRoute><ManageOrders /></AdminRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#ffffff",
                color: "#0f172a",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                fontSize: "14px",
                boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
              },
              success: { iconTheme: { primary: "#16a34a", secondary: "#ffffff" } },
              error:   { iconTheme: { primary: "#ef4444", secondary: "#ffffff" } },
            }}
          />
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <AppRoutes />
            </main>
            <Footer />
          </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;