// pages/api/orders/invoice/create.js

import authMiddleware from '@/lib/authMiddleware';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Order from '@/models/Order';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const user = await authMiddleware(req, res);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const { orderId } = req.body;

  try {
    await dbConnect();

    // 1. Validate the order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // 2. Check for existing invoice
    let invoice = await Invoice.findOne({ orderId });

    if (invoice) {
      return res.status(200).json({
        success: true,
        invoiceNumber: invoice.invoiceId, // assumes this field exists
        message: 'Invoice already exists',
      });
    }

    // 3. Create new invoice
    invoice = new Invoice({
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

    res.status(201).json({
      success: true,
      invoiceNumber: invoice.invoiceNumber,
      message: 'Invoice created successfully',
    });
  } catch (error) {
    console.error('Invoice creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
