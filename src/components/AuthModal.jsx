import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode, setAuthModalMode, login, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (authModalMode === 'register') {
      const res = await register(name, email, password, phone);
      setLoading(false);
      if (!res.success) {
        setError(res.message);
      }
    } else {
      const res = await login(email, password);
      setLoading(false);
      if (!res.success) {
        setError(res.message);
      }
    }
  }

  function handleFillDemo(type) {
    if (type === 'admin') {
      setEmail('admin@handii.co');
      setPassword('admin123');
    } else {
      setEmail('maya@crafts.com');
      setPassword('maya123');
    }
    setError('');
  }

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="craft-modal auth-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeAuthModal}>✕</button>

        <div className="auth-header">
          <span className="tag">Handcrafted Community</span>
          <h2>
            {authModalMode === 'register'
              ? 'Join handii.co 🌸'
              : 'Welcome Back ✨'}
          </h2>
          <p className="auth-sub">
            {authModalMode === 'register'
              ? 'Create an account to track custom orders, save your wishlist & unlock discounts.'
              : 'Sign in to access your orders, private custom chats & wishlist.'}
          </p>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {authModalMode === 'register' && (
            <div className="form-group">
              <label>Your Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Maya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {authModalMode === 'register' && (
            <div className="form-group">
              <label>WhatsApp / Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. 9812345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
            {loading
              ? 'Connecting...'
              : authModalMode === 'register'
              ? 'Create My Account'
              : 'Sign In'}
          </button>
        </form>

        {/* Fast Demo Accounts Helper */}
        <div className="demo-accounts-strip">
          <span>Quick Demo Access:</span>
          <button type="button" className="demo-chip" onClick={() => handleFillDemo('customer')}>
            👤 Maya (Customer)
          </button>
          <button type="button" className="demo-chip" onClick={() => handleFillDemo('admin')}>
            🛡️ Studio Admin
          </button>
        </div>

        <div className="auth-footer-toggle">
          {authModalMode === 'register' ? (
            <p>
              Already part of the family?{' '}
              <button type="button" onClick={() => { setAuthModalMode('login'); setError(''); }}>
                Sign In
              </button>
            </p>
          ) : (
            <p>
              New to handii.co?{' '}
              <button type="button" onClick={() => { setAuthModalMode('register'); setError(''); }}>
                Create an Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
