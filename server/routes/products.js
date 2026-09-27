import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET all products with optional query filters (cat, sub, q, inStockOnly)
router.get('/', (req, res) => {
  try {
    const { cat, sub, q, inStockOnly } = req.query;
    let products = db.find('products');

    if (cat && cat !== 'all') {
      products = products.filter((p) => p.cat === cat);
    }
    if (sub && sub !== 'all') {
      products = products.filter((p) => p.sub === sub);
    }
    if (q) {
      const search = q.toLowerCase();
      products = products.filter(
        (p) =>
          p.title?.toLowerCase().includes(search) ||
          p.alt?.toLowerCase().includes(search) ||
          p.sub?.toLowerCase().includes(search)
      );
    }
    if (inStockOnly === 'true') {
      products = products.filter((p) => !p.isOutOfStock && p.stockCount > 0);
    }

    res.json({ success: true, count: products.length, products });
  } catch (err) {
    console.error('[Products GET Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// GET single product by ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = db.findOne('products', (p) => p.id === id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product });
});

// CREATE new product (Admin)
router.post('/', requireAdmin, (req, res) => {
  try {
    const { title, price, costPrice, cat, sub, img, alt, badge, colors, stockCount, isNotify } = req.body;
    if (!title || !price || !cat) {
      return res.status(400).json({ success: false, message: 'Title, price, and category are required' });
    }

    const numPrice = parseInt(String(price).replace(/[^0-9]/g, ''), 10) || 150;
    const stock = stockCount !== undefined ? parseInt(stockCount, 10) : 10;
    const cost = costPrice ? parseInt(costPrice, 10) : Math.round(numPrice * 0.45);

    const newProduct = db.insert('products', {
      title: title.trim(),
      price: String(price).trim(),
      numericPrice: numPrice,
      costPrice: cost,
      cat,
      sub: sub || 'all',
      img: img || '/images/flowermain.jpeg',
      alt: alt || title,
      badge: badge || null,
      colors: Array.isArray(colors) ? colors : [],
      stockCount: stock,
      isOutOfStock: stock === 0,
      isNotify: !!isNotify,
      isAvailable: stock > 0,
      ratingAvg: '5.0',
      ratingCount: 0
    });

    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    console.error('[Product Create Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
});

// UPDATE product (Admin)
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = db.findOne('products', (p) => p.id === id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updates = { ...req.body };
    if (updates.price) {
      updates.numericPrice = parseInt(String(updates.price).replace(/[^0-9]/g, ''), 10) || existing.numericPrice;
    }
    if (updates.stockCount !== undefined) {
      updates.stockCount = parseInt(updates.stockCount, 10);
      updates.isOutOfStock = updates.stockCount === 0;
      updates.isAvailable = updates.stockCount > 0;
    }

    const updatedProduct = db.update('products', (p) => p.id === id, updates);
    res.json({ success: true, product: updatedProduct });
  } catch (err) {
    console.error('[Product Update Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

// QUICK STOCK TOGGLE / UPDATE (Admin)
router.patch('/:id/stock', requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { stockCount, isOutOfStock } = req.body;
    const existing = db.findOne('products', (p) => p.id === id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const newStock = stockCount !== undefined ? parseInt(stockCount, 10) : (isOutOfStock ? 0 : 10);
    const outOfStockBool = isOutOfStock !== undefined ? isOutOfStock : newStock === 0;

    const updated = db.update('products', (p) => p.id === id, {
      stockCount: newStock,
      isOutOfStock: outOfStockBool,
      isAvailable: !outOfStockBool
    });

    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update product stock' });
  }
});

// DELETE product (Admin)
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = db.delete('products', (p) => p.id === id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

export default router;
