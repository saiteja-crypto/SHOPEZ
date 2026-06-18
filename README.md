# 🛍️ ShopEZ – Full-Stack E-Commerce Platform
USE OF AI 

**Your one-stop destination for effortless online shopping.**

[🚀 View Live Demo](#-live-demo) · [🐛 Report Bug](https://github.com/saiteja-crypto/SHOPEZ/issues) · [✨ Request Feature](https://github.com/saiteja-crypto/SHOPEZ/issues)

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🌐 **Frontend** | https://shopez-beta.vercel.app |
| 🔧 **Backend API** | https://shopez-jxoe.onrender.com |

### 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 👤 **User** | user@shopez.com | user123 |
| 👑 **Admin** | admin@shopez.com | admin123 |

> ⚠️ **Note:** Backend hosted on Render free tier — first load may take ~30 seconds to wake up.

---

## ✨ Features

### 👤 User Features

- 🔐 Register & Login with JWT Authentication
- 🛍️ Browse **216+ products** across 9 categories
- 🔍 Search & filter by category, price, rating, sort options
- 🛒 Add to cart, update quantities, remove items
- ❤️ Wishlist — save products for later
- 💳 Secure checkout with address & payment method
- 📦 Order confirmation with unique order ID
- 👤 Profile page with complete order history
- ⭐ Write product reviews with star ratings

### 👑 Admin Features

- 📊 Dashboard with total stats (Users, Products, Orders, Revenue)
- 📦 Manage products — Add, Edit, Delete
- 🛍️ Manage orders — Update status (Pending → Delivered)
- 👥 Manage users — View & Delete
- 📈 Real-time analytics

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js 19, React Router v7, Axios, Vite |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Auth** | JWT (JSON Web Tokens), bcryptjs |
| **Styling** | Vanilla CSS (Glassmorphism, Dark Theme) |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas |

---

## 📁 Project Structure

```
ShopEZ/
├── client/                          # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # Axios instance with API base URL
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── WishlistContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Privacy.jsx
│   │   │   ├── Terms.jsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── ManageProducts.jsx
│   │   │       └── ManageOrders.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── vercel.json                 # Vercel SPA routing config
│   ├── package.json
│   └── .env.example
│
└── server/                          # Node.js + Express Backend
    ├── config/
    │   ├── db.js                   # MongoDB connection
    │   └── cloudinary.js           # Cloudinary config for image uploads
    ├── middleware/
    │   └── authMiddleware.js       # JWT authentication
    ├── models/
    │   ├── User.js
    │   ├── Product.js
    │   ├── Cart.js
    │   ├── Order.js
    │   └── Wishlist.js
    ├── controllers/
    │   ├── authController.js
    │   ├── productController.js
    │   ├── cartController.js
    │   ├── orderController.js
    │   └── (more controllers)
    ├── routes/
    │   ├── authRoutes.js
    │   ├── productRoutes.js
    │   ├── cartRoutes.js
    │   ├── orderRoutes.js
    │   ├── adminRoutes.js
    │   ├── uploadRoutes.js
    │   ├── paymentRoutes.js
    │   └── wishlistRoutes.js
    ├── utils/
    │   └── sendEmail.js
    ├── index.js                    # Entry point
    ├── seeder.js                   # Database seeder (216+ products)
    ├── render.yaml                 # Render deployment config
    ├── package.json
    └── .env.example
```

---

## 🚀 Run Locally

### Prerequisites

- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)
- npm or yarn

### 1. Clone the repo

```bash
git clone https://github.com/saiteja-crypto/SHOPEZ.git
cd SHOPEZ
```

### 2. Setup Backend

```bash
cd server
npm install

# Create .env file (copy from .env.example)
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, etc.

# Seed database with 216+ products
node seeder.js

# Start development server
npm run dev       # Runs on http://localhost:8000
```

### 3. Setup Frontend

```bash
cd client
npm install

# Start Vite dev server
npm run dev       # Runs on http://localhost:5173
```

### 4. Build for Production

```bash
# Frontend
cd client
npm run build     # Creates optimized dist/ folder

# Backend is ready to deploy as-is
```

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/profile` | Get user profile | User |

### Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | Get all products (paginated) | Public |
| GET | `/api/products/featured` | Get featured products | Public |
| GET | `/api/products/:id` | Get product details | Public |
| POST | `/api/products/:id/review` | Add product review | User |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |

### Cart
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/cart` | Get user cart | User |
| POST | `/api/cart/add` | Add item to cart | User |
| PUT | `/api/cart/update/:id` | Update cart item | User |
| DELETE | `/api/cart/remove/:id` | Remove item from cart | User |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Place new order | User |
| GET | `/api/orders/my` | Get user's orders | User |
| GET | `/api/orders` | Get all orders | Admin |
| GET | `/api/orders/:id` | Get order by ID | User/Admin |
| PUT | `/api/orders/:id/status` | Update order status | Admin |

### Wishlist
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/wishlist` | Get user wishlist | User |
| POST | `/api/wishlist/add` | Add to wishlist | User |
| DELETE | `/api/wishlist/remove/:id` | Remove from wishlist | User |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/stats` | Dashboard statistics | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |

---

## 🎨 Design Highlights

- 🌑 **Dark Theme** with purple `#7c3aed` primary color
- ✨ **Glassmorphism** cards with backdrop-filter blur effect
- 🌈 **Gradient text** and buttons for visual appeal
- 💫 **Smooth CSS animations** and transitions
- 📱 **Fully responsive** — optimized for mobile, tablet, and desktop
- 🔤 **Modern typography** with system fonts

---

## 📦 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  createdAt: Date
}
```

### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  discountPrice: Number,
  category: String,
  brand: String,
  stock: Number,
  thumbnail: String (URL),
  images: [String],
  rating: Number,
  numReviews: Number,
  reviews: [{ user, rating, comment }],
  isFeatured: Boolean,
  isActive: Boolean,
  createdAt: Date
}
```

### Order Model
```javascript
{
  user: ObjectId,
  items: [{ product, quantity, price }],
  total: Number,
  shippingAddress: String,
  paymentMethod: String,
  status: String (Pending/Shipped/Delivered),
  createdAt: Date
}
```

## 👨‍💻 Skills Demonstrated

`HTML` `CSS` `JavaScript` `React.js` `Node.js` `Express.js` `MongoDB` `Mongoose` `JWT Authentication` `REST API` `Responsive Design` `Git` `GitHub` `Vercel` `Render` `MongoDB Atlas` `Environment Variables` `Error Handling` `State Management`

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to:
my contributor ::  https://github.com/NakkaManiSagar/ShopEZ
Thank you Brother

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📧 Contact

For questions or support, reach out via:

- **GitHub:** [saiteja-crypto](https://github.com/saiteja-crypto)
- **Email:** tech69251@gmail.com

---

**Made with ❤️ by Saiteja**

