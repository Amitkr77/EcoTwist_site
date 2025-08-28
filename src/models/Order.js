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
  name: String, // optional, useful for snapshotting at order time
  price: Number,
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
  items: [CartItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  deliveryAddress: AddressSchema,
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
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
