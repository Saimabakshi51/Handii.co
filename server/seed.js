import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { products as staticProducts } from '../src/data/products.js';
import { reels as staticReels } from '../src/data/reels.js';

export async function seedDatabase() {
  console.log('[Seed] Checking database collections...');

  // 1. Seed Users (Admin & Demo Customer)
  const existingUsers = db.getCollection('users');
  if (existingUsers.length === 0) {
    console.log('[Seed] Seeding initial users...');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const userPasswordHash = await bcrypt.hash('maya123', 10);

    db.insert('users', {
      id: 1,
      name: 'Studio Admin',
      email: 'admin@handii.co',
      phone: '919876543210',
      passwordHash: adminPasswordHash,
      role: 'admin',
      addresses: [
        {
          id: 'addr_admin',
          label: 'Handii Studio',
          street: '42 Craft Lane, Studio 3B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          isDefault: true
        }
      ]
    });

    db.insert('users', {
      id: 2,
      name: 'Maya Sharma',
      email: 'maya@crafts.com',
      phone: '919812345678',
      passwordHash: userPasswordHash,
      role: 'user',
      addresses: [
        {
          id: 'addr_1',
          label: 'Home',
          street: '12 Rosewood Apartments, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          isDefault: true
        }
      ]
    });
  }

  // 2. Seed Products
  const existingProducts = db.getCollection('products');
  if (existingProducts.length === 0) {
    console.log(`[Seed] Seeding ${staticProducts.length} catalog products...`);
    staticProducts.forEach((p, idx) => {
      const numPrice = parseInt(String(p.price).replace(/[^0-9]/g, ''), 10) || 150;
      // Estimated base crafting cost (~45% of price)
      const costPrice = Math.round(numPrice * 0.45);
      const isOut = p.isNotify === true;
      const initialStock = isOut ? 0 : Math.floor(Math.random() * 8) + 4; // 4 to 12 in stock

      db.insert('products', {
        id: p.id !== undefined ? p.id : idx,
        cat: p.cat,
        sub: p.sub,
        img: p.img,
        alt: p.alt || p.title,
        badge: p.badge || null,
        title: p.title,
        price: p.price,
        numericPrice: numPrice,
        costPrice: costPrice,
        stockCount: initialStock,
        isOutOfStock: initialStock === 0,
        colors: p.colors || [],
        isNotify: p.isNotify || false,
        isAvailable: !isOut,
        ratingAvg: (4.6 + (idx % 5) * 0.08).toFixed(1),
        ratingCount: 8 + (idx % 23) * 3
      });
    });
  }

  // 3. Seed Reels
  const existingReels = db.getCollection('reels');
  if (existingReels.length === 0) {
    console.log('[Seed] Seeding reels...');
    staticReels.forEach((reel, idx) => {
      db.insert('reels', {
        id: idx + 1,
        ...reel
      });
    });
  }

  // 4. Seed Coupons
  const existingCoupons = db.getCollection('coupons');
  if (existingCoupons.length === 0) {
    console.log('[Seed] Seeding promo coupon codes...');
    db.insert('coupons', {
      id: 1,
      code: 'WELCOME10',
      description: '10% off on your first handmade order',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 299,
      maxDiscountCap: 150,
      expiryDate: '2027-12-31',
      usageLimit: 1000,
      usedCount: 14,
      isActive: true
    });

    db.insert('coupons', {
      id: 2,
      code: 'HANDMADE50',
      description: 'Flat ₹50 off on orders above ₹499',
      discountType: 'fixed',
      discountValue: 50,
      minOrderValue: 499,
      maxDiscountCap: 50,
      expiryDate: '2027-12-31',
      usageLimit: 500,
      usedCount: 28,
      isActive: true
    });

    db.insert('coupons', {
      id: 3,
      code: 'FESTIVE15',
      description: '15% festive gift discount',
      discountType: 'percentage',
      discountValue: 15,
      minOrderValue: 799,
      maxDiscountCap: 300,
      expiryDate: '2027-12-31',
      usageLimit: 200,
      usedCount: 5,
      isActive: true
    });
  }

  // 5. Seed Combos (Margin Safe)
  const existingCombos = db.getCollection('combos');
  if (existingCombos.length === 0) {
    console.log('[Seed] Seeding curated combo bundles...');
    // Combo 1: Lily Bouquet + Alphabet Keychain
    db.insert('combos', {
      id: 1,
      title: 'Blossom & Charm Gift Duo',
      description: 'Handcrafted Pipe Cleaner Lily Bouquet paired with a Customized Resin Alphabet Keychain.',
      badge: 'Best Value Bundle',
      img: '/images/flowermain.jpeg',
      productIds: [0, 4], // Lily + Plain Lily keychain
      regularPrice: 420,
      comboPrice: 359,
      savingsAmount: 61,
      costTotal: 189,
      profitMarginPercent: 47,
      isActive: true
    });

    // Combo 2: Lavender Stem + Coaster
    db.insert('combos', {
      id: 2,
      title: 'Pastel Desk Aesthetic Set',
      description: 'Soft Pink Lavender stem with a shimmering Resin Botanical Coaster.',
      badge: 'Studio Favorite',
      img: '/images/coastermain.jpeg',
      productIds: [2, 1], // Lavender + Tulip
      regularPrice: 290,
      comboPrice: 249,
      savingsAmount: 41,
      costTotal: 130,
      profitMarginPercent: 47,
      isActive: true
    });
  }

  // 6. Seed Sample Reviews
  const existingReviews = db.getCollection('reviews');
  if (existingReviews.length === 0) {
    console.log('[Seed] Seeding sample customer reviews...');
    db.insert('reviews', {
      id: 1,
      productId: 0,
      userId: 2,
      customerName: 'Maya Sharma',
      rating: 5,
      title: 'Absolutely gorgeous bouquet!',
      comment: 'The petals look so soft and the pipe cleaner craftsmanship is super neat. It adds so much charm to my work desk! 🌸',
      photos: ['/images/purplelavlily.jpeg'],
      isVerifiedBuyer: true,
      likesCount: 12
    });

    db.insert('reviews', {
      id: 2,
      productId: 1,
      userId: 2,
      customerName: 'Aarav Patel',
      rating: 5,
      title: 'Great gift for my partner',
      comment: 'Arrived nicely packaged in bubble wrap and kraft paper. The colors are even brighter in person.',
      photos: [],
      isVerifiedBuyer: true,
      likesCount: 8
    });
  }

  console.log('[Seed] Database initialization complete!');
}
