import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET eligible coupons for current customer/guest
router.get('/eligible', (req, res) => {
  try {
    const { userId, email } = req.query;
    const allCoupons = db.find('coupons', (c) => c.isActive !== false);

    const eligible = allCoupons.map((coupon) => {
      const usedList = Array.isArray(coupon.usedByUsers) ? coupon.usedByUsers : [];
      const alreadyUsed =
        (userId && usedList.includes(Number(userId))) ||
        (email && usedList.includes(email.toLowerCase().trim()));

      return {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue || 0,
        maxDiscountCap: coupon.maxDiscountCap || null,
        isAlreadyUsed: !!alreadyUsed,
        isWelcomeCoupon: coupon.code.toUpperCase().includes('WELCOME') || coupon.code.toUpperCase().includes('FIRST')
      };
    });

    res.json({ success: true, coupons: eligible });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch eligible coupons' });
  }
});

// Validate a coupon code against a cart
router.post('/validate', (req, res) => {
  try {
    const { code, subtotal, eligibleSubtotal, userId, userEmail, hasOnlyCombos } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = db.findOne('coupons', (c) => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    // Restriction 1: Combos cannot use promo coupons
    if (hasOnlyCombos || (eligibleSubtotal !== undefined && eligibleSubtotal <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Promo coupons cannot be applied to curated Studio Combos (they are already heavily discounted).'
      });
    }

    // Restriction 2: Check if this user has already used this coupon
    const usedList = Array.isArray(coupon.usedByUsers) ? coupon.usedByUsers : [];
    const isUsed =
      (userId && usedList.includes(Number(userId))) ||
      (userEmail && usedList.includes(userEmail.toLowerCase().trim()));

    if (isUsed) {
      return res.status(400).json({
        success: false,
        message: `You have already redeemed coupon ${coupon.code}. Coupons can only be used once per customer.`
      });
    }

    const validSubtotal = eligibleSubtotal !== undefined ? parseInt(eligibleSubtotal, 10) : parseInt(subtotal, 10) || 0;
    const totalSub = parseInt(subtotal, 10) || 0;

    if (coupon.minOrderValue && totalSub < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum cart value of ₹${coupon.minOrderValue}.`
      });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon code has expired.' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'This coupon has reached its total usage limit.' });
    }

    // Calculate discount amount solely on non-combo eligible portion
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((validSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountCap && discountAmount > coupon.maxDiscountCap) {
        discountAmount = coupon.maxDiscountCap;
      }
    } else {
      discountAmount = Math.min(validSubtotal, coupon.discountValue);
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
        finalTotal: Math.max(0, totalSub - discountAmount)
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
      usedByUsers: [],
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
