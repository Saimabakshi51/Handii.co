import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';

const router = Router();

// In-memory OTP storage with timestamp expiry (10 minutes)
const otpStore = new Map(); // key: `${email.toLowerCase()}_${type}`, val: { code, expiresAt }

function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 1. Send Email OTP (for Register, Login, or Password Reset)
router.post('/send-otp', async (req, res) => {
  try {
    const { email, type = 'login' } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db.findOne('users', (u) => u.email.toLowerCase() === normalizedEmail);

    if (type === 'register' && existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email is already registered. Please sign in.'
      });
    }

    if ((type === 'login' || type === 'reset') && !existing) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with this email address.'
      });
    }

    const otpCode = generateOtpCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(`${normalizedEmail}_${type}`, { code: otpCode, expiresAt });

    console.log(`\n========================================`);
    console.log(`🌸 [Handii Studio Auth OTP]`);
    console.log(`📩 Recipient: ${normalizedEmail}`);
    console.log(`🔑 Action: ${type.toUpperCase()}`);
    console.log(`✨ Verification Code: >>> ${otpCode} <<<`);
    console.log(`⏰ Expires In: 10 minutes`);
    console.log(`========================================\n`);

    res.json({
      success: true,
      message: `A 6-digit verification code has been generated for ${normalizedEmail}.`,
      previewCode: otpCode // Provided in response for easy local testing & demo
    });
  } catch (err) {
    console.error('[Send OTP Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to generate verification OTP.' });
  }
});

// 2. Verify OTP check
router.post('/verify-otp', (req, res) => {
  try {
    const { email, otp, type = 'login' } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const record = otpStore.get(`${normalizedEmail}_${type}`);

    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP requested or code has expired. Please request a new one.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(`${normalizedEmail}_${type}`);
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    if (record.code !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect verification code. Please check and try again.' });
    }

    res.json({ success: true, message: 'OTP verified successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to verify OTP.' });
  }
});

// 3. Login with OTP (Passwordless)
router.post('/login-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const record = otpStore.get(`${normalizedEmail}_login`);

    if (!record || Date.now() > record.expiresAt || record.code !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    // Clear used OTP
    otpStore.delete(`${normalizedEmail}_login`);

    const user = db.findOne('users', (u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser, token });
  } catch (err) {
    console.error('[Login OTP Error]:', err);
    res.status(500).json({ success: false, message: 'OTP login failed.' });
  }
});

// 4. Reset Password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const record = otpStore.get(`${normalizedEmail}_reset`);

    if (!record || Date.now() > record.expiresAt || record.code !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    otpStore.delete(`${normalizedEmail}_reset`);

    const user = db.findOne('users', (u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    db.update('users', (u) => u.id === user.id, { passwordHash: newHash });

    res.json({ success: true, message: 'Password reset successfully. You can now sign in with your new password!' });
  } catch (err) {
    console.error('[Reset Password Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
});

// 5. Standard Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, otp } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db.findOne('users', (u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // If OTP was sent for registration verification, check it
    if (otp) {
      const record = otpStore.get(`${normalizedEmail}_register`);
      if (!record || Date.now() > record.expiresAt || record.code !== otp.trim()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired email verification OTP.' });
      }
      otpStore.delete(`${normalizedEmail}_register`);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = db.insert('users', {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : '',
      passwordHash,
      role: 'user',
      addresses: [],
      savedCart: [],
      savedWishlist: []
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const { passwordHash: _, ...safeUser } = newUser;
    res.json({ success: true, user: safeUser, token });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    res.status(500).json({ success: false, message: 'Registration failed.' });
  }
});

// 6. Standard Password Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.findOne('users', (u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser, token });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
});

// 7. Get current logged-in user profile
router.get('/me', authenticateToken, (req, res) => {
  const { passwordHash: _, ...safeUser } = req.user;
  res.json({ success: true, user: safeUser });
});

// 8. User Cart Sync (Persist cart in user profile)
router.post('/sync-cart', authenticateToken, (req, res) => {
  try {
    const { cart } = req.body;
    db.update('users', (u) => u.id === req.user.id, { savedCart: Array.isArray(cart) ? cart : [] });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// 9. User Wishlist Sync (Persist wishlist in user profile)
router.post('/sync-wishlist', authenticateToken, (req, res) => {
  try {
    const { wishlist } = req.body;
    db.update('users', (u) => u.id === req.user.id, { savedWishlist: Array.isArray(wishlist) ? wishlist : [] });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// 10. Save or update shipping address
router.post('/address', authenticateToken, (req, res) => {
  try {
    const { label, street, city, state, pincode, isDefault } = req.body;
    if (!street || !city || !pincode) {
      return res.status(400).json({ success: false, message: 'Street, city, and pincode are required.' });
    }

    const addresses = req.user.addresses || [];
    const newAddr = {
      id: 'addr_' + Date.now(),
      label: label || 'Delivery Address',
      street,
      city,
      state: state || '',
      pincode,
      isDefault: isDefault ?? (addresses.length === 0)
    };

    if (newAddr.isDefault) {
      addresses.forEach((a) => (a.isDefault = false));
    }
    addresses.push(newAddr);

    const updated = db.update('users', (u) => u.id === req.user.id, { addresses });
    const { passwordHash: _, ...safeUser } = updated;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update address.' });
  }
});

export default router;
