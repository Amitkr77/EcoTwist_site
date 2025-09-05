// /models/order.js

import mongoose from 'mongoose';

const { Schema } = mongoose;

// Delivery address schema
const AddressSchema = new Schema({
  fullName: String,
  phone: String,
  street: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
}, { _id: false });

// Cart item schema
const CartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true }, // snapshot name
  price: { type: Number, required: true, min: 0 }, // snapshot price
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
}, { _id: false });

// Main order schema
const OrderSchema = new Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    default: () => `ORD-${Math.floor(Math.random() * 1e9)}`,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: {
    type: [CartItemSchema],
    required: true,
    validate: [arr => arr.length > 0, 'Order must have at least one item'],
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  deliveryAddress: {
    type: AddressSchema,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  estimatedDelivery: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
