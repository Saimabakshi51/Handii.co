# handii.co — Full-Stack Implementation Roadmap & Feature Order

This document outlines the step-by-step implementation order to upgrade `handii.co` from a static React catalog into a full-stack, production-grade craft e-commerce platform with a dynamic Admin CMS, Customer Dashboard, Custom Order DM & Quoting System, Real-Time Stock Management, Wishlist, Margin-Safe Combos, Coupon Engine, Product Reviews, and an interactive 3D Keychain Bag customizer—while **100% preserving the handcrafted paper-and-thread aesthetic**.

---

## 📋 Implementation Phases Overview

| Phase | Feature Focus | Primary Deliverables |
|---|---|---|
| **Phase 1** | **Backend Foundations & Data Seeding** | Express server, database schema (Products, Users, Orders, CustomOrders, DMs, Combos, Coupons, Reviews), 138-product seed, image upload service. |
| **Phase 2** | **Authentication & Dual Dashboards** | JWT auth for Users & Admin, Customer Dashboard (Orders, Custom Quotes, Wishlist, Reviews), Admin Dashboard (Sales, Orders, Stock, CMS). |
| **Phase 3** | **Catalog CMS, Stock Management & Wishlist** | In-stock / Out-of-Stock indicators, "Notify Me" trigger, Admin stock manager, global Wishlist drawer & state. |
| **Phase 4** | **Custom Order Page & Private DM / Quoting** | Category selector (Resin, Pipe cleaner, etc.), photo upload, real-time DM thread, Admin quote offer / decline, 1-click quote checkout. |
| **Phase 5** | **Margin-Safe Combos, Coupons & Checkout** | Admin bundle builder with loss-prevention margin guard, coupon engine (% / flat off), multi-step checkout drawer & tracking stepper. |
| **Phase 6** | **Product Reviews & 5-Star Ratings** | Star ratings on cards, verified buyer reviews, photo review gallery, write-a-review modal, admin moderation. |
| **Phase 7** | **Interactive 3D Bag Customizer & Bouquet Builder** | 3D Tote/Canvas Bag scene (Three.js), charm snap physics, dynamic colors, interactive pipe cleaner bouquet builder. |
| **Phase 8** | **Value-Adds, Responsive QA & Polish** | Cross-device testing, aesthetic polish, and context synchronization in `CODEBASE_CONTEXT.md`. |

---

## 🚀 Step-by-Step Implementation Breakdown

### Phase 1: Backend Server, Database Schema & Data Migration

1. **Server Initialization (`server/`)**:
   - Initialize Node.js + Express backend alongside Vite frontend.
   - Configure middleware: `cors`, `express.json()`, `morgan`, and error handlers.
   - Setup static serving or Cloudinary integration for uploaded product images and custom order attachments (`/uploads/*`).

2. **Database Schema & Models**:
   - **User Model**: `name`, `email`, `phone`, `passwordHash`, `role` (`'user'` | `'admin'`), `addresses` array, `createdAt`.
   - **Product Model**: `title`, `price`, `costPrice`, `category`, `subcategory`, `badge`, `stockCount`, `isOutOfStock`, `colors` array, `ratingAvg`, `ratingCount`, `isAvailable`.
   - **Order Model**: `orderNumber`, `userId`, `customerName`, `customerPhone`, `shippingAddress`, `items`, `subtotal`, `discountAmount`, `couponCode`, `totalAmount`, `status` (`'pending'` | `'crafting'` | `'shipped'` | `'delivered'`), `paymentMethod`, `paymentStatus`.
   - **CustomOrder Model**: `customOrderId`, `userId`, `customerName`, `customerPhone`, `category`, `specifications`, `customText`, `referencePhotos` array, `status` (`'submitted'` | `'quoted'` | `'accepted'` | `'crafting'` | `'declined'`), `quotePrice`, `estimatedDays`, `adminNotes`.
   - **CustomOrderMessage Model (DM)**: `customOrderId`, `sender` (`'customer'` | `'admin'`), `message`, `attachments`, `createdAt`.
   - **Combo Model**: `title`, `description`, `productIds` array, `regularPrice`, `comboPrice`, `savingsAmount`, `minMarginThreshold`, `badge`, `isActive`.
   - **Coupon Model**: `code`, `discountType`, `discountValue`, `minOrderValue`, `maxDiscountCap`, `expiryDate`, `usageLimit`, `usedCount`, `isActive`.
   - **Review Model**: `productId`, `userId`, `customerName`, `rating`, `title`, `comment`, `photos` array, `isVerifiedBuyer`, `createdAt`.
   - **Reel Model**: `href`, `img`, `alt`, `fallbackText`, `displayOrder`.

3. **Catalog Migration & Seeding**:
   - Seed script to import all ~138 products from `src/data/products.js` into the database with initial stock and margin baseline data.

---

### Phase 2: Authentication & Dual Dashboards

1. **Auth Engine (`AuthContext.jsx`)**:
   - JWT auth endpoints (`register`, `login`, `me`, `address`).
   - Guest browsing with friendly, dismissible welcome craft popup.
   - Header account badge: Customer profile menu vs. Admin switch.

2. **🛍️ Customer Dashboard**:
   - **My Orders**: Real-time visual crafting timeline (`Received 📋` ➔ `Coiling 🧵` ➔ `Resin Curing ✨` ➔ `Dispatched 🚚` ➔ `Delivered 🌸`).
   - **Custom Orders & Chats**: Active custom craft requests, pending quotes with "Accept Quote" button, and private DM chat thread.
   - **Wishlist Tab**: Collection of saved items with 1-click "Move to Cart".
   - **My Reviews & Address Book**: Manage delivery locations and view past reviews.

3. **🛡️ Admin Dashboard (`/admin`)**:
   - **Overview & Analytics**: Revenue (₹), Pending Orders, Custom Quote Requests, Low Stock alerts.
   - **Order Manager**: Status updater, customer contact trigger (Direct WhatsApp link with pre-filled order ID).

---

### Phase 3: Catalog CMS, Stock Management & Wishlist System

1. **Stock Management**:
   - Real-time stock counts: `stockCount === 0` displays "Out of Stock" badge and disables "Add to Cart".
   - "Notify Me When Available" trigger.
   - Urgency badge (*"Only 2 left in stock!"*).
   - Admin Inventory controller with batch update and low stock filters.

2. **Wishlist System (`WishlistContext.jsx`)**:
   - Floating heart toggle on every `ProductCard` with micro-animation.
   - Dedicated Wishlist Drawer & Dashboard Tab with instant "Move to Bag" or "Remove".
   - Synchronized across browser storage and customer profile.

---

### Phase 4: Custom Order Page & Private DM / Quoting Engine

1. **Custom Request Portal (`/customize` or Customizer Modal)**:
   - Select craft category (Resin Art, Pipe Cleaner Craft, Clay, Crochet, Gift Sets).
   - Upload reference photos, custom names/text, color themes, and special requirements.
   - Generates a unique Custom Order ID (e.g. `#CUST-8492`).

2. **Private DM / Chat System**:
   - Real-time chat interface attached to the custom order.
   - Image attachment previews, clarifications, and design drafts.

3. **Admin Quoting & Acceptance Workflow**:
   - Admin reviews request and can:
     1. **Quote Offer**: Enter custom price (₹) + estimated crafting days + note.
     2. **Decline Request**: If not feasible, with a custom note.
   - Customer receives quote card in chat thread with **"Accept & Add to Cart"** button for instant checkout.

---

### Phase 5: Margin-Safe Combos, Coupon Engine & Checkout Flow

1. **Combos & Smart Margin-Protected Discounting**:
   - Admin bundle builder selecting 2+ products.
   - **Margin-Guard Algorithm**: Ensures bundle price $\ge$ sum of base costs + minimum studio profit margin.
   - Storefront bundle display ("Frequently Bought Together" & Combo Bundles section).

2. **Coupon & Promo Code Engine**:
   - Admin coupon creator (code, % or fixed discount, minimum spend, expiry date).
   - Cart Drawer coupon input with instant validation and discount deduction.

3. **Multi-Step Checkout Flow**:
   - Bag Review ➔ Identity ➔ Delivery Address ➔ Coupon Application ➔ Payment (Razorpay Online / WhatsApp Order Integration).

---

### Phase 6: Product Reviews & 5-Star Rating System

1. **Rating Summary**:
   - 5-star average score and review counts displayed on product cards.

2. **Product Detail Reviews Section**:
   - Star breakdown progress bars (5★ to 1★).
   - Customer reviews with Verified Buyer badge, photo gallery, and comments.
   - "Write a Review" form with interactive star picker and photo upload.
   - Admin review moderation in dashboard.

---

### Phase 7: Interactive 3D Bag Customizer (Three.js) & Bouquet Builder

1. **Interactive 3D Bag Customizer**:
   - Three.js / `@react-three/fiber` canvas with Canvas Tote Bag / Backpack.
   - 360° orbit rotation, studio lighting, dynamic bag colors.
   - Interactive charm rack: snap catalog keychains onto bag straps with sway physics.
   - "Add Styled Bag & Charms to Cart" bundle button.

2. **Interactive Custom Bouquet Builder**:
   - Visual craft station to pick flower stems (Lily, Tulip, Lavender, Sunflower), wrapping paper, and ribbon knot colors with live price calculation.

---

### Phase 8: Polish, Responsive QA & Context Synchronization

1. **Design System & Aesthetic Consistency**:
   - Strict adherence to `--cream`, `--paper`, `--ink`, `--gold`, `--rose`, and `Fraunces`/`Caveat` typography across all new portals.
2. **Cross-Device QA**:
   - Mobile, tablet, and desktop responsive testing.
3. **Documentation Updates**:
   - Update `CODEBASE_CONTEXT.md` with new endpoints, state hooks, and components.
