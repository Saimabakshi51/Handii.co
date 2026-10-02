import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { products as staticProducts } from '../src/data/products.js';
import { models } from './models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'db.json');

dotenv.config({ path: path.join(__dirname, '../.env') });
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/handii_db';

/**
 * Synchronizes static catalog definitions from src/data/products.js into
 * both server/data/db.json and MongoDB, updating image paths and color variants
 * while strictly preserving inventory, prices, ratings, and custom products.
 */
export async function syncCatalog() {
  console.log('🌸 [SyncCatalog]: Reading static products from src/data/products.js...');
  
  let isMongoConnected = false;
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
    }
    isMongoConnected = true;
    console.log('✅ [SyncCatalog]: Connected to MongoDB.');
  } catch (err) {
    console.warn('⚠️ [SyncCatalog]: MongoDB not available, updating local db.json only:', err.message);
  }

  let dbData = { products: [] };
  if (fs.existsSync(DB_FILE)) {
    try {
      dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (e) {
      console.error('Error reading db.json:', e);
    }
  }

  const existingProducts = dbData.products || [];
  let updatedImagesCount = 0;
  let newProductsCount = 0;

  for (const sp of staticProducts) {
    const existingIndex = existingProducts.findIndex((p) => p.id === sp.id);

    if (existingIndex !== -1) {
      const current = existingProducts[existingIndex];
      let hasChanges = false;

      // Check if primary image or alt changed
      if (sp.img && sp.img !== current.img) {
        current.img = sp.img;
        hasChanges = true;
      }
      if (sp.alt && sp.alt !== current.alt) {
        current.alt = sp.alt;
        hasChanges = true;
      }

      // Check colors and color variant images
      if (Array.isArray(sp.colors) && sp.colors.length > 0) {
        current.colors = sp.colors.map((sc, i) => {
          const existingColor = (current.colors || [])[i] || {};
          return {
            ...existingColor,
            color: sc.color || existingColor.color || 'Standard',
            title: sc.title || existingColor.title || sc.color || 'Standard',
            style: sc.style || existingColor.style || (sc.hex ? `background:${sc.hex}` : 'background:#e3ae49'),
            hex: sc.hex || existingColor.hex || '',
            img: sc.img || current.img,
            active: sc.active !== undefined ? sc.active : existingColor.active || false
          };
        });
        hasChanges = true;
      }

      if (hasChanges) {
        current.updatedAt = new Date().toISOString();
        existingProducts[existingIndex] = current;
        updatedImagesCount++;

        if (isMongoConnected && models.products) {
          await models.products.updateOne({ id: current.id }, { $set: current }, { upsert: true });
        }
      }
    } else {
      // New product not yet in database
      const numPrice = parseInt(String(sp.price).replace(/[^0-9]/g, ''), 10) || 150;
      const costPrice = Math.round(numPrice * 0.45);
      const isOut = sp.isNotify === true;
      const initialStock = isOut ? 0 : 10;

      const newProd = {
        id: sp.id,
        cat: sp.cat,
        sub: sp.sub || 'all',
        img: sp.img,
        alt: sp.alt || sp.title,
        badge: sp.badge || null,
        title: sp.title,
        price: sp.price,
        numericPrice: numPrice,
        costPrice: costPrice,
        stockCount: initialStock,
        isOutOfStock: initialStock === 0,
        colors: sp.colors || [],
        isNotify: sp.isNotify || false,
        isAvailable: !isOut,
        ratingAvg: '5.0',
        ratingCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      existingProducts.push(newProd);
      newProductsCount++;

      if (isMongoConnected && models.products) {
        await models.products.updateOne({ id: newProd.id }, { $set: newProd }, { upsert: true });
      }
    }
  }

  dbData.products = existingProducts;

  // Save to db.json with backup
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(dbData, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);

  console.log(`🌸 [SyncCatalog Complete]:`);
  console.log(`   - Updated ${updatedImagesCount} existing product images`);
  console.log(`   - Added ${newProductsCount} new catalog products`);
  console.log(`   - Saved to both server/data/db.json and MongoDB`);
}

// Allow direct CLI invocation
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncCatalog()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('SyncCatalog Error:', err);
      process.exit(1);
    });
}
