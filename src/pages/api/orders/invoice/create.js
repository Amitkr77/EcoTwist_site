// pages/api/order/invoice/create.js

import authMiddleware from '@/lib/authMiddleware';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Order from '@/models/Order';


export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await authMiddleware(req, res);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const { orderId } = req.body;

  try {
    await dbConnect();

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const existingInvoice = await Invoice.findOne({ orderId });
    if (existingInvoice) {
      return res.status(409).json({ error: 'Invoice already exists for this order' });
    }

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

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Invoice creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
