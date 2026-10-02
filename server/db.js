import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { models } from './models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

dotenv.config({ path: path.join(__dirname, '../.env') });

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Structure
const initialData = {
  users: [],
  products: [],
  orders: [],
  customOrders: [],
  customMessages: [],
  combos: [],
  coupons: [],
  reviews: [],
  reels: [],
  subscribers: [],
  settings: {
    minMarginThreshold: 0.25, // 25% minimum profit margin safeguard for combos
    currency: 'INR',
    currencySymbol: '₹',
    shopName: 'handii.co',
    phone: ''
  }
};

class MongoSyncedDatabase {
  constructor() {
    this.data = initialData;
    this.isMongoConnected = false;
    this.loadLocal();
  }

  loadLocal() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = { ...initialData, ...JSON.parse(raw) };
      } else {
        this.saveLocal();
      }
    } catch (err) {
      console.error('[DB] Error loading db.json, using initial structure:', err);
      this.data = initialData;
      this.saveLocal();
    }
  }

  saveLocal() {
    try {
      const tmpFile = `${DB_FILE}.tmp`;
      const backupFile = path.join(DATA_DIR, 'db.backup.json');
      if (fs.existsSync(DB_FILE)) {
        try {
          fs.copyFileSync(DB_FILE, backupFile);
        } catch (_) {}
      }
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('[DB] Error saving db.json:', err);
    }
  }

  /**
   * Initializes MongoDB connection and synchronizes collections with MongoDB.
   * Performs smart reconciliation so local edits are preserved and synced to MongoDB,
   * while MongoDB additions are merged into local storage.
   */
  async initMongo() {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/handii_db';
    try {
      if (mongoose.connection.readyState === 0) {
        console.log(`🌸 Connecting to MongoDB: ${mongoUri}...`);
        await mongoose.connect(mongoUri);
      }
      this.isMongoConnected = true;
      console.log('✅ [MongoDB]: Connected successfully to handii_db!');

      // Synchronize collections between local db.json and MongoDB
      for (const [key, Model] of Object.entries(models)) {
        if (key === 'settings') {
          const settingsDocs = await Model.find({});
          if (settingsDocs.length > 0) {
            settingsDocs.forEach((doc) => {
              this.data.settings[doc.key] = doc.value;
            });
          } else if (this.data.settings) {
            for (const [sKey, sVal] of Object.entries(this.data.settings)) {
              await Model.updateOne({ key: sKey }, { key: sKey, value: sVal }, { upsert: true });
            }
          }
          continue;
        }

        const count = await Model.countDocuments();
        const localList = Array.isArray(this.data[key]) ? this.data[key] : [];

        if (count === 0 && localList.length > 0) {
          // If MongoDB collection is empty, populate MongoDB from local db.json
          for (const item of localList) {
            const q = item.id !== undefined ? { id: item.id } : { email: item.email };
            await Model.updateOne(q, { $set: item }, { upsert: true });
          }
        } else if (count > 0) {
          const docs = await Model.find({}).lean();
          const mongoDocs = docs.map((d) => {
            const { _id, __v, ...rest } = d;
            return rest;
          });

          const mongoMap = new Map();
          mongoDocs.forEach((d) => {
            const idVal = d.id !== undefined ? String(d.id) : (d.email || d.code || d.key);
            if (idVal !== undefined) mongoMap.set(String(idVal), d);
          });

          const mergedList = [];
          const processedIds = new Set();

          // 1. Reconcile local items against MongoDB
          for (const localItem of localList) {
            const idVal = localItem.id !== undefined ? String(localItem.id) : (localItem.email || localItem.code || localItem.key);
            if (idVal !== undefined) processedIds.add(String(idVal));

            const mongoDoc = idVal !== undefined ? mongoMap.get(String(idVal)) : null;
            if (!mongoDoc) {
              // Item exists locally but not in MongoDB -> Push to MongoDB!
              const q = localItem.id !== undefined ? { id: localItem.id } : { email: localItem.email };
              await Model.updateOne(q, { $set: localItem }, { upsert: true });
              mergedList.push(localItem);
            } else {
              // Item exists in both: compare timestamps and content
              const localTime = new Date(localItem.updatedAt || localItem.createdAt || 0).getTime();
              const mongoTime = new Date(mongoDoc.updatedAt || mongoDoc.createdAt || 0).getTime();

              const fieldsMatch = JSON.stringify(localItem) === JSON.stringify(mongoDoc);

              if (localTime > mongoTime || (!fieldsMatch && localTime >= mongoTime)) {
                // Local item was updated more recently or manually edited on disk: keep local and sync to MongoDB!
                localItem.updatedAt = localItem.updatedAt || new Date().toISOString();
                const q = localItem.id !== undefined ? { id: localItem.id } : { email: localItem.email };
                await Model.updateOne(q, { $set: localItem }, { upsert: true });
                mergedList.push(localItem);
              } else {
                // MongoDB document is newer or equal: use MongoDB
                mergedList.push(mongoDoc);
              }
            }
          }

          // 2. Add any documents in MongoDB that weren't in local db.json
          for (const mongoDoc of mongoDocs) {
            const idVal = mongoDoc.id !== undefined ? String(mongoDoc.id) : (mongoDoc.email || mongoDoc.code || mongoDoc.key);
            if (idVal !== undefined && !processedIds.has(String(idVal))) {
              mergedList.push(mongoDoc);
            }
          }

          this.data[key] = mergedList;
        }
      }

      this.saveLocal();
      console.log('🌸 [MongoDB]: All collections synchronized live in memory & MongoDB.');
    } catch (err) {
      console.error('⚠️ [MongoDB Warning]: Could not connect to MongoDB, falling back to local storage:', err.message);
      this.isMongoConnected = false;
    }
  }

  // Generic collection helpers
  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
      this.saveLocal();
    }
    return this.data[name];
  }

  find(collectionName, predicate = () => true) {
    const col = this.getCollection(collectionName);
    return col.filter(predicate);
  }

  findOne(collectionName, predicate) {
    const col = this.getCollection(collectionName);
    return col.find(predicate) || null;
  }

  insert(collectionName, item) {
    const col = this.getCollection(collectionName);
    const id = item.id !== undefined ? item.id : Date.now() + Math.floor(Math.random() * 1000);
    const newItem = {
      ...item,
      id,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    col.push(newItem);
    this.saveLocal();

    // Asynchronously sync to MongoDB
    if (this.isMongoConnected && models[collectionName]) {
      const Model = models[collectionName];
      const q = newItem.id !== undefined ? { id: newItem.id } : { email: newItem.email };
      Model.updateOne(q, { $set: newItem }, { upsert: true }).catch((err) =>
        console.error(`[Mongo Sync Insert Error ${collectionName}]:`, err.message)
      );
    }

    return newItem;
  }

  update(collectionName, predicate, updates) {
    const col = this.getCollection(collectionName);
    const index = col.findIndex(predicate);
    if (index === -1) return null;

    const targetItem = col[index];
    col[index] = {
      ...targetItem,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveLocal();

    // Asynchronously sync to MongoDB
    if (this.isMongoConnected && models[collectionName]) {
      const Model = models[collectionName];
      const q = targetItem.id !== undefined ? { id: targetItem.id } : { email: targetItem.email };
      Model.updateOne(q, { $set: col[index] }, { upsert: true }).catch((err) =>
        console.error(`[Mongo Sync Update Error ${collectionName}]:`, err.message)
      );
    }

    return col[index];
  }

  delete(collectionName, predicate) {
    const col = this.getCollection(collectionName);
    const targetItem = col.find(predicate);
    const initialLen = col.length;
    this.data[collectionName] = col.filter((item) => !predicate(item));
    const deleted = this.data[collectionName].length < initialLen;
    if (deleted) this.saveLocal();

    // Asynchronously sync to MongoDB
    if (deleted && targetItem && this.isMongoConnected && models[collectionName]) {
      const Model = models[collectionName];
      const q = targetItem.id !== undefined ? { id: targetItem.id } : { email: targetItem.email };
      Model.deleteOne(q).catch((err) =>
        console.error(`[Mongo Sync Delete Error ${collectionName}]:`, err.message)
      );
    }

    return deleted;
  }
}

export const db = new MongoSyncedDatabase();
