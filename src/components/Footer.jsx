import { Link, useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  function handleGoToShop(cat, sub) {
    navigate(`/shop?cat=${cat}&sub=${sub || 'all'}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand">
              <img src="/images/reelall.jpeg" alt="handii.co" />
              <span className="brand-word">
                handii<span>.co</span>
              </span>
            </Link>
            <p>Handmade Factory — blooming pipe cleaner stems, shimmering resin keepsakes &amp; personalized accessories, crafted with love.</p>
            <div className="socials">
              <a href="https://www.instagram.com/handii.co_/" target="_blank" rel="noopener noreferrer" title="Instagram">IG</a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" title="WhatsApp">WA</a>
              <a href="#" title="Pinterest">P</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <button onClick={() => handleGoToShop('pipecleaner', 'flowers')}>Flowers &amp; Bouquets</button>
            <button onClick={() => handleGoToShop('resin', 'alphabet')}>Resin Alphabet</button>
            <button onClick={() => handleGoToShop('resin', 'coasters')}>Botanical Coasters</button>
            <button onClick={() => handleGoToShop('bracelets', 'all')}>Bracelets</button>
            <Link to="/combos">Curated Combos 🎁</Link>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link to="/customize">Custom Orders &amp; DM ✨</Link>
            <Link to="/dashboard">Track My Order (Dashboard)</Link>
            <Link to="/shop">Full Catalog</Link>
          </div>
          <div className="footer-col">
            <h4>Studio</h4>
            <a href="/#about">Our Story</a>
            <a href="/#reels">Reels</a>
            <a href="/#contact">Contact</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 handii.co — Handmade Factory. All rights reserved.</span>
          <span>Made with 🧵 by hand, in India.</span>
        </div>
      </div>
    </footer>
  );
}
