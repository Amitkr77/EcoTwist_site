// pages/api/orders/[orderId]/status.js

import adminMiddleware from '@/lib/adminMiddleware';
import { verifyToken } from '@/lib/adminToken';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order'; // Make sure your Order model is set up

export default async function handler(req, res) {
  await dbConnect(); // ✅ Ensure DB connection
  const { id } = req.query;
  console.log("orderId", id);


  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // ✅ Check if user is admin
    // const admin = await adminMiddleware(req, res);
    // if (!admin) return;

    const decoded = verifyToken(req);
    if (!decoded) return res.status(401).json({ message: "Unauthorized" });

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // ✅ Update the order status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json({ message: 'Order status updated', order: updatedOrder });
  } catch (error) {
    console.error('Order update error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
