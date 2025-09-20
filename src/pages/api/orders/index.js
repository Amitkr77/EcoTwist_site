// /api/orders/create.js
import authMiddleware from '@/lib/authMiddleware';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Cart from '@/models/Cart';
import dbConnect from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { format } from 'date-fns';
import Invoice from '@/models/Invoice';

export default async function handler(req, res) {
    await dbConnect();

    try {
        if (req.method === 'POST') {
            const user = await authMiddleware(req, res);
            if (!user) return res.status(401).json({ message: 'Unauthorized' });

            const { deliveryAddress, paymentMethod } = req.body;

            if (!paymentMethod) {
                return res.status(400).json({ message: 'Payment method is required' });
            }

            // Get cart items for the user
            const cart = await Cart.findOne({ userId: user.userId });
            if (!cart || !cart.items || cart.items.length === 0) {
                return res.status(400).json({ message: 'Cart is empty' });
            }

            let totalAmount = 0;
            const orderItems = [];

            // Validate and prepare order items from cart
            for (const cartItem of cart.items) {
                const product = await Product.findById(cartItem.productId);

                if (!product) {
                    return res.status(404).json({
                        message: `Product ${cartItem.productId} not found`
                    });
                }

                const variant = product.variants.find(v => v.sku === cartItem.variantSku);

                if (!variant) {
                    return res.status(400).json({
                        message: `Variant ${cartItem.variantSku} not found for product ${product.name}`
                    });
                }

                if (variant.inventory.quantity < cartItem.quantity) {
                    return res.status(400).json({
                        message: `Insufficient stock for variant ${variant.sku}`
                    });
                }

                totalAmount += variant.price * cartItem.quantity;

                // Create order item with complete data
                orderItems.push({
                    productId: product._id,
                    variantSku: variant.sku,
                    name: cartItem.name || product.name, // Use cart name or fallback to product name
                    price: variant.price, // Use current variant price
                    quantity: cartItem.quantity,
                    hsnCode: cartItem.hsnCode || product.hsnCode || 'N/A' // ✅ Include HSN code
                });
            }

            const orderId = `ORD-${uuidv4()}`;
            const newOrder = new Order({
                orderId,
                userId: user.userId,
                items: orderItems, // ✅ Items now include HSN code
                totalAmount,
                deliveryAddress,
                paymentMethod,
            });

            await newOrder.save();

            // Update product stock with transaction logic
            const session = await mongoose.startSession();
            await session.withTransaction(async () => {
                for (const item of orderItems) {
                    await Product.findOneAndUpdate(
                        {
                            _id: item.productId,
                            'variants.sku': item.variantSku
                        },
                        {
                            $inc: {
                                'variants.$.inventory.quantity': -item.quantity
                            }
                        },
                        { session }
                    );
                }
            });
            await session.endSession();

            // Clear cart after successful order
            await Cart.findOneAndUpdate(
                { userId: user.userId },
                { $set: { items: [] } }
            );

            return res.status(201).json({
                message: 'Order placed successfully',
                orderId: newOrder.orderId,
                data: newOrder
            });
        }

        if (req.method === 'GET') {
            const user = await authMiddleware(req, res);
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const orders = await Order.find({ userId: user.userId })
                .populate({
                    path: 'invoice',
                    options: { strictPopulate: false },
                })
                .sort({ createdAt: -1 });

            if (!orders || orders.length === 0) {
                return res.status(404).json({ message: 'No orders found' });
            }

            return res.status(200).json(orders);
        }

        else if (req.method === 'DELETE') {
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