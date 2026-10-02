import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { models } from './models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'db.json');

dotenv.config({ path: path.join(__dirname, '../.env') });

const targetUri = process.argv[2] || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/handii_db';

export async function runMigration(uri = targetUri) {
  console.log(`🌸 Connecting to MongoDB at: ${uri}...`);
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB successfully!');

  if (!fs.existsSync(DB_FILE)) {
    console.warn(`⚠️ db.json not found at ${DB_FILE}`);
    return;
  }

  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  const data = JSON.parse(raw);

  console.log('📦 Starting data migration from db.json to MongoDB...');

  // Helper for collections with standard documents
  for (const [key, Model] of Object.entries(models)) {
    if (key === 'settings') {
      if (data.settings) {
        for (const [sKey, sVal] of Object.entries(data.settings)) {
          await Model.updateOne({ key: sKey }, { key: sKey, value: sVal }, { upsert: true });
        }
        console.log(`  ✓ Settings synced.`);
      }
      continue;
    }

    const items = data[key] || [];
    if (items.length === 0) continue;

    let inserted = 0;
    for (const item of items) {
      const query = item.id !== undefined ? { id: item.id } : { email: item.email };
      // Upsert document to prevent duplicate key errors while updating any edits
      await Model.updateOne(query, { $set: item }, { upsert: true });
      inserted++;
    }
    console.log(`  ✓ Collection '${key}': ${inserted} documents synced to MongoDB.`);
  }

  console.log('🎉 All collections successfully ported to MongoDB (handii_db)!');
}

// Allow direct execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigration()
    .then(() => {
      console.log('🌸 Migration complete. Closing connection.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Migration error:', err);
      process.exit(1);
    });
}
