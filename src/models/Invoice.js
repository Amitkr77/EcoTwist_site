// /models/invoice.js

import mongoose from 'mongoose';

const { Schema } = mongoose;

// Reuse your Address schema from the order model
const AddressSchema = new Schema({
  fullName: String,
  phone: String,
  street: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
}, { _id: false });

// Reuse your cart item snapshot
const CartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
}, { _id: false });

// Helper to generate unique invoice ID
const generateInvoiceId = () => `INV-${Math.floor(100000 + Math.random() * 900000)}`;

// Main Invoice schema
const InvoiceSchema = new Schema({
  invoiceId: {
    type: String,
    required: true,
    unique: true,
    default: generateInvoiceId,
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  billingAddress: {
    type: AddressSchema,
    required: true,
  },
  items: {
    type: [CartItemSchema],
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  shippingFee: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid',
  },
}, {
  timestamps: true, 
});

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
