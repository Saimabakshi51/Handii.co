import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { products as staticProducts } from '../src/data/products.js';
import { ProductModel } from './models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
const DB_FILE = path.join(__dirname, 'data', 'db.json');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/handii_db';

async function restore() {
  await mongoose.connect(MONGO_URI);
  console.log('🌸 Connected to MongoDB');

  const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));

  raw.products.forEach((p) => {
    const orig = staticProducts.find((sp) => sp.id === p.id);
    if (orig && orig.colors && orig.colors.length > 0) {
      p.colors = orig.colors.map((c) => ({
        color: c.color || c.name || c.title || 'Standard',
        title: c.title || c.color || 'Standard',
        style: c.style || (c.hex ? `background:${c.hex}` : 'background:#e3ae49'),
        hex: c.hex || '',
        img: c.img || p.img,
        active: Boolean(c.active)
      }));
    } else if (p.colors && p.colors.length > 0) {
      // Custom added products
      p.colors = p.colors.map((c, i) => ({
        ...c,
        color: c.color || c.title || (i === 0 ? 'Primary' : `Variant ${i + 1}`),
        title: c.title || c.color || (i === 0 ? 'Primary' : `Variant ${i + 1}`),
        style: c.style || (i === 0 ? 'background:#e11d48' : 'background:#ec4899'),
        img: c.img || p.img
      }));
    }
  });

  // Save to db.json
  fs.writeFileSync(DB_FILE, JSON.stringify(raw, null, 2), 'utf-8');
  console.log('✅ Updated db.json with restored colors');

  // Update in MongoDB
  for (const p of raw.products) {
    await ProductModel.updateOne({ id: p.id }, { $set: { colors: p.colors } }, { upsert: true });
  }
  console.log('✅ Updated all products in MongoDB with complete color objects!');

  const checkP0 = await ProductModel.findOne({ id: 0 }).lean();
  console.log('🌸 Sample Product 0 colors in MongoDB:', checkP0.colors);

  const checkP1 = await ProductModel.findOne({ id: 1 }).lean();
  console.log('🌸 Sample Product 1 colors in MongoDB:', checkP1.colors);

  process.exit(0);
}

restore().catch((err) => {
  console.error('❌ Restore error:', err);
  process.exit(1);
});
