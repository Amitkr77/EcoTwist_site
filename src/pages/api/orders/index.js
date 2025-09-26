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
import sendEmail from '@/lib/nodemailer/mail-handler';


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
                    name: cartItem.name || product.name,
                    slug: product.slug,
                    price: variant.price,
                    quantity: cartItem.quantity,
                    hsnCode: cartItem.hsnCode || product.hsnCode || 'N/A'
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

            // Generate order items table for email
            const orderItemsTable = orderItems
                .map(item => `
                    <tr>
                        <td style="padding: 10px; text-align: left; color: #333333;">${item.name}</td>
                        <td style="padding: 10px; text-align: center; color: #333333;">${item.quantity}</td>
                        <td style="padding: 10px; text-align: right; color: #333333;">₹${item.price.toFixed(2)}</td>
                        <td style="padding: 10px; text-align: right; color: #333333;">₹${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                `)
                .join('');

            // Send email notification
            try {
                await sendEmail({
                    to: `amitroyk99@gmail.com`,
                    subject: 'EcoTwist - Your Order Confirmation',
                    html: `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Order Confirmation</title>
                        </head>
                        <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
                            <table role="presentation" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="background-color: #2c3e50; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                                        <img src="./logo.png" alt="EcoTwist Logo" style="max-width: 150px;">
                                    </td>
                                </tr>
                                <!-- Body -->
                                <tr>
                                    <td style="padding: 30px;">
                                        <h1 style="color: #2c3e50; font-size: 24px; margin: 0 0 20px;">Order Confirmation</h1>
                                        <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
                                            Dear ${user.name || 'Customer'},<br>
                                            Thank you for your order! Your order with ID <strong>${orderId}</strong> has been successfully placed.
                                        </p>
                                        <!-- Order Summary -->
                                        <h2 style="color: #2c3e50; font-size: 20px; margin: 20px 0;">Order Summary</h2>
                                        <table role="presentation" width="100%" style="border-collapse: collapse;">
                                            <thead>
                                                <tr style="background-color: #f9f9f9;">
                                                    <th style="padding: 10px; text-align: left; color: #2c3e50;">Item</th>
                                                    <th style="padding: 10px; text-align: center; color: #2c3e50;">Quantity</th>
                                                    <th style="padding: 10px; text-align: right; color: #2c3e50;">Price</th>
                                                    <th style="padding: 10px; text-align: right; color: #2c3e50;">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${orderItemsTable}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total Amount:</td>
                                                    <td style="padding: 10px; text-align: right; font-weight: bold;">$${totalAmount.toFixed(2)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                        <!-- Order Details -->
                                        <h2 style="color: #2c3e50; font-size: 20px; margin: 20px 0;">Order Details</h2>
                                        <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 10px;">
                                            <strong>Order ID:</strong> ${orderId}<br>
                                            <strong>Delivery Address:</strong> ${deliveryAddress}<br>
                                            <strong>Payment Method:</strong> ${paymentMethod}<br>
                                            <strong>Order Date:</strong> ${format(new Date(), 'MMMM dd, yyyy')}
                                        </p>
                                        <!-- CTA Button -->
                                        <p style="text-align: center; margin: 30px 0;">
                                            <a href="https://ecotwist.in/profile" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px;">View Order Details</a>
                                        </p>
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #2c3e50; padding: 20px; text-align: center; color: #ffffff; font-size: 14px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                                        <p style="margin: 0 0 10px;">&copy; ${new Date().getFullYear()} EcoTwist. All rights reserved.</p>
                                        <p style="margin: 0;">
                                            <a href="https://ecotwist.in/contact" style="color: #ffffff; text-decoration: underline;">Contact Us</a> | 
                                            <a href="https://ecotwist.in/privacy-policy" style="color: #ffffff; text-decoration: underline;">Privacy Policy</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </body>
                        </html>
                    `
                });

            } catch (emailError) {
                console.error('Email Sending Error:', emailError);

            }

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