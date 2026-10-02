import { useRef, useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

function getInitialColorIndex(p) {
  if (!p || !p.colors || p.colors.length === 0) return 0;
  const found = p.colors.findIndex((c) => c.active);
  return found !== -1 ? found : 0;
}

function getImageForColor(p, idx) {
  if (!p) return '/images/flowermain.jpeg';
  if (p.colors && p.colors[idx]?.img && p.colors[idx].img.trim()) {
    return p.colors[idx].img.trim();
  }
  return p.img || '/images/flowermain.jpeg';
}

export default function ProductCard({ product, onOpenReviews }) {
  const { addToCart, updateProductQuantity, getItemQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [activeColorIdx, setActiveColorIdx] = useState(() => getInitialColorIndex(product));
  const [displayImg, setDisplayImg] = useState(() => getImageForColor(product, getInitialColorIndex(product)));
  const [imgOpacity, setImgOpacity] = useState(1);
  const [added, setAdded] = useState(false);
  const timeoutRef = useRef(null);

  // Sync state whenever product props change (e.g. category filter, search, admin edit)
  useEffect(() => {
    const idx = getInitialColorIndex(product);
    setActiveColorIdx(idx);
    setDisplayImg(getImageForColor(product, idx));
    setImgOpacity(1);
  }, [product.id, product.img, product.colors]);

  const activeColor = product.colors && product.colors[activeColorIdx];
  const activeColorName = activeColor ? activeColor.color : 'As Pictured';
  const isFavorited = isInWishlist(product.id);
  const isOut = product.isOutOfStock || product.stockCount === 0 || product.isNotify;
  const isLowStock = !isOut && product.stockCount > 0 && product.stockCount <= 3;

  // Check quantity in cart for this specific product + selected color
  const inCartQty = getItemQuantity(product.id, activeColorName);

  function handleSelectColor(idx) {
    setActiveColorIdx(idx);
    const targetImg = getImageForColor(product, idx);
    if (targetImg !== displayImg) {
      setImgOpacity(0);
      window.setTimeout(() => {
        setDisplayImg(targetImg);
        setImgOpacity(1);
      }, 150);
    }
  }

  function handleAddToCart() {
    if (isOut) return;
    addToCart(
      {
        productId: product.id,
        name: product.title,
        price: product.price,
        img: displayImg,
        color: activeColorName,
        quantity: 1
      },
      false // don't abruptly pop drawer when clicking on card, let them increment directly
    );
    setAdded(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setAdded(false), 800);
  }

  function handleIncrement() {
    updateProductQuantity(product.id, activeColorName, 1);
  }

  function handleDecrement() {
    updateProductQuantity(product.id, activeColorName, -1);
  }

  function handleNotify() {
    alert(
      `Thanks for your interest in "${product.title}"! We have marked your alert and will announce restocks on Instagram @handii.co! 🌸`
    );
  }

  return (
    <div className="prod-card" data-cat={product.cat} data-sub={product.sub}>
      <div className="imgwrap">
        <img
          src={displayImg}
          alt={product.alt || product.title}
          style={{ opacity: imgOpacity }}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/images/flowermain.jpeg';
          }}
        />

        {/* Badges */}
        {isOut ? (
          <span className="badge badge-out">Out of Stock</span>
        ) : isLowStock ? (
          <span className="badge badge-low">Only {product.stockCount} left!</span>
        ) : product.badge ? (
          <span className="badge">{product.badge}</span>
        ) : null}

        {/* Wishlist Heart Button */}
        <button
          className={`wishlist-heart-btn ${isFavorited ? 'active' : ''}`}
          title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
          onClick={() => toggleWishlist(product)}
        >
          {isFavorited ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="prod-info">
        <div className="prod-title-rating">
          <h4>{product.title}</h4>
          {/* Star Rating Badge */}
          <button
            type="button"
            className="rating-badge-btn"
            title="View customer reviews"
            onClick={() => onOpenReviews && onOpenReviews(product)}
          >
            ★ {product.ratingAvg || '4.9'} <span className="rev-count">({product.ratingCount || 12})</span>
          </button>
        </div>

        <p className="price">₹{product.price}</p>

        {product.colors && product.colors.length > 0 && (
          <div className="color-row">
            <span className="color-label">Colour:</span>
            {product.colors.map((c, idx) => {
              const swatchStyle = getColorStyle(c);
              const colorTitle = c.color || c.title || c.name || `Color ${idx + 1}`;
              return (
                <button
                  key={idx}
                  type="button"
                  className={'color-dot' + (idx === activeColorIdx ? ' active' : '')}
                  style={swatchStyle}
                  data-color={colorTitle}
                  title={colorTitle}
                  onClick={() => handleSelectColor(idx)}
                />
              );
            })}
          </div>
        )}

        {/* Action: Out of stock Notify OR In-Grid Quantity Selector OR Add to Cart */}
        {isOut ? (
          <button className="add-cart-btn notify-btn" onClick={handleNotify}>
            Notify Me When Back
          </button>
        ) : inCartQty > 0 ? (
          <div className="card-qty-control-box">
            <button
              type="button"
              className="card-qty-btn minus"
              onClick={handleDecrement}
              title="Decrease quantity"
            >
              −
            </button>
            <span className="card-qty-count">{inCartQty} in Bag</span>
            <button
              type="button"
              className="card-qty-btn plus"
              onClick={handleIncrement}
              title="Increase quantity"
            >
              +
            </button>
          </div>
        ) : (
          <button className="add-cart-btn" onClick={handleAddToCart} disabled={added}>
            {added ? 'Added ✓' : 'Add to Cart 🧺'}
          </button>
        )}
      </div>
    </div>
  );
}

function getColorStyle(c) {
  if (!c) return { background: '#e3ae49' };
  if (c.style) {
    const parsed = parseInlineStyle(c.style);
    if (parsed && (parsed.background || parsed.backgroundColor)) return parsed;
  }
  if (c.hex) {
    return { background: c.hex.startsWith('#') ? c.hex : `#${c.hex}` };
  }
  if (c.color) {
    return { background: c.color };
  }
  return { background: '#e3ae49' };
}

function parseInlineStyle(styleStr) {
  if (!styleStr) return {};
  const result = {};
  styleStr.split(';').forEach((rule) => {
    const [prop, ...rest] = rule.split(':');
    if (!prop || rest.length === 0) return;
    const value = rest.join(':').trim();
    const camelProp = prop.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    result[camelProp] = value;
  });
  return result;
}
