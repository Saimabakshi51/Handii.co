import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Validate a coupon code against a cart subtotal
router.post('/validate', (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = db.findOne('coupons', (c) => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    const cartSub = parseInt(subtotal, 10) || 0;
    if (coupon.minOrderValue && cartSub < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum cart value of ₹${coupon.minOrderValue}.`
      });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon code has expired.' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit.' });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((cartSub * coupon.discountValue) / 100);
      if (coupon.maxDiscountCap && discountAmount > coupon.maxDiscountCap) {
        discountAmount = coupon.maxDiscountCap;
      }
    } else {
      discountAmount = Math.min(cartSub, coupon.discountValue);
    }

    res.json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
        discountAmount,
        finalTotal: Math.max(0, cartSub - discountAmount)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Coupon validation error' });
  }
});

// Admin: Get all coupons
router.get('/', requireAdmin, (req, res) => {
  try {
    const coupons = db.find('coupons');
    res.json({ success: true, count: coupons.length, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
});

// Admin: Create coupon
router.post('/', requireAdmin, (req, res) => {
  try {
    const { code, description, discountType, discountValue, minOrderValue, maxDiscountCap, expiryDate, usageLimit } = req.body;
    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ success: false, message: 'Code, discount type, and value required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = db.findOne('coupons', (c) => c.code.toUpperCase() === cleanCode);
    if (existing) {
      return res.status(400).json({ success: false, message: 'A coupon with this code already exists' });
    }

    const newCoupon = db.insert('coupons', {
      code: cleanCode,
      description: description || '',
      discountType, // 'percentage' | 'fixed'
      discountValue: parseInt(discountValue, 10),
      minOrderValue: minOrderValue ? parseInt(minOrderValue, 10) : 0,
      maxDiscountCap: maxDiscountCap ? parseInt(maxDiscountCap, 10) : null,
      expiryDate: expiryDate || '2027-12-31',
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : 1000,
      usedCount: 0,
      isActive: true
    });

    res.status(201).json({ success: true, coupon: newCoupon });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create coupon' });
  }
});

// Admin: Delete coupon
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = db.delete('coupons', (c) => c.id === id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete coupon' });
  }
});

export default router;
