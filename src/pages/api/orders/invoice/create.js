import mongoose from 'mongoose';
import authMiddleware from '@/lib/authMiddleware';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Order from '@/models/Order';

// Sample Invoice Schema (for reference, add to your Invoice model if not already present)
const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  billingAddress: { type: Object, required: true },
  items: [{ type: Object, required: true }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ['paid', 'unpaid'], required: true },
  createdAt: { type: Date, default: Date.now },
});

// Auto-generate invoiceNumber if not already defined
InvoiceSchema.pre('save', async function (next) {
  if (this.isNew && !this.invoiceNumber) {
    const count = await this.constructor.countDocuments();
    this.invoiceNumber = `INV-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// Ensure unique index on orderId (add to your Invoice model file)
InvoiceSchema.index({ orderId: 1 }, { unique: true });

export default async function handler(req, res) {
  // Restrict to POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate user
  const user = await authMiddleware(req, res);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Validate request body
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }
  if (!mongoose.isValidObjectId(orderId)) {
    return res.status(400).json({ error: 'Invalid Order ID format' });
  }

  try {
    await dbConnect();

    // Convert orderId to ObjectId for type safety
    const objectId = new mongoose.Types.ObjectId(orderId);

    // Fetch order with necessary fields
    const order = await Order.findById(objectId).select(
      'userId deliveryAddress items totalAmount paymentMethod'
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify order belongs to user
    if (order.userId.toString() !== user.userId) {
      return res.status(403).json({ error: 'Forbidden: Order does not belong to user' });
    }

    // Explicitly check for existing invoice
    const existingInvoice = await Invoice.findOne({ orderId: objectId });
    if (existingInvoice) {
      console.log(`Invoice already exists for orderId: ${orderId}, invoiceNumber: ${existingInvoice.invoiceNumber}`);
      return res.status(200).json({
        success: true,
        invoiceNumber: existingInvoice.invoiceNumber,
        message: 'Invoice already exists',
        data: existingInvoice,
      });
    }

    // Create new invoice
    const invoice = new Invoice({
      orderId: order._id,
      userId: order.userId,
      billingAddress: order.deliveryAddress,
      items: order.items,
      subtotal: order.totalAmount,
      tax: 0,
      shippingFee: 0,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentMethod === 'cod' ? 'unpaid' : 'paid',
    });

    await invoice.save();

    console.log(`New invoice created for orderId: ${orderId}, invoiceNumber: ${invoice.invoiceNumber}`);

    return res.status(201).json({
      success: true,
      invoiceNumber: invoice.invoiceNumber,
      message: 'Invoice created successfully',
      data: invoice,
    });
  } catch (error) {
    console.error('Invoice creation error:', error);
    if (error.code === 11000) { // Duplicate key error (e.g., orderId or invoiceNumber)
      return res.status(409).json({ error: 'Invoice already exists for this order' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}