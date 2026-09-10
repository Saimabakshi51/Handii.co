import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

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
  settings: {
    minMarginThreshold: 0.25, // 25% minimum profit margin safeguard for combos
    currency: 'INR',
    currencySymbol: '₹',
    shopName: 'handii.co',
    phone: '919876543210'
  }
};

class JSONDatabase {
  constructor() {
    this.data = initialData;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = { ...initialData, ...JSON.parse(raw) };
      } else {
        this.save();
      }
    } catch (err) {
      console.error('[DB] Error loading db.json, initializing fresh data:', err);
      this.data = initialData;
      this.save();
    }
  }

  save() {
    try {
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('[DB] Error saving db.json:', err);
    }
  }

  // Generic collection helpers
  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
      this.save();
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
    this.save();
    return newItem;
  }

  update(collectionName, predicate, updates) {
    const col = this.getCollection(collectionName);
    const index = col.findIndex(predicate);
    if (index === -1) return null;
    col[index] = {
      ...col[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return col[index];
  }

  delete(collectionName, predicate) {
    const col = this.getCollection(collectionName);
    const initialLen = col.length;
    this.data[collectionName] = col.filter((item) => !predicate(item));
    const deleted = this.data[collectionName].length < initialLen;
    if (deleted) this.save();
    return deleted;
  }
}

export const db = new JSONDatabase();
