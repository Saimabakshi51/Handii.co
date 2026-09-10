import { useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product, onOpenReviews }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [activeColorIdx, setActiveColorIdx] = useState(
    product.colors && product.colors.findIndex((c) => c.active) !== -1
      ? product.colors.findIndex((c) => c.active)
      : 0
  );
  const [displayImg, setDisplayImg] = useState(product.img);
  const [imgOpacity, setImgOpacity] = useState(1);
  const [added, setAdded] = useState(false);
  const timeoutRef = useRef(null);

  const activeColor = product.colors && product.colors[activeColorIdx];
  const isFavorited = isInWishlist(product.id);
  const isOut = product.isOutOfStock || product.stockCount === 0 || product.isNotify;
  const isLowStock = !isOut && product.stockCount > 0 && product.stockCount <= 3;

  function handleSelectColor(idx) {
    setActiveColorIdx(idx);
    const newImg = product.colors[idx]?.img;
    if (newImg && newImg !== displayImg) {
      setImgOpacity(0);
      window.setTimeout(() => {
        setDisplayImg(newImg);
        setImgOpacity(1);
      }, 150);
    }
  }

  function handleAddToCart() {
    if (isOut) return;
    addToCart({
      productId: product.id,
      name: product.title,
      price: product.price,
      img: displayImg,
      color: activeColor ? activeColor.color : 'As Pictured',
      quantity: 1
    });
    setAdded(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setAdded(false), 1100);
  }

  function handleNotify() {
    alert(
      `Thanks for your interest in "${product.title}"! We have marked your alert and will announce restocks on Instagram @handii.co_! 🌸`
    );
  }

  return (
    <div className="prod-card" data-cat={product.cat} data-sub={product.sub}>
      <div className="imgwrap">
        <img src={displayImg} alt={product.alt || product.title} style={{ opacity: imgOpacity }} />

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
            {product.colors.map((c, idx) => (
              <button
                key={idx}
                className={'color-dot' + (idx === activeColorIdx ? ' active' : '')}
                style={parseInlineStyle(c.style)}
                data-color={c.color}
                title={c.title}
                onClick={() => handleSelectColor(idx)}
              />
            ))}
          </div>
        )}

        {isOut ? (
          <button className="add-cart-btn notify-btn" onClick={handleNotify}>
            Notify Me When Back
          </button>
        ) : (
          <button className="add-cart-btn" onClick={handleAddToCart} disabled={added}>
            {added ? 'Added ✓' : 'Add to Cart 🧺'}
          </button>
        )}
      </div>
    </div>
  );
}

function parseInlineStyle(styleStr) {
  if (!styleStr) return undefined;
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
