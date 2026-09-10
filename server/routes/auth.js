import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db.findOne('users', (u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = db.insert('users', {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : '',
      passwordHash,
      role: 'user',
      addresses: []
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

// Login
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

// Get current logged-in user profile
router.get('/me', authenticateToken, (req, res) => {
  const { passwordHash: _, ...safeUser } = req.user;
  res.json({ success: true, user: safeUser });
});

// Save or update shipping address
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
