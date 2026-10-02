import mongoose from 'mongoose';

const schemaOptions = { timestamps: true, strict: false };

// 1. User Schema
const UserSchema = new mongoose.Schema(
  {
    id: { type: Number, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'customer' },
    addresses: { type: Array, default: [] },
    savedCart: { type: Array, default: [] }
  },
  schemaOptions
);

// 2. Product Schema
const ProductSchema = new mongoose.Schema(
  {
    id: { type: Number, index: true },
    title: { type: String, required: true },
    price: { type: mongoose.Schema.Types.Mixed, required: true },
    numericPrice: { type: Number, default: 0 },
    costPrice: { type: Number, default: 0 },
    cat: { type: String, default: '' },
    sub: { type: String, default: '' },
    img: { type: String, default: '' },
    alt: { type: String, default: '' },
    badge: { type: String, default: null },
    stockCount: { type: Number, default: 10 },
    isOutOfStock: { type: Boolean, default: false },
    isNotify: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    colors: { type: Array, default: [] }
  },
  schemaOptions
);

// 3. Combo Schema
const ComboSchema = new mongoose.Schema(
  {
    id: { type: Number, index: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    badge: { type: String, default: '' },
    img: { type: String, default: '' },
    images: { type: Array, default: [] },
    productIds: { type: Array, default: [] },
    items: { type: Array, default: [] },
    regularPrice: { type: Number, default: 0 },
    comboPrice: { type: Number, default: 0 },
    savingsAmount: { type: Number, default: 0 },
    costTotal: { type: Number, default: 0 },
    profitMarginPercent: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  schemaOptions
);

// 4. Order Schema
const OrderSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed, index: true },
    orderNumber: { type: String, index: true },
    userId: { type: mongoose.Schema.Types.Mixed, default: null },
    customerName: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    shippingAddress: { type: mongoose.Schema.Types.Mixed, default: '' },
    items: { type: Array, default: [] },
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    totalAmount: { type: Number, default: 0 },
    status: { type: String, default: 'placed' },
    paymentMethod: { type: String, default: 'cod' },
    paymentStatus: { type: String, default: 'pending' },
    notes: { type: String, default: '' }
  },
  schemaOptions
);

// 5. Custom Order Schema
const CustomOrderSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed, index: true },
    customOrderId: { type: String, index: true },
    userId: { type: mongoose.Schema.Types.Mixed, default: null },
    customerName: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    category: { type: String, default: '' },
    subcategory: { type: String, default: '' },
    customText: { type: String, default: '' },
    colorPreferences: { type: String, default: '' },
    specifications: { type: String, default: '' },
    referencePhotos: { type: Array, default: [] },
    targetDate: { type: String, default: '' },
    status: { type: String, default: 'submitted' },
    quotePrice: { type: mongoose.Schema.Types.Mixed, default: null },
    estimatedDays: { type: mongoose.Schema.Types.Mixed, default: null },
    quoteNotes: { type: String, default: '' },
    declineReason: { type: String, default: '' }
  },
  schemaOptions
);

// 6. Custom Message Schema
const CustomMessageSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed, index: true },
    customOrderId: { type: String, index: true },
    sender: { type: String, default: 'customer' },
    senderName: { type: String, default: '' },
    message: { type: String, default: '' },
    attachments: { type: Array, default: [] },
    isSystemMessage: { type: Boolean, default: false },
    quoteOffer: { type: mongoose.Schema.Types.Mixed, default: null }
  },
  schemaOptions
);

// 7. Coupon Schema
const CouponSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed, index: true },
    code: { type: String, uppercase: true, index: true },
    description: { type: String, default: '' },
    discountType: { type: String, default: 'percentage' },
    discountValue: { type: Number, default: 10 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscountCap: { type: Number, default: 500 },
    expiryDate: { type: String, default: '2027-12-31' },
    usageLimit: { type: Number, default: 1000 },
    usedCount: { type: Number, default: 0 },
    usedByUsers: { type: Array, default: [] },
    isActive: { type: Boolean, default: true }
  },
  schemaOptions
);

// 8. Review Schema
const ReviewSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed, index: true },
    productId: { type: Number, index: true },
    userId: { type: mongoose.Schema.Types.Mixed, default: null },
    customerName: { type: String, default: 'Artisan Lover' },
    rating: { type: Number, default: 5 },
    title: { type: String, default: '' },
    comment: { type: String, default: '' },
    photos: { type: Array, default: [] },
    isVerifiedBuyer: { type: Boolean, default: true },
    likesCount: { type: Number, default: 0 }
  },
  schemaOptions
);

// 9. Reel Schema
const ReelSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed, index: true },
    title: { type: String, default: '' },
    handle: { type: String, default: '@handii.co' },
    views: { type: String, default: '12.4K' },
    video: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    badge: { type: String, default: '' },
    productId: { type: Number, default: null },
    link: { type: String, default: '' },
    caption: { type: String, default: '' }
  },
  schemaOptions
);

// 10. Subscriber Schema
const SubscriberSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    subscribedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  },
  schemaOptions
);

// 11. Setting Schema
const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  schemaOptions
);

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const ProductModel = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export const ComboModel = mongoose.models.Combo || mongoose.model('Combo', ComboSchema);
export const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export const CustomOrderModel = mongoose.models.CustomOrder || mongoose.model('CustomOrder', CustomOrderSchema);
export const CustomMessageModel = mongoose.models.CustomMessage || mongoose.model('CustomMessage', CustomMessageSchema);
export const CouponModel = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
export const ReviewModel = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
export const ReelModel = mongoose.models.Reel || mongoose.model('Reel', ReelSchema);
export const SubscriberModel = mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);
export const SettingModel = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

export const models = {
  users: UserModel,
  products: ProductModel,
  combos: ComboModel,
  orders: OrderModel,
  customOrders: CustomOrderModel,
  customMessages: CustomMessageModel,
  coupons: CouponModel,
  reviews: ReviewModel,
  reels: ReelModel,
  subscribers: SubscriberModel,
  settings: SettingModel
};
