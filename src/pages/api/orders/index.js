import authMiddleware from '@/lib/authMiddleware';
import Order from '@/models/Order';
import Product from '@/models/Product';
import dbConnect from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
    await dbConnect();

    try {
        if (req.method === 'POST') {
            const user = await authMiddleware(req, res);
            if (!user) return res.status(401).json({ message: 'Unauthorized' });

            const { products, deliveryAddress, paymentMethod } = req.body;

            if (!products || !Array.isArray(products) || products.length === 0) {
                return res.status(400).json({ message: 'Products array is required' });
            }

            if (!paymentMethod) {
                return res.status(400).json({ message: 'Payment method is required' });
            }

            let totalAmount = 0;
            const orderItems = [];

            for (const item of products) {
                const product = await Product.findById(item.productId);

                if (!product) {
                    return res.status(404).json({ message: `Product ${item.productId} not found` });
                }

                const variant = product.variants.find(v => v.sku === item.variantSku);

                if (!variant) {
                    return res.status(400).json({ message: `Variant ${item.variantSku} not found for product ${product.name}` });
                }

                if (typeof item.quantity !== 'number' || item.quantity <= 0) {
                    return res.status(400).json({ message: `Invalid quantity for ${product.name}` });
                }

                if (typeof variant.price !== 'number') {
                    return res.status(500).json({ message: `Invalid price for variant ${variant.sku}` });
                }

                if (variant.inventory.quantity < item.quantity) {
                    return res.status(400).json({ message: `Insufficient stock for variant ${variant.sku}` });
                }

                totalAmount += variant.price * item.quantity;

                orderItems.push({
                    productId: product._id,
                    variantSku: variant.sku,
                    name: product.name,
                    price: variant.price,
                    quantity: item.quantity
                });
            }

            const orderId = `ORD-${uuidv4()}`;
            const newOrder = new Order({
                orderId,
                userId: user.userId,
                items: orderItems,
                totalAmount,
                deliveryAddress,
                paymentMethod,
            });

            await newOrder.save();

            // Update product stock with transaction logic
            for (const item of products) {
                await Product.findOneAndUpdate(
                    { _id: item.productId, 'variants.sku': item.variantSku }, // Query to match product and variant
                    { $inc: { 'variants.$.inventory.quantity': -item.quantity } } // Update inventory quantity
                );

            }

            return res.status(201).json({
                message: 'Order placed successfully',
                orderId: newOrder.orderId,
            });
        } if (req.method === 'GET') {
            // Authenticate user
            const user = await authMiddleware(req, res);
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Retrieve orders by userId
            try {
                const orders = await Order.find({ userId: user.userId }); // Get all orders for the authenticated user

                if (!orders || orders.length === 0) {
                    return res.status(404).json({ message: 'No orders found' });
                }

                return res.status(200).json(orders);
            } catch (err) {
                console.error('Error retrieving orders:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
        }
        else if (req.method === 'DELETE') {
            // Handle DELETE request to remove all orders
            const user = await authMiddleware(req, res);
            if (!user) return res.status(401).json({ message: 'Unauthorized' });

            await Order.deleteMany({ userId: user.userId });

            return res.status(200).json({
                message: 'All orders deleted successfully',
            });
        }

        return res.status(405).json({
            success: false,
            message: `Method ${req.method} not allowed`,
        });
    } catch (err) {
        console.error('Checkout Error:', err);
        res.status(500).json({ message: err.message });
    }
}
