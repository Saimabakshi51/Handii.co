import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('handii_token') || null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'otp-login'
  const [loading, setLoading] = useState(true);

  // Validate token and fetch current user profile on load
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('handii_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Error verifying auth token:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const sendOtp = useCallback(async (email, type = 'login') => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type })
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Failed to send OTP. Please check server connectivity.' };
    }
  }, []);

  const verifyOtp = useCallback(async (email, otp, type = 'login') => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, type })
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Failed to verify OTP.' };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, message: data.message || 'Login failed' };
      }
      localStorage.setItem('handii_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthModalOpen(false);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: 'Network error during login' };
    }
  }, []);

  const loginWithOtp = useCallback(async (email, otp) => {
    try {
      const res = await fetch('/api/auth/login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, message: data.message || 'OTP Login failed' };
      }
      localStorage.setItem('handii_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthModalOpen(false);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: 'Network error during OTP login' };
    }
  }, []);

  const resetPasswordWithOtp = useCallback(async (email, otp, newPassword) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Failed to reset password.' };
    }
  }, []);

  const register = useCallback(async (name, email, password, phone, otp) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, otp })
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, message: data.message || 'Registration failed' };
      }
      localStorage.setItem('handii_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthModalOpen(false);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: 'Network error during registration' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('handii_token');
    setToken(null);
    setUser(null);
  }, []);

  const openAuthModal = useCallback((mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        loginWithOtp,
        sendOtp,
        verifyOtp,
        resetPasswordWithOtp,
        register,
        logout,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
