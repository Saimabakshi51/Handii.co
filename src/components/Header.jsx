import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cart, openCart } = useCart();
  const { wishlist, openWishlist } = useWishlist();
  const { user, isAuthenticated, isAdmin, openAuthModal } = useAuth();
  const navigate = useNavigate();

  function handleNavigateCategory(cat, sub) {
    navigate(`/shop?cat=${cat}&sub=${sub || 'all'}`);
    setMobileOpen(false);
  }

  return (
    <header>
      <nav className="wrap">
        <Link to="/" className="brand">
          <img src="/images/reelall.jpeg" alt="handii.co logo" />
          <span className="brand-word">
            handii<span>.co</span>
          </span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
            Home
          </NavLink>

          <div className="dropdown">
            <NavLink to="/shop" className={({ isActive }) => (isActive ? 'active' : '')}>
              Shop ▾
            </NavLink>
            <div className="dropdown-menu">
              <div className="group-label">Pipe Cleaner</div>
              <button onClick={() => handleNavigateCategory('pipecleaner', 'flowers')}>
                Flowers &amp; Bouquets
              </button>
              <button onClick={() => handleNavigateCategory('pipecleaner', 'keychains')}>
                Keychains &amp; Charms
              </button>
              <div className="group-label">Resin</div>
              <button onClick={() => handleNavigateCategory('resin', 'alphabet')}>
                Alphabet Keychains
              </button>
              <button onClick={() => handleNavigateCategory('resin', 'coasters')}>
                Botanical Coasters
              </button>
              <button onClick={() => handleNavigateCategory('resin', 'jhumka')}>
                Jhumka &amp; Floral
              </button>
              <button onClick={() => handleNavigateCategory('resin', 'charms')}>
                Small Charms
              </button>
              <div className="group-label">Bracelets</div>
              <button onClick={() => handleNavigateCategory('bracelets', 'all')}>
                Beaded &amp; Disc Bead
              </button>
            </div>
          </div>

          <NavLink to="/combos" className={({ isActive }) => (isActive ? 'active' : '')}>
            Combos 🎁
          </NavLink>

          <NavLink to="/customize" className={({ isActive }) => (isActive ? 'active' : '')}>
            Customize ✨
          </NavLink>

          <a href="/#reels">Reels</a>
          <a href="/#about">Our Story</a>
          <a href="/#contact">Contact</a>
        </div>

        <div className="nav-actions">
          {/* Admin Switch Link */}
          {isAdmin && (
            <Link to="/admin" className="admin-badge-btn" title="Open Admin Control Panel">
              🛡️ Admin
            </Link>
          )}

          {/* User Account Link */}
          <div
            className="icon-btn"
            title={isAuthenticated ? `Hello, ${user.name} (Dashboard)` : 'Sign In / Account'}
            onClick={() => {
              if (isAuthenticated) {
                navigate('/dashboard');
              } else {
                openAuthModal('login');
              }
            }}
          >
            {isAuthenticated ? '👤' : '🔑'}
          </div>

          {/* Wishlist Trigger */}
          <div
            className="icon-btn"
            title="Wishlist"
            style={{ position: 'relative' }}
            onClick={openWishlist}
          >
            ❤️
            {wishlist.length > 0 && (
              <span className="cart-badge wishlist-badge">{wishlist.length}</span>
            )}
          </div>

          {/* Cart Bag Trigger */}
          <div
            className="icon-btn"
            id="cartBtn"
            title="Bag"
            style={{ position: 'relative' }}
            onClick={openCart}
          >
            🧺
            <span
              className="cart-badge"
              style={{ display: cart.length ? 'flex' : 'none' }}
            >
              {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}
            </span>
          </div>

          <div className="burger" onClick={() => setMobileOpen((v) => !v)}>
            ☰
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <div className={'mobile-panel' + (mobileOpen ? ' open' : '')}>
        <Link to="/" onClick={() => setMobileOpen(false)}>
          🏠 Home
        </Link>
        <Link to="/shop" onClick={() => setMobileOpen(false)}>
          🌸 Full Shop Catalog
        </Link>
        <Link to="/combos" onClick={() => setMobileOpen(false)}>
          🎁 Studio Combos &amp; Bundles
        </Link>
        <Link to="/customize" onClick={() => setMobileOpen(false)}>
          ✨ Custom Orders &amp; Private DM
        </Link>
        <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
          {isAuthenticated ? `👤 My Account (${user.name})` : '🔑 Sign In / Register'}
        </Link>

        {isAdmin && (
          <Link to="/admin" onClick={() => setMobileOpen(false)}>
            🛡️ Admin Control Portal
          </Link>
        )}

        <div className="mgroup">Craft Categories</div>
        <button onClick={() => handleNavigateCategory('pipecleaner', 'flowers')}>
          Flowers &amp; Bouquets
        </button>
        <button onClick={() => handleNavigateCategory('pipecleaner', 'keychains')}>
          Keychains &amp; Charms
        </button>
        <button onClick={() => handleNavigateCategory('resin', 'alphabet')}>
          Resin Alphabet Keychains
        </button>
        <button onClick={() => handleNavigateCategory('resin', 'coasters')}>
          Botanical Coasters
        </button>

        <a href="/#reels" style={{ marginTop: 18 }} onClick={() => setMobileOpen(false)}>
          Our Reels
        </a>
        <a href="/#about" onClick={() => setMobileOpen(false)}>
          Our Story
        </a>
        <a href="/#contact" onClick={() => setMobileOpen(false)}>
          Contact
        </a>
      </div>
    </header>
  );
}
