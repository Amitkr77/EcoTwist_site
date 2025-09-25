import authMiddleware from '@/lib/authMiddleware'; 
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Authenticate user
    const user = await authMiddleware(req, res);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    // Find the order by orderId and userId to ensure ownership
    const order = await Order.findOne({ orderId: id, userId: user.userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Prevent cancelling if already cancelled or shipped/delivered
    if (['cancelled', 'shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel order with status '${order.status}'` });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    await order.save();

    // Restore inventory stock for each item in order
    for (const item of order.items) {
      await Product.findOneAndUpdate(
        { _id: item.productId, 'variants.sku': item.variantSku },
        { $inc: { 'variants.$.inventory.quantity': item.quantity } }
      );
    }

    return res.status(200).json({ message: 'Order cancelled successfully', order });

  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
