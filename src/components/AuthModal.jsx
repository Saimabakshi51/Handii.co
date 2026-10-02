import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    loginWithOtp,
    sendOtp,
    resetPasswordWithOtp,
    register
  } = useAuth();

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // OTP Flow state
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpPreview, setOtpPreview] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Timer for OTP resend
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setInterval(() => setResendCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Reset local state on modal open/close or mode change
  useEffect(() => {
    setError('');
    setSuccessMsg('');
    setOtpSent(false);
    setOtpCode('');
    setOtpPreview('');
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  async function handleSendOtp(type) {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setOtpLoading(true);

    const res = await sendOtp(email.trim(), type);
    setOtpLoading(false);

    if (res.success) {
      setOtpSent(true);
      setResendCountdown(60);
      setSuccessMsg(`Verification code generated for ${email}!`);
      if (res.previewCode) {
        setOtpPreview(res.previewCode);
        setOtpCode(res.previewCode); // auto-fill in dev mode for quick testing
      }
    } else {
      setError(res.message || 'Failed to send OTP code.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        const res = await login(email.trim(), password);
        setLoading(false);
        if (!res.success) {
          setError(res.message || 'Invalid credentials');
        }
      } else if (authModalMode === 'otp-login') {
        if (!otpCode.trim()) {
          setLoading(false);
          setError('Please enter the 6-digit verification code.');
          return;
        }
        const res = await loginWithOtp(email.trim(), otpCode.trim());
        setLoading(false);
        if (!res.success) {
          setError(res.message || 'OTP verification failed');
        }
      } else if (authModalMode === 'register') {
        const res = await register(name.trim(), email.trim(), password, phone.trim(), otpCode.trim() || undefined);
        setLoading(false);
        if (!res.success) {
          setError(res.message || 'Registration failed');
        }
      } else if (authModalMode === 'forgot') {
        if (!otpCode.trim() || !newPassword) {
          setLoading(false);
          setError('Please provide OTP and your new password.');
          return;
        }
        const res = await resetPasswordWithOtp(email.trim(), otpCode.trim(), newPassword);
        setLoading(false);
        if (res.success) {
          setSuccessMsg('Password updated! You can now sign in.');
          setTimeout(() => setAuthModalMode('login'), 1500);
        } else {
          setError(res.message || 'Failed to reset password');
        }
      }
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred. Please try again.');
    }
  }



  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="craft-modal auth-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeAuthModal} title="Close window">✕</button>

        <div className="auth-header">
          <span className="tag">Handcrafted Community</span>
          <h2>
            {authModalMode === 'register' && 'Join handii.co 🌸'}
            {authModalMode === 'login' && 'Welcome Back ✨'}
            {authModalMode === 'otp-login' && 'Sign In with Email OTP 📩'}
            {authModalMode === 'forgot' && 'Reset Password 🔑'}
          </h2>
          <p className="auth-sub">
            {authModalMode === 'register' && 'Create your account to track orders, save wishlist favorites & get personalized custom quotes.'}
            {authModalMode === 'login' && 'Sign in to access your handmade orders, private custom chats & saved cart.'}
            {authModalMode === 'otp-login' && 'Enter your email to receive a secure 6-digit one-time code.'}
            {authModalMode === 'forgot' && 'Verify your email with an OTP code to set a new password.'}
          </p>
        </div>

        {/* Auth Mode Tabs Switcher */}
        <div className="auth-mode-pills">
          <button
            type="button"
            className={`auth-pill-btn ${authModalMode === 'login' ? 'active' : ''}`}
            onClick={() => setAuthModalMode('login')}
          >
            Password Sign In
          </button>
          <button
            type="button"
            className={`auth-pill-btn ${authModalMode === 'otp-login' ? 'active' : ''}`}
            onClick={() => setAuthModalMode('otp-login')}
          >
            OTP Sign In
          </button>
          <button
            type="button"
            className={`auth-pill-btn ${authModalMode === 'register' ? 'active' : ''}`}
            onClick={() => setAuthModalMode('register')}
          >
            New Account
          </button>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}
        {successMsg && <div className="auth-success-banner">{successMsg}</div>}

        {/* Development preview OTP notification */}
        {otpPreview && (
          <div className="otp-preview-chip">
            <span>✨ OTP Code: <strong>{otpPreview}</strong> (auto-filled for testing)</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Register: Full Name */}
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

          {/* Email Address */}
          <div className="form-group">
            <label>Email Address *</label>
            <div className="input-with-action">
              <input
                type="email"
                placeholder="e.g. name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {(authModalMode === 'otp-login' || authModalMode === 'forgot') && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm otp-send-btn"
                  onClick={() => handleSendOtp(authModalMode === 'forgot' ? 'reset' : 'login')}
                  disabled={otpLoading || resendCountdown > 0}
                >
                  {otpLoading
                    ? 'Sending...'
                    : resendCountdown > 0
                    ? `Resend (${resendCountdown}s)`
                    : otpSent
                    ? 'Resend OTP'
                    : 'Get OTP Code'}
                </button>
              )}
            </div>
          </div>

          {/* OTP Code Input (for OTP Login or Password Reset) */}
          {(authModalMode === 'otp-login' || authModalMode === 'forgot') && otpSent && (
            <div className="form-group animate-fade-in">
              <label>Enter 6-Digit Code *</label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                className="otp-code-input"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
              />
            </div>
          )}

          {/* Register: Phone Number */}
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

          {/* Standard Password Input */}
          {(authModalMode === 'login' || authModalMode === 'register') && (
            <div className="form-group">
              <div className="label-with-link">
                <label>Password *</label>
                {authModalMode === 'login' && (
                  <button
                    type="button"
                    className="forgot-pass-link"
                    onClick={() => setAuthModalMode('forgot')}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          {/* New Password for Reset Mode */}
          {authModalMode === 'forgot' && otpSent && (
            <div className="form-group animate-fade-in">
              <label>Set New Password *</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
            {loading
              ? 'Processing...'
              : authModalMode === 'register'
              ? 'Create My Account 🌸'
              : authModalMode === 'otp-login'
              ? 'Verify & Sign In ✨'
              : authModalMode === 'forgot'
              ? 'Save New Password 🔑'
              : 'Sign In'}
          </button>
        </form>



        <div className="auth-footer-toggle">
          {authModalMode === 'register' ? (
            <p>
              Already part of the family?{' '}
              <button type="button" onClick={() => setAuthModalMode('login')}>
                Sign In
              </button>
            </p>
          ) : authModalMode === 'forgot' ? (
            <p>
              Remember your password?{' '}
              <button type="button" onClick={() => setAuthModalMode('login')}>
                Back to Sign In
              </button>
            </p>
          ) : (
            <p>
              New to handii.co?{' '}
              <button type="button" onClick={() => setAuthModalMode('register')}>
                Create an Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
