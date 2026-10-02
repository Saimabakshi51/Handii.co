import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { models } from './models/index.js';
import { products as staticProducts } from '../src/data/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'db.json');

dotenv.config({ path: path.join(__dirname, '../.env') });
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/handii_db';

async function restoreFull() {
  console.log(`🌸 Connecting to MongoDB: ${MONGO_URI}...`);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB.');

  // 1. Read clean original data from git
  console.log('📖 Reading original full database from git history...');
  const gitRaw = execSync('git show HEAD:server/data/db.json', { maxBuffer: 15 * 1024 * 1024 }).toString();
  const gitDb = JSON.parse(gitRaw);

  // 2. Read existing db.json to preserve any newly added items (like subscribers or custom products)
  let currentDb = {};
  if (fs.existsSync(DB_FILE)) {
    try {
      currentDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (e) {
      console.warn('Could not parse existing db.json');
    }
  }

  // Preserve subscribers
  const mergedSubscribers = [...(gitDb.subscribers || [])];
  if (currentDb.subscribers) {
    currentDb.subscribers.forEach((s) => {
      if (!mergedSubscribers.some((ms) => ms.email?.toLowerCase() === s.email?.toLowerCase())) {
        mergedSubscribers.push(s);
      }
    });
  }

  // Preserve custom products (id >= 73)
  const fullProducts = (gitDb.products || []).map((p) => {
    const orig = staticProducts.find((sp) => sp.id === p.id);
    if (orig && orig.colors && orig.colors.length > 0) {
      return {
        ...p,
        colors: orig.colors.map((c) => ({
          color: c.color || c.name || c.title || 'Standard',
          title: c.title || c.color || 'Standard',
          style: c.style || (c.hex ? `background:${c.hex}` : 'background:#e3ae49'),
          hex: c.hex || '',
          img: c.img || p.img,
          active: Boolean(c.active)
        }))
      };
    }
    return p;
  });

  if (currentDb.products) {
    currentDb.products.forEach((cp) => {
      if (cp.id >= 73 && !fullProducts.some((fp) => fp.id === cp.id)) {
        fullProducts.push(cp);
      }
    });
  }

  const restoredDb = {
    users: gitDb.users || [],
    products: fullProducts,
    orders: gitDb.orders || [],
    customOrders: gitDb.customOrders || [],
    customMessages: gitDb.customMessages || [],
    combos: gitDb.combos || [],
    coupons: gitDb.coupons || [],
    reviews: gitDb.reviews || [],
    reels: gitDb.reels || [],
    subscribers: mergedSubscribers,
    settings: gitDb.settings || currentDb.settings || {}
  };

  // 3. Write clean restored db.json
  fs.writeFileSync(DB_FILE, JSON.stringify(restoredDb, null, 2), 'utf-8');
  console.log('✅ Restored server/data/db.json with full fields.');

  // 4. Clean and re-sync all collections in MongoDB
  for (const [key, Model] of Object.entries(models)) {
    if (key === 'settings') {
      await Model.deleteMany({});
      for (const [sKey, sVal] of Object.entries(restoredDb.settings)) {
        await Model.create({ key: sKey, value: sVal });
      }
      console.log(`  ✓ Synced settings in MongoDB.`);
      continue;
    }

    const items = restoredDb[key] || [];
    await Model.deleteMany({});
    if (items.length > 0) {
      await Model.insertMany(items);
      console.log(`  ✓ Synced '${key}' in MongoDB (${items.length} documents with full schemas).`);
    }
  }

  console.log('🎉 Full database restoration complete! MongoDB and db.json are 100% in sync.');
  process.exit(0);
}

restoreFull().catch((err) => {
  console.error('❌ Restore error:', err);
  process.exit(1);
});
