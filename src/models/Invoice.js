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

// Updated CartItemSchema with HSN code and total
const CartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  hsnCode: {
    type: String,
    required: true,
    default: 'N/A',
  },
  total: {
    type: Number,
    required: true,
    min: 0,
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
    unique: true, // Ensure one invoice per order
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
    min: 0,
  },
  shippingFee: {
    type: Number,
    default: 0,
    min: 0,
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
  // Optional: GST details for Indian compliance
  gstDetails: {
    cgst: { type: Number, default: 0, min: 0 },
    sgst: { type: Number, default: 0, min: 0 },
    igst: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0 }, // e.g., 18 for 18%
  },
}, {
  timestamps: true,
});

// Ensure unique index on orderId
InvoiceSchema.index({ orderId: 1 }, { unique: true });

// Pre-save middleware to validate totals
InvoiceSchema.pre('save', function (next) {
  // Validate that totalAmount matches calculated total
  const calculatedTotal = this.items.reduce((sum, item) => sum + item.total, 0) +
    (this.tax || 0) + (this.shippingFee || 0);

  if (Math.abs(this.totalAmount - calculatedTotal) > 0.01) {
    return next(new Error('Total amount does not match calculated total'));
  }

  // Auto-generate invoiceId if not provided
  if (this.isNew && !this.invoiceId) {
    this.invoiceId = generateInvoiceId();
  }

  next();
});

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);