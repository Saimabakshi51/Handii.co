import { Router } from 'express';
import { db } from '../db.js';
import { sendWelcomeEmail } from '../services/mailer.js';

const router = Router();

// Email format regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/newsletter/subscribe
router.post('/subscribe', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !EMAIL_REGEX.test(String(email).trim().toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address (e.g. name@example.com)'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = db.findOne('subscribers', (s) => s.email.toLowerCase() === cleanEmail);

    if (existing) {
      // Re-send the welcome voucher so testing or re-requesting always works!
      sendWelcomeEmail(cleanEmail).catch((err) => console.warn('[Newsletter Welcome Email Warn]:', err));
      return res.json({
        success: true,
        alreadySubscribed: true,
        message: "✨ You're already on our VIP list! We just re-sent your 10% welcome voucher to your inbox 🌸"
      });
    }

    const newSubscriber = db.insert('subscribers', {
      email: cleanEmail,
      subscribedAt: new Date().toISOString(),
      isActive: true
    });

    // Send automated handcrafted welcome email asynchronously
    sendWelcomeEmail(cleanEmail).catch((err) => console.warn('[Newsletter Welcome Email Warn]:', err));

    res.json({
      success: true,
      alreadySubscribed: false,
      subscriber: newSubscriber,
      message: "✨ Welcome to the handii.co family! You'll be the first to know about new craft drops."
    });
  } catch (err) {
    console.error('[Newsletter Subscribe Error]:', err);
    res.status(500).json({ success: false, message: 'Server error processing subscription' });
  }
});

// GET /api/newsletter/subscribers (Admin list)
router.get('/subscribers', (req, res) => {
  try {
    const subscribers = db.getCollection('subscribers') || [];
    // Sort newest first
    const sorted = [...subscribers].sort((a, b) => new Date(b.subscribedAt || b.createdAt) - new Date(a.subscribedAt || a.createdAt));
    res.json({
      success: true,
      subscribers: sorted,
      totalCount: sorted.length
    });
  } catch (err) {
    console.error('[Newsletter Get Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch subscribers' });
  }
});

// DELETE /api/newsletter/subscribers/:id
router.delete('/subscribers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.delete('subscribers', (s) => String(s.id) === String(id));
    res.json({ success: deleted });
  } catch (err) {
    console.error('[Newsletter Delete Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to delete subscriber' });
  }
});

export default router;
