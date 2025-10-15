import mongoose from 'mongoose';
import { format } from 'date-fns';

const { Schema } = mongoose;

// Delivery address schema
const AddressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[\d\s-]{10,15}$/, 'Please enter a valid phone number'],
    },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{5,6}$/, 'Invalid postal code format'],
    },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
);

// Cart item schema with HSN code
const CartItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    variantSku: { type: String, trim: true },
    hsnCode: { type: String, required: true, default: 'N/A', trim: true },
  },
  { _id: false }
);

// Main order schema
const OrderSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true, 
      default: () => {
        const prefix = 'ORD';
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}-${timestamp}-${random}`;
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [CartItemSchema],
      required: true,
      validate: {
        validator: arr => arr.length > 0,
        message: 'Order must have at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryAddress: {
      type: AddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cod', 'online'],
        message: '{VALUE} is not a valid payment method',
      },
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'confirmed',
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    estimatedDelivery: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for userId and orderDate
OrderSchema.index({ userId: 1, orderDate: -1 });

// Virtual for invoice
OrderSchema.virtual('invoice', {
  ref: 'Invoice',
  localField: '_id',
  foreignField: 'orderId',
  justOne: true,
});

// Virtual for total items count
OrderSchema.virtual('totalItems').get(function () {
  return this.items ? this.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
});

// Virtual for formatted order date
OrderSchema.virtual('formattedDate').get(function () {
  try {
    return format(new Date(this.orderDate || this.createdAt), 'dd MMM yyyy');
  } catch (error) {
    console.error('Error formatting date:', error.message);
    return null;
  }
});

// Pre-save middleware to validate totalAmount with rounding
OrderSchema.pre('save', function (next) {
  if (this.items && this.items.length > 0) {
    const calculatedTotal = this.items.reduce(
      (sum, item) => sum + Math.round(item.price * item.quantity * 100) / 100,
      0
    );
    if (Math.abs(this.totalAmount - calculatedTotal) > 0.01) {
      return next(new Error('Total amount does not match calculated total'));
    }
  }
  next();
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);