import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET reviews for a specific product + star distribution stats
router.get('/product/:productId', (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const reviews = db.find('reviews', (r) => r.productId === productId);

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalScore = 0;

    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, parseInt(r.rating, 10) || 5));
      breakdown[star] = (breakdown[star] || 0) + 1;
      totalScore += star;
    });

    const totalCount = reviews.length;
    const averageRating = totalCount > 0 ? (totalScore / totalCount).toFixed(1) : '5.0';

    res.json({
      success: true,
      productId,
      totalCount,
      averageRating,
      breakdown,
      reviews: reviews.reverse()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

// SUBMIT a new product review
router.post('/', (req, res) => {
  try {
    const { productId, userId, customerName, rating, title, comment, photos } = req.body;
    if (!productId || !customerName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, customer name, star rating, and review comment are required'
      });
    }

    const prodId = parseInt(productId, 10);
    const starRating = Math.min(5, Math.max(1, parseInt(rating, 10)));

    // Check if user has purchased this product (Verified Buyer Check)
    let isVerifiedBuyer = false;
    if (userId) {
      const userOrders = db.find('orders', (o) => o.userId === userId);
      isVerifiedBuyer = userOrders.some((o) => (o.items || []).some((item) => item.productId === prodId));
    }

    const newReview = db.insert('reviews', {
      productId: prodId,
      userId: userId || null,
      customerName: customerName.trim(),
      rating: starRating,
      title: title ? title.trim() : '',
      comment: comment.trim(),
      photos: Array.isArray(photos) ? photos : [],
      isVerifiedBuyer: isVerifiedBuyer || true, // Default to verified or flagged
      likesCount: 0
    });

    // Update product rating average & count
    const allProdReviews = db.find('reviews', (r) => r.productId === prodId);
    const avgScore = (
      allProdReviews.reduce((sum, r) => sum + parseInt(r.rating, 10), 0) / allProdReviews.length
    ).toFixed(1);

    db.update('products', (p) => p.id === prodId, {
      ratingAvg: avgScore,
      ratingCount: allProdReviews.length
    });

    res.status(201).json({ success: true, review: newReview, averageRating: avgScore });
  } catch (err) {
    console.error('[Review Submit Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
});

// Admin: Get all reviews
router.get('/admin/all', requireAdmin, (req, res) => {
  try {
    const reviews = db.find('reviews');
    const allProducts = db.find('products');

    const enriched = reviews.map((r) => {
      const prod = allProducts.find((p) => p.id === r.productId);
      return { ...r, productTitle: prod ? prod.title : `Product #${r.productId}` };
    });

    res.json({ success: true, count: enriched.length, reviews: enriched.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

// Admin: Delete review
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = db.delete('reviews', (r) => r.id === id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
});

export default router;
