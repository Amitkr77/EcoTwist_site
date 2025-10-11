// models/Product.js

import mongoose from "mongoose";
const { Schema } = mongoose;

// --- Subdocuments ---

const ImageSchema = new Schema({
  url: { type: String, required: true, trim: true },
  alt: { type: String, default: "" },
  isPrimary: { type: Boolean, default: false },
  variantSku: { type: String },
  position: { type: Number, default: 0 },
}, { _id: false });

const OptionSchema = new Schema({
  name: { type: String, required: true, trim: true },
  values: {
    type: [String],
    required: true,
    validate: v => Array.isArray(v) && v.length > 0,
  },
}, { _id: false });

const VariantSchema = new Schema({
  sku: { type: String, required: true, trim: true },
  optionValues: { type: Map, of: String, default: {} },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  currency: { type: String, default: "INR" },
  inventory: {
    quantity: { type: Number, default: 0, min: 0 },
    policy: { type: String, enum: ["deny", "continue"], default: "deny" },
    managed: { type: Boolean, default: true },
  },
  barcode: { type: String, trim: true },
  weight: {
    value: { type: Number, min: 0 },
    unit: { type: String, enum: ["g", "kg", "lb", "oz"], default: "g" },
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    unit: { type: String, enum: ["cm", "in"], default: "cm" },
  },
  imageUrls: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { _id: false });


const FAQSchema = new Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
}, { _id: false });

// --- Main Product Schema ---

const ProductSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 140 },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  brand: { type: String, default: "Ecotwist" },
  hsnCode: { type: String, required: true, trim: true, match: /^[0-9]{4,8}$/ },

  description: String,
  usage: String,
  benefits: [String],
  ingredients: String,
  bestUse: String,

  categories: [{ type: String, index: true }],
  tags: [{ type: String, index: true }],
  images: { type: [ImageSchema], default: [] },

  options: { type: [OptionSchema], default: [] },
  variants: {
    type: [VariantSchema],
    required: true,
    validate: v => Array.isArray(v) && v.length > 0,
  },

  ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0, min: 0 },

  

  seo: {
    metaTitle: String,
    metaDescription: String,
  },

  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  faqs: { type: [FAQSchema], default: [] },
}, { timestamps: true });

// --- Indexes ---
ProductSchema.index({ name: "text", description: "text", tags: "text" });
ProductSchema.index({ "variants.sku": 1 }, { unique: true, sparse: true });

// --- Virtuals ---
ProductSchema.virtual("priceRange").get(function () {
  if (!this.variants?.length) return null;
  const prices = this.variants.map(v => v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
});

// --- Helpers ---
ProductSchema.methods.variantBySelectedOptions = function (selected) {
  return this.variants.find(v =>
    Object.entries(selected || {}).every(
      ([k, val]) => (v.optionValues?.get?.(k) || v.optionValues?.[k]) === val
    )
  );
};

ProductSchema.methods.variantPriceWithSubscription = function (sku, { type = "first" } = {}) {
  const variant = this.variants.find(v => v.sku === sku);
  if (!variant) return null;
  const { enabled, firstOrderDiscountPct = 0, recurringDiscountPct = 0 } = this.subscriptionOffer || {};
  const discount = type === "recurring" ? recurringDiscountPct : firstOrderDiscountPct;
  return enabled && discount
    ? Math.round(variant.price * (1 - discount / 100) * 100) / 100
    : variant.price;
};

// --- Slug Auto-generation ---
ProductSchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  next();
});

// --- Ratings Sync ---
ProductSchema.statics.recalculateRatings = async function (productId) {
  const Review = mongoose.model("Review");
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), status: "published" } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  const { avgRating = 0, count = 0 } = stats[0] || {};
  await this.findByIdAndUpdate(productId, {
    ratingAverage: avgRating,
    ratingCount: count,
  });
};

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
