# handii.co — React version

This is a React (Vite) port of the original static handii.co site. Structure, styling,
class names, and behavior are kept 1:1 with the original `index.html` / `style.css` / `main.js`.

## Setup

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Images

**Image paths are unchanged from the original site** (`images/filename.jpg`, etc.) —
in this Vite project that means they need to live in `public/images/`, since Vite
serves everything in `public/` from the site root.

Copy your existing `images/` folder (all the product photos, hero collage images,
reel covers, etc.) into:

```
public/images/
```

No filenames or paths were changed — just drop the folder in and every `<img>` will
resolve exactly as it did before.

## Structure

```
src/
  data/
    categories.js      // the 6 "shop by craft" entry cards
    products.js         // all 73 product cards (auto-extracted from the original HTML)
    reels.js             // Instagram reel strip
    subcategories.js    // main tab / sub-tab definitions (from the original main.js)
  context/
    CartContext.jsx      // cart state + WhatsApp checkout (replaces the global `cart` array)
  components/
    Header.jsx            // nav, dropdown, burger + mobile panel
    CartDrawer.jsx
    Hero.jsx
    Divider.jsx
    CategoryGrid.jsx
    Shop.jsx               // main tabs, sub tabs, filtered product grid
    ProductCard.jsx        // color swatch swap + add-to-cart, per original main.js logic
    Reels.jsx
    About.jsx
    Contact.jsx
    Footer.jsx
  App.jsx
  main.jsx
  index.css               // the original style.css, unchanged
```

## Notes on behavior parity

- Category/sub-category filtering, "Add to Cart", color-dot image swap (with the same
  150ms fade), the cart drawer, badge counter, and the WhatsApp checkout message are all
  ported faithfully from `main.js`.
- `goToShop(cat, sub)` from the original inline `onclick` handlers is now a prop
  (`onGoToShop`) passed down to the header dropdown, mobile panel, category grid, and
  footer — it updates the shop filters and scrolls to `#shop` exactly as before.
- The "Notify Me" button (used for two coming-soon items) keeps the original alert text.
