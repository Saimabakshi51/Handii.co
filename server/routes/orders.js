import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Place a new order (Guest or Logged-in Customer)
router.post('/', (req, res) => {
  try {
    const {
      userId,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      items,
      paymentMethod,
      couponCode,
      notes
    } = req.body;

    if (!customerName || !customerPhone || !shippingAddress || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, shipping address, and items are required.'
      });
    }

    // Calculate subtotal
    let subtotal = 0;
    items.forEach((item) => {
      const price = parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
      const qty = item.quantity || 1;
      subtotal += price * qty;
    });

    // Check Coupon if provided
    let discountAmount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = db.findOne('coupons', (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive);
      if (coupon && subtotal >= (coupon.minOrderValue || 0)) {
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscountCap && discountAmount > coupon.maxDiscountCap) {
            discountAmount = coupon.maxDiscountCap;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        appliedCoupon = coupon.code;
        // Increment coupon usage
        db.update('coupons', (c) => c.id === coupon.id, { usedCount: (coupon.usedCount || 0) + 1 });
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);
    const orderNumber = 'HND-' + Math.floor(100000 + Math.random() * 900000);

    // Decrement stock for inventory items
    items.forEach((item) => {
      if (item.productId !== undefined) {
        const prod = db.findOne('products', (p) => p.id === item.productId);
        if (prod && prod.stockCount > 0) {
          const newStock = Math.max(0, prod.stockCount - (item.quantity || 1));
          db.update('products', (p) => p.id === prod.id, {
            stockCount: newStock,
            isOutOfStock: newStock === 0,
            isAvailable: newStock > 0
          });
        }
      }
    });

    const newOrder = db.insert('orders', {
      orderNumber,
      userId: userId || null,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : '',
      shippingAddress,
      items,
      subtotal,
      discountAmount,
      couponCode: appliedCoupon,
      totalAmount,
      status: 'pending', // 'pending' -> 'crafting' -> 'shipped' -> 'delivered'
      paymentMethod: paymentMethod || 'whatsapp',
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending_confirmation',
      notes: notes || ''
    });

    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    console.error('[Create Order Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to create order.' });
  }
});

// Get orders for current logged-in customer
router.get('/my', authenticateToken, (req, res) => {
  try {
    const orders = db.find('orders', (o) => o.userId === req.user.id || (o.customerEmail && o.customerEmail.toLowerCase() === req.user.email.toLowerCase()));
    res.json({ success: true, count: orders.length, orders: orders.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch your orders.' });
  }
});

// Admin: Get all orders
router.get('/admin/all', requireAdmin, (req, res) => {
  try {
    const orders = db.find('orders');
    res.json({ success: true, count: orders.length, orders: orders.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch all orders.' });
  }
});

// Admin: Update order status
router.patch('/:id/status', requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, paymentStatus } = req.body;
    const existing = db.findOne('orders', (o) => o.id === id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const updated = db.update('orders', (o) => o.id === id, updates);
    res.json({ success: true, order: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

export default router;
