import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET all reels
router.get('/', (req, res) => {
  try {
    const reels = db.find('reels');
    res.json({ success: true, count: reels.length, reels });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reels' });
  }
});

// Update reels (Admin)
router.put('/', requireAdmin, (req, res) => {
  try {
    const { reels } = req.body;
    if (!Array.isArray(reels)) {
      return res.status(400).json({ success: false, message: 'Array of reels required' });
    }

    db.data.reels = reels;
    db.save();
    res.json({ success: true, reels: db.data.reels });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update reels' });
  }
});

export default router;
