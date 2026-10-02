# 🌸 handii.co — Handcrafted Artisanal E-Commerce Platform

> **Handmade with love, powered by modern technology.**  
> Blooming pipe cleaner bouquets, shimmering botanical resin keepsakes, alphabet charms, beaded bracelets, and personalized gifts.

---

## 🌟 Live Deployment Architecture

The platform runs as a modern, decoupled full-stack application with 24/7 cloud persistence:

```
  [ Customer / Browser ]
           │
           ▼
┌─────────────────────────┐
│     Netlify Frontend    │ ── (calls /api/...)
│ (React + Vite + Router) │
└─────────────────────────┘
           │ (Proxied seamlessly via _redirects & netlify.toml)
           ▼
┌─────────────────────────┐
│  Render Cloud Backend   │ (https://handii-co.onrender.com)
│ (Express + Node.js API) │
└─────────────────────────┘
           │
           ▼
┌─────────────────────────┐
│   MongoDB Atlas Cloud   │ (Cluster0 / handii_db)
│   (24/7 Live Database)  │
└─────────────────────────┘
```

* **Frontend**: Hosted on **Netlify** with Single Page Application routing and automated API reverse-proxying.
* **Backend API**: Hosted on **Render.com** ([https://handii-co.onrender.com](https://handii-co.onrender.com)).
* **Database**: Hosted on **MongoDB Atlas** cloud cluster with automated schema fallback and live synchronization.
* **Official Socials**: Instagram [@handii.co](https://www.instagram.com/handii.co/) • WhatsApp +91 8847277218.

---

## ✨ Features & Capabilities

### 🛍️ Storefront & Shopping Experience
* **68 Handcrafted Catalog Products**: Spanning Pipe Cleaner Flowers & Keychains, Resin Coasters, Alphabet Charms, Beaded & Disc Bracelets.
* **Interactive Color Swatches**: Real-time image swapping with a smooth 150ms fade transition (e.g. Resin Botanical Coaster toggling between *Ocean Blue* and *Pearl White*).
* **Curated Studio Combos**: Value bundles pairing bouquets with charms, safeguarded by artisan profit margin thresholds.
* **Smart Cart & Wishlist Drawers**: Persistent cart state with coupon validation, free-shipping progress indicators, and instant WhatsApp checkout integration.
* **Customer Reviews & Wall of Love**: Star ratings, verified badges, and photo uploads.
* **Custom Order DM & Quote System**: Customers can upload inspiration images and chat directly with artisans for customized quotes.

### 🛡️ Studio Admin CMS (`/#/admin`)
* **Secure Admin Access**: Authenticated route guard with JWT session management.
* **Product Catalog Manager**: Add, edit, or delete products; set stock levels; configure pricing and craft costs; build multi-color variant palettes with preview images.
* **Order Stepper & Fulfillment**: Manage orders through live statuses (`Received` ➔ `Coiling 🧵` ➔ `Resin Curing ✨` ➔ `Dispatched 🚚` ➔ `Delivered 🌸`).
* **Promo Coupon Engine**: Create percentage or flat discounts with minimum spend rules and expiry caps.
* **Newsletter Subscriber Export**: Collect email subscribers with automated welcome emails via Resend.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
* **Node.js** (v18 or higher)
* **npm** (v9 or higher)

### 2. Installation
Clone the repository and install all dependencies:

```bash
git clone https://github.com/Saimabakshi51/Handii.co.git
cd Handii.co
npm install
```

### 3. Environment Setup
Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://saima1480be24_db_user:5bx8d7NAQaJ4td8y@ac-txuwzaa-shard-00-00.hdyr1f6.mongodb.net:27017,ac-txuwzaa-shard-00-01.hdyr1f6.mongodb.net:27017,ac-txuwzaa-shard-00-02.hdyr1f6.mongodb.net:27017/handii_db?ssl=true&replicaSet=atlas-10frj1-shard-0&authSource=admin&appName=handiico
RESEND_API_KEY=re_your_resend_api_key_here
REPLY_TO_EMAIL=handii.co@yahoo.com
JWT_SECRET=handii_super_secret_jwt_token_2026_aesthetic
```

### 4. Run Locally
Run both the frontend and backend concurrently with one command:

```bash
npm run dev
```

* **Frontend**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5000](http://localhost:5000)
* **Studio Admin Portal**: [http://localhost:5173/#/admin](http://localhost:5173/#/admin) (`admin@handii.co` / `admin123`)

---

## 🎨 Managing & Adding Products

Because both local development and the live website share the same **MongoDB Atlas Cloud Database**, product changes reflect automatically without needing to rebuild the site!

### Method A: Live Admin Dashboard (Recommended)
1. Navigate to **`/#/admin`** on the live website (or localhost).
2. Log in with your admin credentials.
3. Click **"Add Product"**, enter details, set color swatches, and upload photos.
4. Click **Save** — the product is instantly live in the catalog worldwide!

### Method B: Code Batch Additions
1. Add product definitions to `src/data/products.js`.
2. Place corresponding photos in `public/images/`.
3. In your terminal, run:
   ```bash
   npm run sync:catalog
   ```
   *(This automatically synchronizes images, titles, and swatches directly into MongoDB Atlas and local JSON storage!)*

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs both Vite frontend (5173) and Express backend (5000) concurrently |
| `npm run server` | Runs the Express API backend server with live MongoDB sync |
| `npm run client` | Starts the Vite React development server |
| `npm run build` | Builds the optimized production bundle into `dist/` |
| `npm run sync:catalog` | Syncs `src/data/products.js` definitions directly into MongoDB Atlas |
| `npm run migrate:mongo` | Migrates local database documents to any target MongoDB connection |

---

## 📁 Project Directory Structure

```text
├── public/
│   ├── images/               # Web-safe product photos, flowers, swatches & logos
│   ├── uploads/              # Dynamic admin & customer uploaded photos
│   ├── _redirects            # Netlify reverse proxy rules for /api forwarding
├── server/
│   ├── data/                 # Local fallback JSON database (db.json)
│   ├── middleware/           # JWT auth and admin permission guards
│   ├── models/               # Mongoose schemas (Products, Orders, Users, Combos, etc.)
│   ├── routes/               # Express API routes (/products, /orders, /auth, etc.)
│   ├── services/             # Email delivery service via Resend
│   ├── db.js                 # Smart bi-directional Mongo-synced database manager
│   ├── index.js              # Express application entry point
│   ├── seed.js               # Initial database bootstrap & sample data
│   └── syncCatalog.js        # Catalog synchronization CLI utility
├── src/
│   ├── components/           # Reusable UI components (ProductCard, Header, Drawers, etc.)
│   ├── context/              # Global React contexts (Cart, Wishlist, Auth)
│   ├── data/                 # Static catalog data, reels, and category mappings
│   ├── pages/                # Distinct full-page views (Shop, Combos, Customize, Admin)
│   ├── App.jsx               # HashRouter layout and global modal providers
│   └── index.css             # Handcrafted aesthetic design system & tokens
├── netlify.toml              # Netlify build and API proxy routing configuration
├── render.yaml               # Render.com cloud deployment blueprint
└── package.json
```

---

## 💌 Contact & Studio Inquiries

* **Instagram**: [@handii.co](https://www.instagram.com/handii.co/)
* **WhatsApp Hotline**: [+91 8847277218](https://wa.me/918847277218)
* **Email**: [handii.co@yahoo.com](mailto:handii.co@yahoo.com)

*Handcrafted in India with warm paper tones, cotton thread, and real botanicals.*
