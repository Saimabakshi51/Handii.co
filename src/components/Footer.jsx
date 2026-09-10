export default function Footer({ onGoToShop }) {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#top" className="brand">
              <img src="/images/reelall.jpeg" alt="handii.co" />
              <span className="brand-word">
                handii<span>.co</span>
              </span>
            </a>
            <p>Handmade Factory — pipe cleaner blooms, resin charms and oxidised jewellery, made to order.</p>
            <div className="socials">
              <a href="https://www.instagram.com/handii.co_/" target="_blank" rel="noopener noreferrer" title="Instagram">IG</a>
              <a href="#" title="WhatsApp">WA</a>
              <a href="#" title="Pinterest">P</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <button onClick={() => onGoToShop('pipecleaner', 'flowers')}>Flowers &amp; Bouquets</button>
            <button onClick={() => onGoToShop('resin', 'charms')}>Resin Charms</button>
            <button onClick={() => onGoToShop('resin', 'alphabet')}>Resin Alphabet</button>
            <button onClick={() => onGoToShop('bracelets', 'all')}>Bracelets</button>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <a href="#">Custom Orders</a>
            <a href="#">Shipping Info</a>
            <a href="#">Care Guide</a>
            <a href="#">Track My Order</a>
          </div>
          <div className="footer-col">
            <h4>Studio</h4>
            <a href="#about">Our Story</a>
            <a href="#reels">Reels</a>
            <a href="#contact">Contact</a>
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
