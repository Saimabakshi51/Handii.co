import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function Header({ onGoToShop }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cart, openCart } = useCart();

  function handleGoToShop(cat, sub) {
    onGoToShop(cat, sub);
    setMobileOpen(false);
  }

  return (
    <header>
      <nav className="wrap">
        <a href="#top" className="brand">
          <img src="/images/reelall.jpeg" alt="handii.co logo" />
          <span className="brand-word">
            handii<span>.co</span>
          </span>
        </a>
        <div className="nav-links">
          <a href="#top">Home</a>
          <div className="dropdown">
            <a href="#shop">Shop ▾</a>
            <div className="dropdown-menu">
              <div className="group-label">Pipe Cleaner</div>
              <button onClick={() => handleGoToShop('pipecleaner', 'flowers')}>Flowers &amp; Bouquets</button>
              <button onClick={() => handleGoToShop('pipecleaner', 'keychains')}>Keychains &amp; Charms</button>
              <div className="group-label">Resin</div>
              <button onClick={() => handleGoToShop('resin', 'alphabet')}>Alphabet</button>
              <button onClick={() => handleGoToShop('resin', 'coasters')}>Coasters</button>
              <button onClick={() => handleGoToShop('resin', 'jhumka')}>Jhumka</button>
              <button onClick={() => handleGoToShop('resin', 'charms')}>Small Charms &amp; Keychains</button>
              <div className="group-label">Bracelets</div>
              <button onClick={() => handleGoToShop('bracelets', 'all')}>Beaded &amp; Disc Bead</button>
            </div>
          </div>
          <a href="#reels">Our Reels</a>
          <a href="#about">Our Story</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-actions">
          <div className="icon-btn" title="Search">🔍</div>
          <div className="icon-btn" title="My Orders (coming soon)">🧾</div>
          <div className="icon-btn" id="cartBtn" title="Bag" style={{ position: 'relative' }} onClick={openCart}>
            🧺
            <span className="cart-badge" style={{ display: cart.length ? 'flex' : 'none' }}>
              {cart.length}
            </span>
          </div>
          <div className="burger" onClick={() => setMobileOpen((v) => !v)}>☰</div>
        </div>
      </nav>

      <div className={'mobile-panel' + (mobileOpen ? ' open' : '')}>
        <a href="#top" onClick={() => setMobileOpen(false)}>Home</a>
        <div className="mgroup">Pipe Cleaner</div>
        <button onClick={() => handleGoToShop('pipecleaner', 'flowers')}>Flowers &amp; Bouquets</button>
        <button onClick={() => handleGoToShop('pipecleaner', 'keychains')}>Keychains &amp; Charms</button>
        <div className="mgroup">Resin</div>
        <button onClick={() => handleGoToShop('resin', 'alphabet')}>Alphabet</button>
        <button onClick={() => handleGoToShop('resin', 'coasters')}>Coasters</button>
        <button onClick={() => handleGoToShop('resin', 'jhumka')}>Jhumka</button>
        <button onClick={() => handleGoToShop('resin', 'charms')}>Small Charms &amp; Keychains</button>
        <div className="mgroup">Bracelets</div>
        <button onClick={() => handleGoToShop('bracelets', 'all')}>Beaded &amp; Disc Bead</button>
        <a href="#reels" style={{ marginTop: 18 }} onClick={() => setMobileOpen(false)}>Our Reels</a>
        <a href="#about" onClick={() => setMobileOpen(false)}>Our Story</a>
        <a href="#contact" onClick={() => setMobileOpen(false)}>Contact</a>
      </div>
    </header>
  );
}
