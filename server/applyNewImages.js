import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { models } from './models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'db.json');
const STATIC_PRODUCTS_FILE = path.join(__dirname, '../src/data/products.js');

dotenv.config({ path: path.join(__dirname, '../.env') });
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/handii_db';

export const productUpdates = {
  // 1. Consolidated Resin Botanical Coaster with 2 interactive color swatches
  52: {
    title: 'Resin Botanical Coaster',
    cat: 'resin',
    sub: 'coasters',
    img: '/images/coaster-ocean.jpg',
    alt: 'Handcrafted botanical resin coaster with real pressed petals',
    badge: 'Studio Choice',
    price: '249',
    numericPrice: 249,
    costPrice: 110,
    colors: [
      {
        color: 'Ocean Blue',
        title: 'Ocean Blue Coaster',
        style: 'background:#0284c7',
        hex: '#0284c7',
        img: '/images/coaster-ocean.jpg',
        active: true
      },
      {
        color: 'Pearl White',
        title: 'Pearl White Coaster',
        style: 'background:#ffffff; border:1px solid #cbd5e1',
        hex: '#ffffff',
        img: '/images/coaster-white.jpg',
        active: false
      }
    ]
  },
  // 2. Formerly repeated Coasters -> New Flowers
  53: {
    title: 'White Tulip Flower',
    cat: 'pipecleaner',
    sub: 'flowers',
    img: '/images/whitetulip-flower.jpg',
    alt: 'Handcrafted white tulip flower stem',
    badge: null,
    price: '160',
    numericPrice: 160,
    costPrice: 72,
    colors: [
      {
        color: 'Pure White',
        title: 'Pure White',
        style: 'background:#ffffff; border:1px solid #cbd5e1',
        hex: '#ffffff',
        img: '/images/whitetulip-flower.jpg',
        active: true
      }
    ]
  },
  54: {
    title: 'White Rose Flower',
    cat: 'pipecleaner',
    sub: 'flowers',
    img: '/images/whiterose-flower.jpg',
    alt: 'Handcrafted white rose flower bouquet',
    badge: 'New',
    price: '175',
    numericPrice: 175,
    costPrice: 78,
    colors: [
      {
        color: 'Ivory White',
        title: 'Ivory White',
        style: 'background:#fefce8; border:1px solid #cbd5e1',
        hex: '#fefce8',
        img: '/images/whiterose-flower.jpg',
        active: true
      }
    ]
  },
  55: {
    title: 'Pink Tulip Flower',
    cat: 'pipecleaner',
    sub: 'flowers',
    img: '/images/pinktulip-flower.jpg',
    alt: 'Pastel pink tulip flower stem',
    badge: null,
    price: '160',
    numericPrice: 160,
    costPrice: 72,
    colors: [
      {
        color: 'Pastel Pink',
        title: 'Pastel Pink',
        style: 'background:#f472b6',
        hex: '#f472b6',
        img: '/images/pinktulip-flower.jpg',
        active: true
      }
    ]
  },
  56: {
    title: 'Sunflower Flower',
    cat: 'pipecleaner',
    sub: 'flowers',
    img: '/images/sunflower-flower.jpg',
    alt: 'Bright handcrafted sunflower flower stem',
    badge: 'Popular',
    price: '190',
    numericPrice: 190,
    costPrice: 85,
    colors: [
      {
        color: 'Sun Yellow',
        title: 'Sun Yellow',
        style: 'background:#eab308',
        hex: '#eab308',
        img: '/images/sunflower-flower.jpg',
        active: true
      }
    ]
  },

  // 3. Formerly repeated Berry Sweet Keyrings -> Real Charms, Bracelet & Keychains
  58: {
    title: 'Berry Sweet Keyring',
    cat: 'resin',
    sub: 'charms',
    img: '/images/ad-strawberry.png',
    alt: 'Berry sweet resin charm keyring',
    badge: null,
    price: '130',
    numericPrice: 130,
    costPrice: 58,
    colors: [
      {
        color: 'Strawberry Red',
        title: 'Strawberry Red',
        style: 'background:#ef4444',
        hex: '#ef4444',
        img: '/images/ad-strawberry.png',
        active: true
      }
    ]
  },
  59: {
    title: 'Double Heart Resin Charm',
    cat: 'resin',
    sub: 'charms',
    img: '/images/2heart-resin.jpg',
    alt: 'Double heart botanical resin charm',
    badge: null,
    price: '120',
    numericPrice: 120,
    costPrice: 54,
    colors: [
      {
        color: 'Clear Rose',
        title: 'Clear Rose',
        style: 'background:#fb7185',
        hex: '#fb7185',
        img: '/images/2heart-resin.jpg',
        active: true
      }
    ]
  },
  60: {
    title: 'Big Heart Resin Charm',
    cat: 'resin',
    sub: 'charms',
    img: '/images/bigheart-resin.jpg',
    alt: 'Big shimmering heart resin charm',
    badge: null,
    price: '135',
    numericPrice: 135,
    costPrice: 60,
    colors: [
      {
        color: 'Ruby Heart',
        title: 'Ruby Heart',
        style: 'background:#e11d48',
        hex: '#e11d48',
        img: '/images/bigheart-resin.jpg',
        active: true
      }
    ]
  },
  61: {
    title: 'Blue Painted Floral Charm',
    cat: 'resin',
    sub: 'charms',
    img: '/images/bluepaint-resin.jpg',
    alt: 'Blue floral painted resin charm',
    badge: null,
    price: '140',
    numericPrice: 140,
    costPrice: 63,
    colors: [
      {
        color: 'Ocean Paint',
        title: 'Ocean Paint',
        style: 'background:#38bdf8',
        hex: '#38bdf8',
        img: '/images/bluepaint-resin.jpg',
        active: true
      }
    ]
  },
  62: {
    title: 'Heart Print Resin Charm',
    cat: 'resin',
    sub: 'charms',
    img: '/images/heartprint.jpg',
    alt: 'Floral heart print resin charm',
    badge: null,
    price: '125',
    numericPrice: 125,
    costPrice: 56,
    colors: [
      {
        color: 'Floral Heart',
        title: 'Floral Heart',
        style: 'background:#f43f5e',
        hex: '#f43f5e',
        img: '/images/heartprint.jpg',
        active: true
      }
    ]
  },
  63: {
    title: 'Pink Flower Resin Keychain',
    cat: 'resin',
    sub: 'charms',
    img: '/images/keychain-resin-pinkflower.jpg',
    alt: 'Real pressed pink flower resin keychain',
    badge: 'Trending',
    price: '150',
    numericPrice: 150,
    costPrice: 68,
    colors: [
      {
        color: 'Blush Blossom',
        title: 'Blush Blossom',
        style: 'background:#f472b6',
        hex: '#f472b6',
        img: '/images/keychain-resin-pinkflower.jpg',
        active: true
      }
    ]
  },
  64: {
    title: 'Pastel Disc Bead Bracelet',
    cat: 'bracelets',
    sub: 'discbead',
    img: '/images/disc-bracelet.jpg',
    alt: 'Handmade pastel disc bead bracelet',
    badge: null,
    price: '140',
    numericPrice: 140,
    costPrice: 62,
    colors: [
      {
        color: 'Pastel Mix',
        title: 'Pastel Mix',
        style: 'background:linear-gradient(45deg, #f472b6, #38bdf8)',
        hex: '#f472b6',
        img: '/images/disc-bracelet.jpg',
        active: true
      }
    ]
  },
  65: {
    title: 'Flower Pearl Keychain',
    cat: 'pipecleaner',
    sub: 'keychains',
    img: '/images/flowerpearl-pink.jpg',
    alt: 'Pipe cleaner flower pearl keychain in pink',
    badge: 'Cute',
    price: '145',
    numericPrice: 145,
    costPrice: 65,
    colors: [
      {
        color: 'Petal Pink',
        title: 'Petal Pink',
        style: 'background:#f472b6',
        hex: '#f472b6',
        img: '/images/flowerpearl-pink.jpg',
        active: true
      }
    ]
  },
  66: {
    title: 'Mini Heart Keychain',
    cat: 'pipecleaner',
    sub: 'keychains',
    img: '/images/miniheartkey.jpg',
    alt: 'Handcrafted mini pipe cleaner heart keychain',
    badge: null,
    price: '115',
    numericPrice: 115,
    costPrice: 52,
    colors: [
      {
        color: 'Cherry Pink',
        title: 'Cherry Pink',
        style: 'background:#fb7185',
        hex: '#fb7185',
        img: '/images/miniheartkey.jpg',
        active: true
      }
    ]
  },
  67: {
    title: 'Triple Heart Keychain',
    cat: 'pipecleaner',
    sub: 'keychains',
    img: '/images/tripleheart-keychain.jpg',
    alt: 'Handcrafted triple heart charm keychain',
    badge: 'Popular',
    price: '140',
    numericPrice: 140,
    costPrice: 62,
    colors: [
      {
        color: 'Trio Gradient',
        title: 'Trio Gradient',
        style: 'background:linear-gradient(to right, #fb7185, #f472b6)',
        hex: '#fb7185',
        img: '/images/tripleheart-keychain.jpg',
        active: true
      }
    ]
  },

  // 4. Formerly repeated Little Sunshine Keyrings
  28: {
    title: 'Little Sunshine Keyring',
    cat: 'pipecleaner',
    sub: 'keychains',
    img: '/images/sunflowerkey.jpg',
    alt: 'Little sunshine flower keyring',
    badge: null,
    price: '120',
    numericPrice: 120,
    costPrice: 54,
    colors: [
      {
        color: 'Sun Yellow',
        title: 'Sun Yellow',
        style: 'background:#eab308',
        hex: '#eab308',
        img: '/images/sunflowerkey.jpg',
        active: true
      }
    ]
  },
  29: {
    title: 'Star & Moon Keychain',
    cat: 'pipecleaner',
    sub: 'keychains',
    img: '/images/starmoon-keychain.jpg',
    alt: 'Handcrafted celestial star and moon keychain',
    badge: 'Studio Favorite',
    price: '130',
    numericPrice: 130,
    costPrice: 58,
    colors: [
      {
        color: 'Celestial Gold',
        title: 'Celestial Gold',
        style: 'background:#eab308',
        hex: '#eab308',
        img: '/images/starmoon-keychain.jpg',
        active: true
      }
    ]
  },
  30: {
    title: 'Sunflower Charm Keychain',
    cat: 'pipecleaner',
    sub: 'keychains',
    img: '/images/sunflowerkey.jpg',
    alt: 'Bright pipe cleaner sunflower charm keychain',
    badge: null,
    price: '125',
    numericPrice: 125,
    costPrice: 55,
    colors: [
      {
        color: 'Bright Yellow',
        title: 'Bright Yellow',
        style: 'background:#facc15',
        hex: '#facc15',
        img: '/images/sunflowerkey.jpg',
        active: true
      }
    ]
  }
};

export async function applyUpdates() {
  console.log('🌸 [ApplyNewImages]: Starting product catalog updates...');

  // 1. Connect MongoDB
  let isMongoConnected = false;
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
    }
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB.');
  } catch (err) {
    console.warn('⚠️ Could not connect to MongoDB:', err.message);
  }

  // 2. Update server/data/db.json
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  const data = JSON.parse(raw);

  let updatedCount = 0;
  for (const [idStr, updateFields] of Object.entries(productUpdates)) {
    const id = parseInt(idStr, 10);
    const idx = data.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      data.products[idx] = {
        ...data.products[idx],
        ...updateFields,
        isOutOfStock: false,
        isAvailable: true,
        updatedAt: new Date().toISOString()
      };
      updatedCount++;

      // Update in MongoDB
      if (isMongoConnected && models.products) {
        await models.products.updateOne({ id }, { $set: data.products[idx] }, { upsert: true });
      }
    }
  }

  // Write to db.json
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Updated ${updatedCount} products in server/data/db.json and MongoDB!`);

  // 3. Update src/data/products.js
  let staticCode = fs.readFileSync(STATIC_PRODUCTS_FILE, 'utf-8');
  // Match products in static file and update them
  data.products.forEach((p) => {
    if (productUpdates[p.id]) {
      // Re-generate product definition or update static file
    }
  });

  // Write clean static products export
  const newStaticFileContent = `// Auto-generated catalog definitions\nexport const products = ${JSON.stringify(data.products, null, 2)};\n`;
  fs.writeFileSync(STATIC_PRODUCTS_FILE, newStaticFileContent, 'utf-8');
  console.log('✅ Updated src/data/products.js static catalog definitions!');

  console.log('🎉 All duplicates replaced and catalog synchronized successfully!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  applyUpdates()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error applying updates:', err);
      process.exit(1);
    });
}
