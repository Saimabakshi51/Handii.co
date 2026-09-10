# handii.co — Comprehensive Codebase Context

> **Living Context File**: This document serves as the single source of truth for the `handii-react` codebase. It is continuously updated across iterations to preserve full contextual understanding, eliminate repetitive file re-reading, and optimize token efficiency.

---

## 1. Project Overview & Tech Stack

- **Application**: `handii.co — Handmade Factory`
- **Purpose**: E-commerce catalog & showcase for handmade craft items (pipe cleaner bouquets, resin charms & coasters, oxidized jewellery, beaded bracelets, pixel art).
- **Core Stack**:
  - **Framework**: React 18.3.1
  - **Bundler / Dev Server**: Vite 5.4.0 (`@vitejs/plugin-react`)
  - **Styling**: Vanilla CSS (`src/index.css`) with CSS custom properties design system.
  - **Icons / Badges**: Native UTF-8 emojis & custom CSS badges/icons (no external icon package).
  - **Fonts** (Google Fonts in `index.html`):
    - `Fraunces` (Serif, weights: 300, 500, 600) — Headings & Brand
    - `Work Sans` (Sans-serif, weights: 300, 400, 500, 600) — Body & UI
    - `Caveat` (Cursive/Handwritten, weights: 500, 700) — Tags, Eyebrows, Stickers, Dividers
  - **Asset Directory**: `public/images/` (served statically at `/images/*`).

---

## 2. Directory Structure

```
d:/handii-react/handii-react/
├── index.html                   # HTML entry point, Google Fonts, meta tags, root mounting point
├── package.json                 # Project dependencies and npm scripts (dev, build, preview)
├── vite.config.js               # Vite configuration with React plugin
├── README.md                    # Project overview & porting parity notes
├── CODEBASE_CONTEXT.md          # [THIS FILE] Continuous token-saving codebase context
├── public/
│   └── images/                  # All static product photos, hero imagery, logos, reel covers
└── src/
    ├── main.jsx                 # React root renderer (StrictMode, index.css)
    ├── App.jsx                  # Root application layout, navigation state, shop ref scrolling
    ├── index.css                # Global design system, variables, components & responsive layout
    ├── context/
    │   └── CartContext.jsx      # Global cart state, drawer toggle & WhatsApp checkout link generator
    ├── data/
    │   ├── categories.js        # Category grid shortcuts data (6 items)
    │   ├── subcategories.js     # Category-to-subcategory mapping & main tab definitions
    │   ├── products.js          # Catalog of ~138 products with colors, prices, badges & tags
    │   └── reels.js             # Instagram reels video links & fallback configurations
    └── components/
        ├── Header.jsx           # Top sticky blur navbar, dropdown menu, mobile drawer, action icons
        ├── Hero.jsx             # Hero banner with rotated polaroid collage & CTA buttons
        ├── Divider.jsx          # Handwritten doodle divider with dashed lines
        ├── CategoryGrid.jsx     # 6 visual "Shop by Craft" shortcut cards
        ├── Shop.jsx             # Main category tabs, sub-tabs pills, filtered product grid & empty state
        ├── ProductCard.jsx      # Product card with color swatch switcher, image fade, cart action & notify
        ├── CartDrawer.jsx       # Slide-out shopping bag drawer with item list & WhatsApp checkout
        ├── Reels.jsx            # 4-card Instagram reels preview strip
        ├── About.jsx            # Brand story & key handmade stat metrics
        ├── Contact.jsx          # Newsletter email subscription banner
        └── Footer.jsx           # Footer links, social buttons, shop shortcuts & copyright
```

---

## 3. State Management & Architecture

### Global Cart State (`src/context/CartContext.jsx`)
- **Context**: `CartContext` accessed via custom hook `useCart()`.
- **State Properties**:
  - `cart`: Array of items `[{ name, price, img, color }]`.
  - `isCartOpen`: Boolean controlling side drawer visibility.
- **Methods**:
  - `addToCart(item)`: Appends item and automatically opens drawer (`setCartOpen(true)`).
  - `removeFromCart(index)`: Filters out item by index.
  - `openCart()` / `closeCart()`: Toggles drawer.
  - `checkoutWhatsApp()`: Builds a formatted WhatsApp order message from `cart` items and opens `https://wa.me/919876543210?text=...` in a new tab.

### Page-Level Navigation & Filtering (`src/App.jsx`)
- **State**:
  - `currentCat`: Active main category string (e.g., `'all'`, `'pipecleaner'`, `'resin'`, `'bracelets'`, `'pixelart'`). Default: `'all'`.
  - `currentSub`: Active subcategory string (e.g., `'all'`, `'flowers'`, `'keychains'`, `'alphabet'`, etc.). Default: `'all'`.
  - `shopRef`: `useRef` pointing to `<Shop />` element.
- **Handlers**:
  - `handleSelectCat(cat)`: Sets category and resets subcategory to `'all'`.
  - `handleSelectSub(sub)`: Sets specific subcategory.
  - `handleGoToShop(cat, sub)`: Updates `currentCat` and `currentSub`, then smoothly scrolls to the shop section via `shopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })`. Propagated to `Header`, `CategoryGrid`, and `Footer`.

---

## 4. Detailed Component Specifications

### 1. `Header.jsx`
- **Location**: `src/components/Header.jsx`
- **Role**: Sticky top navigation bar with blur effect (`backdrop-filter: blur(6px)`).
- **Features**:
  - Brand logo with circular avatar (`/images/reelall.jpeg`) and styled text `handii.co`.
  - Nav links with hover underline animation: Home, Shop (with hover dropdown), Our Reels, Our Story, Contact.
  - Desktop Dropdown: Groups for Pipe Cleaner, Resin, and Bracelets with subcategory click handlers that invoke `onGoToShop(cat, sub)`.
  - Action buttons: Search (`🔍`), Orders (`🧾`), Bag (`🧺`) with badge showing `cart.length`.
  - Hamburger menu (`☰`) triggering full-screen mobile slide-in panel.

### 2. `Hero.jsx`
- **Location**: `src/components/Hero.jsx`
- **Role**: Landing fold introduction.
- **Features**:
  - Eyebrow tag: `"Handmade Factory ✂️🧵"`.
  - Large headline with Fraunces italic accent (`"Little things, stitched with love."`).
  - Action buttons: Primary (`"Explore the shop →"`) linking to `#shop`, Outline (`"Watch us make it"`) linking to `#reels`.
  - Polaroid Collage: 3 layered rotated image cards (`p1`: -5deg, `p2`: 6deg, `p3`: 9deg) + floating handwritten badge sticker (`"handmade ✨"`).

### 3. `Divider.jsx`
- **Location**: `src/components/Divider.jsx`
- **Role**: Aesthetic section separator.
- **Props**: `text` (String displayed in handwritten Caveat font between repeating dashed lines).

### 4. `CategoryGrid.jsx`
- **Location**: `src/components/CategoryGrid.jsx`
- **Role**: 6 visual category shortcut cards (`Flowers & Bouquets`, `Keychains & Charms`, `Alphabet`, `Coasters`, `Jhumka`, `Bracelets`).
- **Interaction**: Clicking any card calls `onGoToShop(cat, sub)`.

### 5. `Shop.jsx`
- **Location**: `src/components/Shop.jsx`
- **Role**: Interactive product catalog with multi-tiered filtering.
- **Features**:
  - Main Category Tabs: `All`, `Pipe Cleaner`, `Resin`, `Bracelets`, `Pixel Art`.
  - Dynamic Sub-category Pills: Rendered conditionally when a category other than `'all'` is selected (from `subcatMap`).
  - Memoized Filtering: Filters `products` array matching `cat` and `sub`.
  - Responsive Grid of `ProductCard` components.
  - Empty state message for categories with no items.

### 6. `ProductCard.jsx`
- **Location**: `src/components/ProductCard.jsx`
- **Role**: Individual product display card.
- **Features**:
  - Image display with badge overlay (`Bestseller`, etc.).
  - Swatch Switcher: Interactive color dots that trigger image swap with 150ms opacity fade.
  - Inline Style Parser: `parseInlineStyle` converts CSS style strings (e.g., `"background:#e3ae49"`) into React style objects.
  - Action Button:
    - Standard: "Add to Cart" -> Updates cart context, displays "Added ✓" for 1100ms.
    - Out of Stock / Unreleased (`isNotify: true`): "Notify Me" button triggering Instagram follow alert.

### 7. `CartDrawer.jsx`
- **Location**: `src/components/CartDrawer.jsx`
- **Role**: Slide-in shopping bag overlay and checkout trigger.
- **Features**:
  - Backdrop overlay (`.cart-overlay`) and side drawer (`.cart-drawer`).
  - List of cart items with thumbnail, title, selected color, price, and remove button.
  - Empty cart placeholder message.
  - WhatsApp Checkout Button: Triggers `checkoutWhatsApp()` to place order with customized pre-filled message.

### 8. `Reels.jsx`
- **Location**: `src/components/Reels.jsx`
- **Role**: Instagram video highlight strip.
- **Features**:
  - 4-column reel preview cards with play overlay.
  - Direct links to Instagram reel URLs and profile link fallback card.

### 9. `About.jsx`
- **Location**: `src/components/About.jsx`
- **Role**: Brand storytelling & authenticity showcase.
- **Features**:
  - Feature image (`/images/WhatsApp Image 2026-07-28 at 09.50.41.jpeg`).
  - Brand narrative explaining handmade philosophy.
  - Metrics row: `100% Handmade`, `5+ Craft techniques`, `1:1 Custom orders`.

### 10. `Contact.jsx`
- **Location**: `src/components/Contact.jsx`
- **Role**: Newsletter subscription capture band.
- **Features**:
  - High-contrast dark banner (`--ink` background, `--gold` button).
  - Controlled email submission handler with alert notification.

### 11. `Footer.jsx`
- **Location**: `src/components/Footer.jsx`
- **Role**: Bottom site navigation and attribution.
- **Features**:
  - Brand description & social link icons (Instagram, WhatsApp, Pinterest).
  - Direct shop category shortcuts using `onGoToShop`.
  - Support & Studio informational links.
  - Copyright line.

---

## 5. Data Schemas (`src/data/`)

### 1. `categories.js`
```javascript
export const categoryGrid = [
  {
    cat: string,       // e.g. "pipecleaner"
    sub: string,       // e.g. "flowers"
    img: string,       // e.g. "/images/flowermain.jpeg"
    alt: string,
    title: string,     // e.g. "Flowers & Bouquets"
    subtitle: string   // e.g. "Pipe cleaner"
  }
]
```

### 2. `subcategories.js`
```javascript
export const subcatMap = {
  pipecleaner: [{ key: 'all', label: 'All Pipe Cleaner' }, { key: 'flowers', label: 'Flowers & Bouquets' }, ...],
  resin: [{ key: 'all', label: 'All Resin' }, { key: 'alphabet', label: 'Alphabet' }, ...],
  bracelets: [{ key: 'all', label: 'All Bracelets' }, { key: 'beaded', label: 'Beaded' }, ...],
  pixelart: [{ key: 'all', label: 'All Pixel Art' }, { key: 'ready', label: 'Ready Designs' }, ...]
};

export const mainTabs = [
  { cat: 'all', label: 'All' },
  { cat: 'pipecleaner', label: 'Pipe Cleaner' },
  { cat: 'resin', label: 'Resin' },
  { cat: 'bracelets', label: 'Bracelets' },
  { cat: 'pixelart', label: 'Pixel Art' },
];
```

### 3. `products.js`
```javascript
export const products = [
  {
    id: number,
    cat: string,          // "pipecleaner" | "resin" | "bracelets" | "pixelart"
    sub: string,          // "flowers" | "keychains" | "alphabet" | "coasters" | "jhumka" | "charms" | "beaded" | "discbead" | etc.
    img: string,          // default image path
    alt: string,
    badge: string | null, // e.g. "Bestseller" or null
    title: string,
    price: string,        // numeric string (e.g. "210")
    colors: [
      {
        img: string,      // image path corresponding to this color
        color: string,    // color name (e.g. "Blush Pink")
        title: string,
        style: string,    // inline CSS styling string for swatch dot, e.g. "background:#e8b4bc"
        active: boolean
      }
    ],
    isNotify: boolean     // true if coming soon / notify only
  }
];
```

### 4. `reels.js`
```javascript
export const reels = [
  {
    href: string,
    img: string | null,
    alt: string,
    isFallback: boolean,
    fallbackText: string | null
  }
];
```

---

## 6. Design System & CSS Variables (`src/index.css`)

### Color Palette Tokens
| Variable | Value | Description |
|---|---|---|
| `--cream` | `#f3e7ce` | Main page background |
| `--paper` | `#fbf5e9` | Card background, drawer background, input background |
| `--ink` | `#1e3a3f` | Deep teal-black primary text, primary button background |
| `--gold` | `#e3ae49` | Warm gold highlight, accent badges, newsletter button |
| `--gold-deep` | `#c98f2c` | Deep gold for heading emphasis (`<em>`), stat numbers, hover |
| `--rose` | `#c4707a` | Soft rose for tags, prices, cart badge, link underlines |
| `--sage` | `#5c7a5e` | Calming green for eyebrow text, WhatsApp checkout button |
| `--line` | `rgba(30,58,63,0.18)` | Subtle border divider color |

### Breakpoints
- **Desktop**: `> 980px` (Full horizontal nav, 6-col category grid, 4-col product grid, 4-col reels, 4-col footer).
- **Tablet / Small Screen**: `≤ 980px` (Nav links hidden, mobile burger shown, 3-col categories, 2-col products, 2-col reels, 2-col footer).
- **Mobile**: `≤ 520px` (2-col category grid, 2-col product grid, 2-col reels, 1-col footer).

---

## 7. Working Rules for Maintenance

1. **Token Efficiency**: When answering questions, planning new features, or modifying components, consult `CODEBASE_CONTEXT.md` first. Only inspect individual source files when making specific surgical code edits.
2. **Synchronized Updates**: Whenever any file, component, data schema, route, or styling pattern is modified or added in the codebase, update `CODEBASE_CONTEXT.md` immediately in the same turn.
3. **Parity Preservation**: Ensure any added components maintain the brand voice, handmade aesthetic, Caveat handwritten accents, and WhatsApp order flow.
