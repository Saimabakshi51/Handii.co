import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET all active combos for storefront
router.get('/', (req, res) => {
  try {
    const combos = db.find('combos', (c) => c.isActive !== false);
    // Enrich with product details
    const allProducts = db.find('products');
    const enriched = combos.map((combo) => {
      const items = (combo.productIds || []).map((id) => allProducts.find((p) => p.id === id)).filter(Boolean);
      return { ...combo, items };
    });
    res.json({ success: true, count: enriched.length, combos: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch combos' });
  }
});

// Calculate margin & safety for a combo (Admin Preview & Helper)
router.post('/calculate-margin', requireAdmin, (req, res) => {
  try {
    const { productIds, proposedComboPrice } = req.body;
    if (!productIds || !productIds.length) {
      return res.status(400).json({ success: false, message: 'Product IDs required' });
    }

    const allProducts = db.find('products');
    const selectedProducts = productIds.map((id) => allProducts.find((p) => p.id === id)).filter(Boolean);

    let totalRetail = 0;
    let totalCost = 0;

    selectedProducts.forEach((p) => {
      const price = p.numericPrice || parseInt(String(p.price).replace(/[^0-9]/g, ''), 10) || 150;
      const cost = p.costPrice || Math.round(price * 0.45);
      totalRetail += price;
      totalCost += cost;
    });

    const minMarginThreshold = 0.25; // 25% minimum margin safeguard
    const minSafePrice = Math.round(totalCost * (1 + minMarginThreshold));
    const comboPrice = proposedComboPrice ? parseInt(proposedComboPrice, 10) : Math.round(totalRetail * 0.85);

    const isProfitable = comboPrice >= minSafePrice;
    const profitAmount = comboPrice - totalCost;
    const profitMarginPercent = Math.round((profitAmount / comboPrice) * 100);
    const savingsAmount = totalRetail - comboPrice;
    const discountPercent = Math.round((savingsAmount / totalRetail) * 100);

    res.json({
      success: true,
      totalRetail,
      totalCost,
      minSafePrice,
      comboPrice,
      savingsAmount,
      discountPercent,
      profitAmount,
      profitMarginPercent,
      isProfitable,
      warning: !isProfitable
        ? `Warning: The combo price ₹${comboPrice} falls below the safe minimum margin (₹${minSafePrice}). It may cause a financial loss.`
        : null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Calculation failed' });
  }
});

// CREATE combo (Admin)
router.post('/', requireAdmin, (req, res) => {
  try {
    const { title, description, badge, img, productIds, comboPrice, forceBypassGuard } = req.body;
    if (!title || !productIds || !productIds.length || !comboPrice) {
      return res.status(400).json({ success: false, message: 'Title, products, and combo price required' });
    }

    const allProducts = db.find('products');
    const selectedProducts = productIds.map((id) => allProducts.find((p) => p.id === id)).filter(Boolean);

    let totalRetail = 0;
    let totalCost = 0;

    selectedProducts.forEach((p) => {
      const price = p.numericPrice || parseInt(String(p.price).replace(/[^0-9]/g, ''), 10) || 150;
      const cost = p.costPrice || Math.round(price * 0.45);
      totalRetail += price;
      totalCost += cost;
    });

    const minMarginThreshold = 0.25;
    const minSafePrice = Math.round(totalCost * (1 + minMarginThreshold));
    const priceNum = parseInt(comboPrice, 10);

    // Safeguard: Check if this discount causes a loss
    if (priceNum < minSafePrice && !forceBypassGuard) {
      return res.status(400).json({
        success: false,
        error: 'MARGIN_GUARD_TRIGGERED',
        minSafePrice,
        message: `Loss Prevention Guard: Setting combo price to ₹${priceNum} drops below the minimum safe threshold (₹${minSafePrice}). Minimum safe profit margin is 25%.`
      });
    }

    const savingsAmount = Math.max(0, totalRetail - priceNum);
    const profitAmount = priceNum - totalCost;
    const profitMarginPercent = Math.round((profitAmount / priceNum) * 100);

    const newCombo = db.insert('combos', {
      title: title.trim(),
      description: description || '',
      badge: badge || 'Special Combo Bundle',
      img: img || selectedProducts[0]?.img || '/images/flowermain.jpeg',
      productIds,
      regularPrice: totalRetail,
      comboPrice: priceNum,
      savingsAmount,
      costTotal: totalCost,
      profitMarginPercent,
      isActive: true
    });

    res.status(201).json({ success: true, combo: newCombo });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create combo' });
  }
});

// DELETE combo (Admin)
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = db.delete('combos', (c) => c.id === id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Combo not found' });
    res.json({ success: true, message: 'Combo deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete combo' });
  }
});

export default router;
