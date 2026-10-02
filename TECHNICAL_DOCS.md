# handii.co — Complete Technical Documentation

> **Project**: handii.co — Handmade Factory
> **Version**: 1.0.0 | **Updated**: September 2026 | **Author**: Handii Studio
> **Stack**: React 18 + Node.js/Express + MongoDB (Mongoose) + Vite

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Project Workflow & User Journeys](#4-project-workflow--user-journeys)
5. [Directory Structure](#5-directory-structure)
6. [Database Design & Schema](#6-database-design--schema)
7. [API Reference](#7-api-reference)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Authentication System](#9-authentication-system)
10. [File Upload System](#10-file-upload-system)
11. [Email Notification System](#11-email-notification-system)
12. [Admin Dashboard](#12-admin-dashboard)
13. [Customer Dashboard](#13-customer-dashboard)
14. [Cart & Checkout Flow](#14-cart--checkout-flow)
15. [Custom Order & DM Chat System](#15-custom-order--dm-chat-system)
16. [Combo & Bundle System](#16-combo--bundle-system)
17. [Coupon & Discount System](#17-coupon--discount-system)
18. [Newsletter & Subscriber System](#18-newsletter--subscriber-system)
19. [State Management (Context API)](#19-state-management-context-api)
20. [Environment Configuration](#20-environment-configuration)
21. [Local Dev Setup](#21-local-dev-setup)
22. [Data Flow Diagrams](#22-data-flow-diagrams)

---

## 1. Project Overview

**handii.co** is a full-stack e-commerce platform for a studio-based handmade crafts business.

### Product Categories

| Category | Sub-types |
|---|---|
| Pipe Cleaner | Flowers & Bouquets, Keychains & Charms |
| Resin | Alphabet Keychains, Coasters, Jhumka Earrings, Small Charms |
| Bracelets | Beaded, Disc Bead |
| Pixel Art | Ready Designs, Custom |

### Business Model
- Direct-to-customer handmade products crafted one-by-one in the Handii Studio
- Custom bespoke orders with artisan-customer DM chat for specification & quote negotiation
- WhatsApp-first order communication for Indian small business context
- Newsletter drop alerts with welcome vouchers to build loyal customer base

### Design Philosophy
- **Color Palette**: `--cream` (#fbf5e9), `--ink` (#1e3a3f), `--gold` (#e3ae49), `--rose` (#c4707a)
- **Fonts**: *Fraunces* (display serif), *Caveat* (handwritten), *Work Sans* (UI body)
- **Style**: Glassmorphism cards, soft gradients, micro-animations, hover effects

---

## 2. Technology Stack

### Frontend
| Layer | Technology | Version |
|---|---|---|
| Framework | **React** | 18.3.1 |
| Router | **React Router DOM** (Hash-based) | 7.18.3 |
| 3D Visualizer | **Three.js** | 0.186.0 |
| Styling | **Vanilla CSS** (4600+ lines) | — |
| Build Tool | **Vite** | 5.4.0 |
| Fonts | Google Fonts (Fraunces, Caveat, Work Sans) | — |

### Backend
| Layer | Technology | Version |
|---|---|---|
| Runtime | **Node.js** | v24.13.1 |
| Framework | **Express** | 5.2.1 |
| Database ORM | **Mongoose** | Latest |
| Authentication | **JWT** (jsonwebtoken) + **bcryptjs** | 9.0.3 / 3.0.3 |
| File Uploads | **Multer** | 2.3.0 |
| HTTP Logging | **Morgan** | 1.12.0 |
| Email | **Resend API** / **Nodemailer** | — |
| Environment | **dotenv** | 18.0.4 |

### Database
| Layer | Technology | Details |
|---|---|---|
| Primary DB | **MongoDB** (local) | v9.0.2 via `mongod` service |
| Shell | **mongosh** | v2.12.0 |
| GUI | **MongoDB Compass** | v1.51.0 |
| Fallback | **JSON file store** | `server/data/db.json` |
| Connection | `mongodb://127.0.0.1:27017/handii_db` | — |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
│   React App (Vite, port 5173)                               │
│   Components: Header | CartDrawer | AuthModal | WhatsApp    │
│   Pages:                                                     │
│     /          → HomePage (Hero + Shop + Combos + Reels)   │
│     /shop      → ShopPage (Full Catalog + Filters)         │
│     /combos    → CombosPage (Bundle Deals)                 │
│     /customize → CustomizePage (Bespoke + DM Chat)         │
│     /dashboard → CustomerDashboardPage (Orders + Chat)     │
│     /admin     → AdminDashboardPage (Studio Control Panel) │
│   Context: AuthContext | CartContext | WishlistContext      │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP REST /api/* (Vite proxy)
                              v
┌─────────────────────────────────────────────────────────────┐
│               EXPRESS BACKEND (port 5000)                    │
│   Routes:                                                    │
│     /api/auth          - OTP, login, register, JWT issue   │
│     /api/products      - CRUD + search + filter            │
│     /api/orders        - Place, track, update              │
│     /api/custom-orders - Bespoke inquiry + DM chat         │
│     /api/combos        - Bundle deals + margin calc        │
│     /api/coupons       - Validate, apply, admin CRUD       │
│     /api/reviews       - Product reviews                   │
│     /api/reels         - Instagram-style reels             │
│     /api/upload        - Multer image upload               │
│     /api/newsletter    - Subscribe, list, delete           │
│   Core:                                                      │
│     server/db.js       - MongoSyncedDatabase (dual-write)  │
│     server/models/     - 11 Mongoose Schemas               │
│     server/services/   - Mailer (Resend + Nodemailer)      │
└─────────────────────────────┬───────────────────────────────┘
                              │ Mongoose ODM
                              v
┌─────────────────────────────────────────────────────────────┐
│              MONGODB (localhost:27017 / handii_db)           │
│   Collections:                                               │
│     users, products, orders, customOrders, customMessages   │
│     combos, coupons, reviews, reels, subscribers, settings  │
│   + JSON Fallback: server/data/db.json (dual-write mirror)  │
└─────────────────────────────────────────────────────────────┘
```

### Dual-Write Architecture
`MongoSyncedDatabase` in `server/db.js` implements a **dual-write pattern**:

1. Every insert/update/delete writes to **in-memory JSON cache synchronously** (fast response)
2. Same operation **asynchronously mirrored to MongoDB** (fire-and-forget with `.catch()`)
3. On startup: MongoDB data loaded into memory — **MongoDB is source of truth**
4. `db.json` serves as **crash-safety backup** (written on every operation)

---

## 4. Project Workflow & User Journeys

### 4.1 Customer Shopping Journey

```
Visitor arrives at handii.co
  |
  v
Home Page (Hero + Category Grid + Featured Products + Reels + CTA)
  |
  +-- Browses Shop (/shop)
  |     +-- Filter by Category (Pipe Cleaner / Resin / Bracelets / Pixel Art)
  |     +-- Filter by Sub-category (Flowers / Keychains / Coasters...)
  |     +-- Click Color Swatch → product photo switches (smooth fade)
  |     +-- Add to Cart → Cart Drawer slides in
  |
  +-- Views Combo Deals (/combos)
  |     +-- Auto-scrolling image slideshow per combo → Add to Cart
  |
  +-- Subscribes to Drop Alerts (Contact section)
  |     +-- POST /api/newsletter/subscribe → Welcome email + WELCOME10 voucher
  |
  +-- Logs In / Registers (Auth Modal)
  |     +-- Email + Password login
  |     +-- OTP-based passwordless login
  |
  +-- Applies Coupon in Cart (WELCOME10, HANDMADE50, FESTIVE15...)
  |
  +-- Places Order → POST /api/orders → Order Confirmed
        +-- Tracked in Customer Dashboard (/dashboard)
```

### 4.2 Custom Order Journey

```
Customer → /customize → Fill Bespoke Request Form
  - Category (Pipe Cleaner / Resin / Crochet / Hampers / Clay)
  - Name, Phone, Email
  - Color preferences, Specifications, Reference Photos (upload)
  - Target Date
  |
  v
POST /api/custom-orders
  → New CUST-XXXX created (status: submitted)
  → System DM message posted in chat thread
  |
  v
DM Chat thread (Customer + Admin)
  +-- Admin sends Quote → PATCH /api/custom-orders/:id/quote
  |     → status: quoted, quotePrice + estimatedDays set
  |     → Quote offer card appears in DM chat
  |
  +-- Customer Accepts → POST /api/custom-orders/:id/accept → status: accepted
  +-- Admin declines → POST /api/custom-orders/:id/decline → status: declined
```

### 4.3 Admin Workflow

```
Admin → /admin
  +-- Products: Add/Edit/Delete (photos, colors, stock, pricing)
  +-- Combos: Create bundle deals + auto profit margin calculation
  +-- Orders: View all, update status (Placed → Crafting → Shipped → Delivered)
  +-- Custom Quotes: View inquiries, send quotes, open DM chat
  +-- Coupons: Create/deactivate coupon codes
  +-- Reels: Manage Instagram-style showcase reels
  +-- Reviews: Moderate customer reviews
  +-- Subscribers: View subscribers, copy emails
```

---

## 5. Directory Structure

```
handii-react/
├── index.html                        ← Entry HTML (favicon, fonts)
├── vite.config.js                    ← Vite config + proxy to port 5000
├── package.json                      ← Scripts, dependencies
├── .env                              ← Environment variables
│
├── public/
│   ├── images/                       ← Static product images (JPEG/PNG)
│   └── uploads/                      ← User-uploaded files (via Multer)
│
├── src/
│   ├── main.jsx                      ← ReactDOM.createRoot entry
│   ├── App.jsx                       ← HashRouter + all Providers + Routes
│   ├── index.css                     ← Global design system (4600+ lines)
│   │
│   ├── data/
│   │   ├── products.js               ← 73 static product definitions
│   │   ├── categories.js             ← Category grid config
│   │   ├── subcategories.js          ← Subcategory tabs + filter map
│   │   └── reels.js                  ← Static reel card data
│   │
│   ├── context/
│   │   ├── AuthContext.jsx           ← User auth state, JWT, OTP flows
│   │   ├── CartContext.jsx           ← Cart items, qty, coupon, checkout
│   │   └── WishlistContext.jsx       ← Saved wishlist items
│   │
│   ├── components/
│   │   ├── Header.jsx                ← Nav bar, cart icon, auth button
│   │   ├── Footer.jsx                ← Links, social, WhatsApp
│   │   ├── Hero.jsx                  ← Landing hero banner
│   │   ├── Shop.jsx                  ← Product grid with filters
│   │   ├── ProductCard.jsx           ← Card: image, colors, add to cart
│   │   ├── ComboSection.jsx          ← Combo deal cards
│   │   ├── ComboImageSlider.jsx      ← Auto-scrolling image slideshow
│   │   ├── Reels.jsx                 ← Instagram-style video/image reels
│   │   ├── CategoryGrid.jsx          ← Category browse grid
│   │   ├── Contact.jsx               ← Newsletter subscribe form
│   │   ├── About.jsx                 ← Studio about section
│   │   ├── Divider.jsx               ← UI section divider
│   │   ├── CartDrawer.jsx            ← Slide-in cart + coupon + checkout
│   │   ├── WishlistDrawer.jsx        ← Slide-in saved items
│   │   ├── AuthModal.jsx             ← Login / Register / OTP modal
│   │   ├── FloatingWhatsApp.jsx      ← Persistent WhatsApp button
│   │   ├── ProductReviewsModal.jsx   ← Customer review modal per product
│   │   ├── AdminDashboard.jsx        ← Legacy admin component
│   │   ├── CustomerDashboard.jsx     ← Customer order/chat component
│   │   ├── CustomizePage.jsx         ← Custom order form + DM chat
│   │   └── Customizer3D.jsx          ← Three.js 3D product visualizer
│   │
│   └── pages/
│       ├── HomePage.jsx              ← Full landing page
│       ├── ShopPage.jsx              ← Full shop with advanced filters
│       ├── CombosPage.jsx            ← Combo bundles page
│       ├── CustomizePage.jsx         ← Bespoke order + DM chat page
│       ├── CustomerDashboardPage.jsx ← My orders + address book + chat
│       └── AdminDashboardPage.jsx    ← Full admin control panel (101KB)
│
└── server/
    ├── index.js                      ← Express bootstrap + route mount
    ├── db.js                         ← MongoSyncedDatabase (dual-write)
    ├── seed.js                       ← DB seed: admin, products, coupons
    ├── migrateToMongo.js             ← One-time migration: db.json → MongoDB
    ├── restoreFullDb.js              ← Full restore + re-sync MongoDB
    ├── restoreColors.js              ← Restore product color variants
    │
    ├── models/
    │   └── index.js                  ← 11 Mongoose schemas + model exports
    │
    ├── middleware/
    │   └── auth.js                   ← JWT authenticateToken + requireAdmin
    │
    ├── routes/
    │   ├── auth.js                   ← /api/auth/*
    │   ├── products.js               ← /api/products/*
    │   ├── orders.js                 ← /api/orders/*
    │   ├── customOrders.js           ← /api/custom-orders/*
    │   ├── combos.js                 ← /api/combos/*
    │   ├── coupons.js                ← /api/coupons/*
    │   ├── reviews.js                ← /api/reviews/*
    │   ├── reels.js                  ← /api/reels/*
    │   ├── upload.js                 ← /api/upload/* (Multer)
    │   └── newsletter.js             ← /api/newsletter/*
    │
    ├── services/
    │   └── mailer.js                 ← Resend API + Nodemailer fallback
    │
    └── data/
        └── db.json                   ← JSON fallback database
```


---

## 6. Database Design & Schema

**Database**: `handii_db` (MongoDB `localhost:27017`)
**ORM**: Mongoose with `strict: false` and `timestamps: true` on all schemas

---

### Collection 1: `users`

```js
{
  id: Number,           // Numeric ID (legacy compat) — indexed
  name: String,         // Full name
  email: String,        // Unique, lowercase, indexed
  phone: String,        // Indian phone (e.g. "919876543210")
  passwordHash: String, // bcryptjs hash (10 rounds)
  role: String,         // "admin" | "customer"
  addresses: Array,     // [{ id, label, street, city, state, pincode, isDefault }]
  savedCart: Array,     // Cart items saved on logout
  createdAt, updatedAt
}
```

**Roles**: `admin` (full platform access) | `customer` (personal orders + DM chat)
**Seed**: 1 admin (`admin@handii.co` / `admin123`) + sample customers

---

### Collection 2: `products`

```js
{
  id: Number,           // Sequential integer ID — indexed
  title: String,        // Display name (e.g. "Lily", "Tulip")
  price: Mixed,         // Display price string (e.g. "210" or "Rs.210")
  numericPrice: Number, // Parsed price for calculations
  costPrice: Number,    // Studio crafting cost (~45% of numericPrice)
  cat: String,          // "pipecleaner"|"resin"|"bracelets"|"pixelart"
  sub: String,          // Sub-category key (e.g. "flowers", "alphabet")
  img: String,          // Primary product image path (/images/...)
  alt: String,          // Alt text for accessibility + SEO
  badge: String,        // Optional badge ("Bestseller", "New", "Seasonal")
  stockCount: Number,   // Current inventory count
  isOutOfStock: Boolean,// true when stockCount === 0
  isNotify: Boolean,    // Shows "Notify Me" button instead of Add to Cart
  featured: Boolean,    // Appears in featured sections
  colors: Array,        // [{ color, title, style, hex, img, active }]
  createdAt, updatedAt
}
```

**Color Variant Object Schema**:
```js
{
  color: "Blush Pink",               // Display name
  title: "Blush Pink",               // Button tooltip
  style: "background:#e8b4bc",       // CSS inline style string
  hex: "",                           // Optional hex code
  img: "/images/purplelavlily.jpeg", // Color-specific product photo
  active: false
}
```

**Total Products**: 75 (73 static + 2 custom-added)

---

### Collection 3: `orders`

```js
{
  id: Mixed,             // Timestamp ID (e.g. 1788935860760)
  orderNumber: String,   // "HND-XXXXXX" — unique indexed
  userId: Mixed,         // Logged-in user ID or null (guest)
  customerName: String,
  customerPhone: String, // Required for WhatsApp follow-up
  customerEmail: String,
  shippingAddress: Mixed,// Full address string or object
  items: Array,          // [{ productId, name, price, img, color, quantity, cartItemId }]
  subtotal: Number,      // Before discount
  discountAmount: Number,// Coupon discount applied
  couponCode: String,    // Applied coupon code or null
  totalAmount: Number,   // Final billed amount
  status: String,        // "placed" → "crafting" → "shipped" → "delivered"
  paymentMethod: String, // "cod" | "online"
  paymentStatus: String, // "pending" | "paid"
  notes: String,         // Customer delivery notes
  createdAt, updatedAt
}
```

**Status Flow**: `placed` → `crafting` → `shipped` → `delivered`

---

### Collection 4: `customOrders`

```js
{
  id: Mixed,
  customOrderId: String,    // "CUST-XXXX" — unique indexed
  userId: Mixed,
  customerName: String,
  customerPhone: String,
  customerEmail: String,
  category: String,         // "pipecleaner"|"resin"|"crochet"|"hampers"|"clay"
  subcategory: String,
  customText: String,       // Personalization text (letters, names)
  colorPreferences: String, // Color requirements
  specifications: String,   // Detailed design specs
  referencePhotos: Array,   // Uploaded reference image URLs
  targetDate: String,       // Customer's preferred completion date
  status: String,           // "submitted">"quoted">"accepted">"crafting">"completed"|"declined"
  quotePrice: Mixed,        // Admin-set price offer (null until quoted)
  estimatedDays: Mixed,     // Admin-set delivery estimate
  quoteNotes: String,       // Notes accompanying the quote
  declineReason: String,    // If declined
  createdAt, updatedAt
}
```

---

### Collection 5: `customMessages`

```js
{
  id: Mixed,
  customOrderId: String,    // References customOrders.customOrderId — indexed
  sender: String,           // "admin" | "customer" | "system"
  senderName: String,
  message: String,
  attachments: Array,       // [{ url, name }]
  isSystemMessage: Boolean, // true for auto-generated system events
  quoteOffer: Mixed,        // Quote offer card data (when admin sends a quote)
  createdAt, updatedAt
}
```

---

### Collection 6: `combos`

```js
{
  id: Number,
  title: String,               // Combo deal name
  description: String,
  badge: String,               // "Best Value Bundle", "Studio Favorite"
  img: String,                 // Primary combo image
  images: Array,               // Additional slideshow images
  productIds: Array,           // [productId, productId] — referenced products
  items: Array,                // Populated product objects (runtime enriched)
  regularPrice: Number,        // Sum of individual retail prices
  comboPrice: Number,          // Discounted bundle price
  savingsAmount: Number,       // regularPrice - comboPrice
  costTotal: Number,           // Total crafting cost
  profitMarginPercent: Number, // (comboPrice - costTotal) / comboPrice * 100
  isActive: Boolean,
  createdAt, updatedAt
}
```

**Margin Safety**: System enforces **25% minimum profit margin**. Admin sees live margin calculations before saving.

---

### Collection 7: `coupons`

```js
{
  id: Mixed,
  code: String,           // Uppercase unique coupon code — indexed
  description: String,
  discountType: String,   // "percentage" | "fixed"
  discountValue: Number,  // Percent or flat INR amount
  minOrderValue: Number,  // Minimum cart value to apply
  maxDiscountCap: Number, // Maximum discount cap (for percentage coupons)
  expiryDate: String,     // "YYYY-MM-DD"
  usageLimit: Number,     // Total uses allowed
  usedCount: Number,      // Current use count
  usedByUsers: Array,     // [userId, email] — per-user deduplication
  isActive: Boolean,
  createdAt, updatedAt
}
```

**Seeded Coupons**:

| Code | Type | Value | Min Order | Max Cap |
|---|---|---|---|---|
| `WELCOME10` | percentage | 10% | Rs.0 | Rs.150 |
| `HANDMADE50` | fixed | Rs.50 | Rs.499 | Rs.50 |
| `FESTIVE15` | percentage | 15% | Rs.799 | Rs.300 |

> **Note**: Coupons are **NOT applicable to combo items** — only standard catalog products.

---

### Collection 8: `reviews`

```js
{
  id: Mixed,
  productId: Number,         // References products.id — indexed
  userId: Mixed,
  customerName: String,
  rating: Number,            // 1–5 stars
  title: String,
  comment: String,
  photos: Array,             // Review photo URLs
  isVerifiedBuyer: Boolean,
  likesCount: Number,
  createdAt, updatedAt
}
```

---

### Collection 9: `reels`

```js
{
  id: Mixed,
  title: String,
  handle: String,    // "@handii.co_"
  views: String,     // Display views ("12.4K", "3.2K")
  video: String,     // Video URL (YouTube embed or direct)
  thumbnail: String, // Fallback image URL
  badge: String,     // "Process Video", "New Drop"
  productId: Number, // Linked product ID (optional)
  link: String,      // External Instagram / YouTube link
  caption: String,
  createdAt, updatedAt
}
```

---

### Collection 10: `subscribers`

```js
{
  id: Mixed,
  email: String,       // Unique, lowercase — indexed
  subscribedAt: Date,
  isActive: Boolean,
  createdAt, updatedAt
}
```

---

### Collection 11: `settings`

```js
{
  key: String,     // Setting key — indexed
  value: Mixed,    // Setting value (any type)
  createdAt, updatedAt
}
```

Default Settings:
- `minMarginThreshold`: 0.25
- `currency`: "INR"
- `currencySymbol`: "Rs."
- `shopName`: "handii.co"
- `phone`: "918847277218"

---

### Entity Relationship Diagram

```
users ──────────── orders (userId → users.id)
  |                   |
  |                   +── items[] ── products (productId → products.id)
  |
  +── customOrders (userId → users.id)
          |
          +── customMessages (customOrderId → customOrders.customOrderId)

combos ──── products (productIds[] → products.id[])

products ── reviews (productId → products.id)
         ── reels (productId → products.id)

coupons ─── orders (couponCode → coupons.code)
            (usedByUsers[] tracks per-user usage)

subscribers ── standalone (email collection only)
settings ────── standalone (key-value store)
```

---

## 7. API Reference

**Base URL**: `http://localhost:5000/api`
**Auth header**: `Authorization: Bearer <jwt_token>`

### 7.1 Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Register new customer account |
| `POST` | `/api/auth/login` | None | Login with email+password, returns JWT |
| `POST` | `/api/auth/send-otp` | None | Generate 6-digit OTP (shown in server console) |
| `POST` | `/api/auth/verify-otp` | None | Verify OTP, returns JWT |
| `GET` | `/api/auth/me` | Bearer | Get current user profile |
| `PUT` | `/api/auth/profile` | Bearer | Update name, phone |
| `POST` | `/api/auth/change-password` | Bearer | Change password |
| `POST` | `/api/auth/addresses` | Bearer | Add delivery address |
| `PUT` | `/api/auth/addresses/:id` | Bearer | Update delivery address |
| `DELETE` | `/api/auth/addresses/:id` | Bearer | Delete delivery address |
| `POST` | `/api/auth/sync-cart` | Bearer | Sync cart on login/logout |

**JWT Payload**: `{ id, email, role }` | **Expiry**: 30 days

### 7.2 Products (`/api/products`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | None | List all (supports `?cat=` `?sub=` `?q=` `?inStockOnly=true`) |
| `GET` | `/api/products/:id` | None | Get single product |
| `POST` | `/api/products` | Admin | Create product |
| `PUT` | `/api/products/:id` | Admin | Update product (price, stock, photos, colors) |
| `DELETE` | `/api/products/:id` | Admin | Delete product |
| `PATCH` | `/api/products/:id/stock` | Admin | Update stock count |

### 7.3 Orders (`/api/orders`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders` | None | Place new order (guest or logged-in) |
| `GET` | `/api/orders/my` | Bearer | Customer's order list |
| `GET` | `/api/orders/admin/all` | Admin | All orders with filters |
| `GET` | `/api/orders/:id` | Bearer | Single order details |
| `PATCH` | `/api/orders/:id/status` | Admin | Update order status |

### 7.4 Custom Orders (`/api/custom-orders`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/custom-orders` | None | Submit bespoke inquiry |
| `GET` | `/api/custom-orders/my` | Bearer | Customer's custom orders |
| `GET` | `/api/custom-orders/admin/all` | Admin | All custom orders |
| `GET` | `/api/custom-orders/:customOrderId` | None | Get order + DM chat thread |
| `POST` | `/api/custom-orders/:id/messages` | None | Post DM message |
| `PATCH` | `/api/custom-orders/:id/quote` | Admin | Send price quote |
| `POST` | `/api/custom-orders/:id/accept` | Bearer | Customer accepts quote |
| `POST` | `/api/custom-orders/:id/decline` | Admin | Admin declines inquiry |

### 7.5 Other Routes

| Route | Key Endpoints |
|---|---|
| `/api/combos` | GET all (enriched), POST calculate-margin (Admin), POST/PUT/DELETE (Admin) |
| `/api/coupons` | GET eligible, POST validate, CRUD (Admin), PATCH toggle |
| `/api/reviews` | GET `?productId=X`, POST (Bearer), DELETE (Admin) |
| `/api/reels` | GET all, POST/PUT/DELETE (Admin) |
| `/api/upload` | POST (multipart/form-data, field: `photos`, max 5 images, 10MB) |
| `/api/newsletter` | POST subscribe, GET subscribers, DELETE subscriber |

---

## 8. Frontend Architecture

### Routing (Hash-based)

| Route | Page | Description |
|---|---|---|
| `/#/` | `HomePage` | Landing: Hero + Shop + Combos + Reels + Contact |
| `/#/shop` | `ShopPage` | Full catalog with category/subcategory filters |
| `/#/combos` | `CombosPage` | Bundle deals showcase |
| `/#/customize` | `CustomizePage` | Bespoke form + DM chat |
| `/#/dashboard` | `CustomerDashboardPage` | My orders, addresses, chat |
| `/#/admin` | `AdminDashboardPage` | Studio control panel |

### Key Components

| Component | Size | Role |
|---|---|---|
| `AdminDashboardPage.jsx` | 101KB | Full admin: products, orders, combos, quotes, coupons, reels |
| `CustomerDashboardPage.jsx` | 22KB | Customer: orders, addresses, custom order chat |
| `CartDrawer.jsx` | 18KB | Side drawer: items, qty controls, coupon, checkout form |
| `AuthModal.jsx` | 12KB | Login / Register / OTP / Forgot password |
| `CustomizePage.jsx` | 20KB | Bespoke form + DM chat interface |
| `Customizer3D.jsx` | 21KB | Three.js interactive 3D product preview |
| `ProductCard.jsx` | 7KB | Card: image fade, color swatches, add-to-cart |
| `ComboImageSlider.jsx` | 6KB | Auto-scroll slideshow (3.5s interval, touch swipe) |

### ProductCard Color Swatch System

```
API: product.colors[ { color, title, style, hex, img, active } ]
  |
  v
getColorStyle(c) function:
  1. c.style has background → parse CSS string → apply
  2. c.hex → use hex as background-color
  3. c.color → use color name as background
  4. Fallback → gold (#e3ae49)
  |
  v
User clicks swatch → handleSelectColor(idx)
  → setImgOpacity(0)         [150ms fade out]
  → setDisplayImg(c.img)     [swap image]
  → setImgOpacity(1)         [150ms fade in]
```

---

## 9. Authentication System

### OTP Passwordless Login Flow

```
POST /api/auth/send-otp { email, type: "login" }
  → 6-digit OTP generated
  → Stored in otpStore Map: { key: "${email}_login", val: { code, expiresAt: +10min } }
  → OTP printed to server console + returned in response.previewCode (demo mode)
  |
  v
POST /api/auth/verify-otp { email, otp, type: "login" }
  → OTP validated + expiry checked
  → JWT issued (expires: 30 days)
  → Returns: { success, token, user }
```

### JWT Token Storage
- Stored in `localStorage("handii_token")`
- Injected as `Authorization: Bearer <token>` on all authenticated API calls
- Validated by `authenticateToken` middleware on every protected route
- On app load: `AuthContext` calls `GET /api/auth/me` to restore session

### Admin Guard
```
requireAdmin middleware = authenticateToken + req.user.role === "admin" check
```

**Default Admin**: `admin@handii.co` / `admin123`

---

## 10. File Upload System

**Library**: Multer (Express middleware)
**Storage**: Local disk at `public/uploads/`
**Naming**: `handii-{timestamp}-{random9digits}.{ext}`

```
POST /api/upload  (multipart/form-data, field: "photos")
  |
  v
Multer validates:
  - Type: JPEG / JPG / PNG / WebP / GIF only
  - Size: max 10MB per file
  - Count: max 5 files per request
  |
  v
Files saved: public/uploads/handii-{timestamp}-{random}.jpg
  |
  v
Response: { success: true, url: "/uploads/handii-xxx.jpg", urls: [...] }
  |
  v
Served statically: GET /uploads/* → Express static middleware → public/uploads/
```

**Admin usage**: Product primary photo + color variant photos via file picker.
All `<img>` tags use `referrerPolicy="no-referrer"` to bypass hotlink protection from external CDNs.

---

## 11. Email Notification System

**Service**: Resend API (primary) → Nodemailer SMTP (fallback)

### Priority Chain (`server/services/mailer.js`)

```
1. BREVO_API_KEY present → Use Brevo (sends to ANY email, no domain required)
2. RESEND_API_KEY present → Use Resend
     - If recipient allowed → delivers directly
     - If sandbox restricted → routes to dev email with "[Demo for <entered_email>]" label
3. EMAIL_USER + EMAIL_PASS present → Use Nodemailer SMTP (Gmail/Yahoo)
4. None configured → Simulation mode (logs to console only)
```

### Current Config (`.env`)
```
RESEND_API_KEY=re_your_resend_api_key_here
REPLY_TO_EMAIL=handii.co@yahoo.com
```

### Email Triggers

| Trigger | Recipient | Subject |
|---|---|---|
| Newsletter Subscribe | Entered email | "Welcome to the handii.co family! (+ 10% Welcome Gift Voucher)" |

**Welcome Email contents**: Handii.co branding, `WELCOME10` coupon code in gold dashed box, WhatsApp CTA button, Studio Instagram link.

---

## 12. Admin Dashboard

**Route**: `/#/admin` | **Auth**: `requireAdmin` (Admin JWT required)

| Tab | Key Features |
|---|---|
| **Products** | Add/Edit/Delete products, stock, photos (local file or URL), color variants |
| **Combos** | Create bundles, live 25% min margin calculator, auto image slideshow |
| **Orders** | View all, filter by status, update order status |
| **Custom Quotes** | View bespoke inquiries, open DM chat, send quotes, decline |
| **Coupons** | Create/edit/toggle (percentage or flat), view usage stats |
| **Reels** | Add/edit Instagram-style product reels |
| **Reviews** | View/moderate customer reviews |
| **Subscribers** | List all newsletter subscribers, "Copy All Emails" bulk action |

**Product Photo Upload**: Local PC file picker (via Multer) OR online URL (Pinterest, CDN)

---

## 13. Customer Dashboard

**Route**: `/#/dashboard` | **Auth**: Bearer JWT required

- **My Orders**: Order history with status tracking (Placed → Crafting → Shipped → Delivered)
- **Custom Requests**: View submitted bespoke inquiries and current status
- **DM Chat**: Participate in artisan conversation threads per custom order
- **Address Book**: Add/edit/delete delivery addresses + set default
- **Quote Acceptance**: Accept price quote from artisan to proceed with custom craft

---

## 14. Cart & Checkout Flow

### CartContext State
```js
cartItems: [{ productId, name, price, img, color, quantity, cartItemId, isCombo }]
coupon: { code, discountAmount, discountType, discountValue }
isCartOpen: Boolean
```

### Key Actions
- `addToCart(item)` — adds or merges by productId+color
- `removeFromCart(cartItemId)`
- `updateQuantity(cartItemId, qty)`
- `applyCoupon(code)` — calls `POST /api/coupons/validate`
- `clearCart()`

### Checkout Flow
```
CartDrawer opens
  → Customer fills: Name + Phone + Shipping Address + notes
  → Selects payment: Cash on Delivery | Online Payment
  → Applies coupon (optional) → POST /api/coupons/validate
  → POST /api/orders { customerName, customerPhone, customerEmail,
                       shippingAddress, items[], paymentMethod, couponCode, notes }
  Server:
    1. Validates inputs
    2. Applies coupon discount (combo items excluded)
    3. Decrements stock for each product
    4. Saves order with HND-XXXXXX number
    5. Returns order confirmation
  → Cart cleared → Success banner displayed
```

---

## 15. Custom Order & DM Chat System

### Submission Form Fields
- Craft category (Pipe Cleaner / Resin / Crochet / Clay / Hampers)
- Customer name, phone, email
- Color preferences (free text)
- Specifications (detailed requirements)
- Reference photos (upload up to 5)
- Target completion date

### DM Chat Interface
- Real-time message thread: customer ↔ Handii artisan
- Each message: sender role, name, text, timestamp, attachments
- System messages auto-generated for status changes and quote events
- Admin can attach files/photos to messages
- Quote offer cards rendered visually in the chat thread

### Custom Order ID Format
```
'CUST-' + Math.floor(1000 + Math.random() * 9000)
→ e.g. "CUST-4709", "CUST-7283"
```

---

## 16. Combo & Bundle System

### How Combos Work
1. Admin selects 2+ products to bundle
2. System calculates: `totalRetail = sum(product.numericPrice)`
3. Admin proposes a `comboPrice`
4. System validates: `comboPrice >= minSafePrice` (where `minSafePrice = totalCost * 1.25`)
5. Combo goes live on `/combos` page

### Combo Enrichment (API Response)
`GET /api/combos` enriches each combo with:
- `items`: full product objects (title, img, price, colors...)
- `productImages`: `[product1.img, product2.img, ...]` for auto slideshow

### Auto-scrolling Slideshow (`ComboImageSlider.jsx`)
- Slides every **3.5 seconds** automatically
- Pauses on hover
- Touch/swipe gesture support (30px threshold)
- Dot navigation indicators
- Graceful fallback for broken images

---

## 17. Coupon & Discount System

### Validation Logic
```
POST /api/coupons/validate { code, subtotal, eligibleSubtotal, userId, userEmail, hasOnlyCombos }
  1. Find coupon by uppercase code + isActive check
  2. If hasOnlyCombos → reject (coupons not valid on combos)
  3. Check minOrderValue: eligibleSubtotal >= coupon.minOrderValue
  4. Check per-user usage: usedByUsers includes userId or email → reject if already used
  5. Calculate discount:
     - percentage: discount = eligibleSubtotal * (discountValue / 100)
     - fixed: discount = min(eligibleSubtotal, discountValue)
     - Apply maxDiscountCap limit
  6. Return: { valid, discountAmount, discountType, discountValue, code }
```

### Coupon Usage Tracking
On successful order placement:
```js
db.update('coupons', { id: coupon.id }, {
  usedCount: coupon.usedCount + 1,
  usedByUsers: [...usedByUsers, userId_or_email]
})
```

---

## 18. Newsletter & Subscriber System

### Subscribe Flow
```
POST /api/newsletter/subscribe { email }
  1. Validate email format (regex)
  2. Check if already subscribed
     - If yes → re-send welcome email (demo/testing friendly)
     - If no → insert new subscriber record
  3. sendWelcomeEmail(email) called asynchronously
  4. Return success message
```

**Admin View**: Subscriber table in Admin Dashboard, shows email + subscription date,
"Copy All Emails" button for bulk clipboard copy for email campaigns.

---

## 19. State Management (React Context API)

### AuthContext
```
State: user, token, isAuthModalOpen, authModalMode, loading
Actions: login(), logout(), register(), sendOtp(), verifyOtp(), openAuthModal()
Storage: JWT token in localStorage("handii_token")
```

### CartContext
```
State: cartItems, coupon, isCartOpen, total, itemCount
Actions: addToCart(), removeFromCart(), updateQuantity(), applyCoupon(), clearCart()
Storage: localStorage("handii_cart")
Cart sync: on login → savedCart merged from server; on logout → cart saved to server
```

### WishlistContext
```
State: wishlistItems, isWishlistOpen
Actions: toggleWishlist(product), isInWishlist(productId), openWishlist()
Storage: localStorage("handii_wishlist")
```

---

## 20. Environment Configuration

**File**: `.env` (project root)

```env
# MongoDB Local Database Connection
MONGO_URI=mongodb://127.0.0.1:27017/handii_db

# Resend API Key for Automated Email Delivery
RESEND_API_KEY=re_your_resend_api_key_here

# Reply-to address for customer emails
REPLY_TO_EMAIL=handii.co@yahoo.com

# Express Server Port
PORT=5000
```

**Optional variables (for alternative email providers)**:
```env
# Brevo (sends to ANY recipient without domain verification)
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=youremail@gmail.com

# Gmail/Yahoo SMTP (requires App Password)
EMAIL_USER=yourmail@gmail.com
EMAIL_PASS=app_password_here
EMAIL_SERVICE=gmail

# JWT Security (default: handii_craft_secret_key_2026)
JWT_SECRET=your_custom_secret_key
```

---

## 21. Local Dev Setup

### Prerequisites

| Software | Version | Install |
|---|---|---|
| Node.js | v24.13.1+ | nodejs.org |
| MongoDB Community | v9.0.2 | mongodb.com/try/download/community |
| mongosh | v2.12.0 | mongodb.com/try/download/shell |
| MongoDB Compass | v1.51.0 | mongodb.com/products/compass |
| npm | v10+ | Bundled with Node.js |

### Start Development

```bash
# 1. Install dependencies
npm install

# 2. MongoDB runs automatically as a Windows service after install

# 3. Start full dev environment (both backend + frontend)
npm run dev
# Backend:  http://localhost:5000  (Express + MongoDB)
# Frontend: http://localhost:5173  (Vite React)
```

### npm Scripts
| Script | Command |
|---|---|
| `dev` | `concurrently "npm run server" "npm run client"` |
| `server` | `node server/index.js` |
| `client` | `vite` |
| `build` | `vite build` |
| `migrate:mongo` | `node server/migrateToMongo.js` |

### Database Management (mongosh)

```bash
# Open MongoDB shell
mongosh "mongodb://127.0.0.1:27017/handii_db"

# Useful commands
show collections
db.products.countDocuments()
db.orders.find().pretty()
db.subscribers.find()
db.customorders.find({ status: "submitted" })

# Full restore if data is missing
node server/restoreFullDb.js
```

### Vite Proxy Config (`vite.config.js`)
```js
proxy: {
  '/api':     { target: 'http://localhost:5000', changeOrigin: true },
  '/uploads': { target: 'http://localhost:5000', changeOrigin: true }
}
```

---

## 22. Data Flow Diagrams

### Complete Request Flow

```
Browser (React)
  |
  | fetch('/api/products')
  |
  v
Vite Dev Server (port 5173)
  |
  | Proxy: /api/* → http://localhost:5000
  |
  v
Express Server (port 5000)
  |
  +-- Morgan logs request
  +-- CORS headers set
  +-- JSON body parsed
  +-- Route matched: GET /api/products
  +-- products.js handler: const products = db.find('products')
  +-- db.js (MongoSyncedDatabase): returns this.data['products'] (in-memory array)
  |
  v
Response: { success: true, products: [...] }
  |
  v
React updates state → UI re-renders
```

### Data Write Flow (MongoDB Sync)

```
Admin saves new product
  |
  v
POST /api/products (requireAdmin middleware)
  |
  v
db.insert('products', newProduct)
  |
  +-- 1. In-memory: this.data.products.push(newProduct)
  +-- 2. Disk write: fs.writeFileSync(DB_FILE, JSON)       [synchronous backup]
  +-- 3. MongoDB: Model.updateOne(q, newProduct, {upsert:true})  [async]
               +-- .catch(err => console.error)             [never blocks response]
  |
  v
Response sent immediately (fast, in-memory data used)
MongoDB updated in background within milliseconds
```

---

*Generated: September 2026 | handii.co Studio*
*WhatsApp: +91 8847277218 | Instagram: @handii.co_*
