import { useRef, useState } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [activeColorIdx, setActiveColorIdx] = useState(
    product.colors.findIndex((c) => c.active) !== -1
      ? product.colors.findIndex((c) => c.active)
      : 0
  );
  const [displayImg, setDisplayImg] = useState(product.img);
  const [imgOpacity, setImgOpacity] = useState(1);
  const [added, setAdded] = useState(false);
  const timeoutRef = useRef(null);

  const activeColor = product.colors[activeColorIdx];

  function handleSelectColor(idx) {
    setActiveColorIdx(idx);
    const newImg = product.colors[idx].img;
    if (newImg && newImg !== displayImg) {
      setImgOpacity(0);
      window.setTimeout(() => {
        setDisplayImg(newImg);
        setImgOpacity(1);
      }, 150);
    }
  }

  function handleAddToCart() {
    addToCart({
      name: product.title,
      price: product.price,
      img: displayImg,
      color: activeColor ? activeColor.color : 'As Pictured',
    });
    setAdded(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setAdded(false), 1100);
  }

  function handleNotify() {
    // eslint-disable-next-line no-alert
    alert(
      "Thanks for your interest! Follow @handii.co_ on Instagram — we'll post photos and colours as soon as this piece is ready."
    );
  }

  return (
    <div className="prod-card" data-cat={product.cat} data-sub={product.sub}>
      <div className="imgwrap">
        <img src={displayImg} alt={product.alt} style={{ opacity: imgOpacity }} />
        {product.badge && <span className="badge">{product.badge}</span>}
      </div>
      <div className="prod-info">
        <h4>{product.title}</h4>
        <p className="price">{product.price}</p>

        {product.colors.length > 0 && (
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

        {product.isNotify ? (
          <button className="add-cart-btn notify-btn" onClick={handleNotify}>
            Notify Me
          </button>
        ) : (
          <button className="add-cart-btn" onClick={handleAddToCart} disabled={added}>
            {added ? 'Added ✓' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
}

// Converts a raw CSS style string (e.g. "background:#e3ae49") into a React style object.
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
