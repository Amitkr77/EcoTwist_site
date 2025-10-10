// /api/orders/create.js
import authMiddleware from '@/lib/authMiddleware';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Cart from '@/models/Cart';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { format } from 'date-fns';
import Invoice from '@/models/Invoice';
import sendEmail from '@/lib/nodemailer/mail-handler';
import User from '@/models/User';

async function generateOrderId() {
    let orderId;
    let isUnique = false;
    while (!isUnique) {
        const timestamp = format(new Date(), 'yyyyMMddHHmmss');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        orderId = `ORD-${timestamp}-${randomSuffix}`;
        const existingOrder = await Order.findOne({ orderId });
        if (!existingOrder) isUnique = true;
    }
    return orderId;
}


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

            const orderId = await generateOrderId();
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

            // Fetch user's email from User model
            const userData = await User.findById(user.userId).select('email');
            if (!userData || !userData.email) {
                console.error('User email not found for userId:', user.userId);
                return res.status(400).json({ message: 'User email not found' });
            }

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
                    to: userData.email,
                    subject: 'Ecotwist - Your Order Confirmation',
                    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - Ecotwist</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Playfair+Display:wght@500&display=swap');

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Roboto', Arial, sans-serif;
            background-color: #e7f0e4;
            line-height: 1.8;
            color: #2a2a2a;
        }

        .container {
            max-width: 680px;
            margin: 32px auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 100, 0, 0.15);
        }

        .header {
            background: linear-gradient(135deg, #1a4d2e 0%, #4a8a59 100%);
            padding: 60px 40px 48px;
            text-align: center;
            position: relative;
        }

        .header::before {
            content: '';
            display: block;
            width: 80px;
            height: 80px;
            background: url('https://ecotwist.in/check-circle.svg') no-repeat center;
            background-size: contain;
            margin: 0 auto 20px;
        }

        .header img {
            max-width: 170px;
            transition: transform 0.3s ease;
        }

        .header img:hover {
            transform: scale(1.05);
        }

        .header h1 {
            font-family: 'Playfair Display', serif;
            color: #ffffff;
            font-size: 36px;
            font-weight: 500;
            margin: 16px 0 8px;
        }

        .header p {
            color: #d4e4d6;
            font-size: 16px;
            font-weight: 300;
        }

        .content {
            padding: 56px 48px;
        }

        .greeting {
            font-size: 18px;
            font-weight: 400;
            text-align: center;
            margin-bottom: 40px;
            color: #2a2a2a;
        }

        .greeting strong {
            color: #1a4d2e;
            font-weight: 500;
        }

        .section {
            margin-bottom: 56px;
        }

        .subtitle {
            font-family: 'Playfair Display', serif;
            color: #1a4d2e;
            font-size: 26px;
            font-weight: 500;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 2px solid #e8f5e9;
        }

        .table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background: #f8faf8;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .table th, .table td {
            padding: 16px 24px;
            text-align: left;
            font-size: 15px;
        }

        .table th {
            background: #e8f5e9;
            color: #1a4d2e;
            font-weight: 500;
            text-transform: uppercase;
            font-size: 13px;
            letter-spacing: 0.5px;
        }

        .table td {
            border-top: 1px solid #e8f5e9;
            color: #2a2a2a;
        }

        .table .total {
            font-weight: 600;
            background: #e8f5e9;
            color: #1a4d2e;
        }

        .detail-list {
            list-style: none;
            background: #f8faf8;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .detail-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
            font-size: 15px;
        }

        .detail-item strong {
            color: #1a4d2e;
            font-weight: 500;
        }

        .next-steps {
            background: #f8faf8;
            padding: 28px;
            border-radius: 12px;
            font-size: 15px;
            line-height: 1.8;
        }

        .next-steps h3 {
            font-family: 'Playfair Display', serif;
            color: #1a4d2e;
            font-size: 20px;
            margin-bottom: 16px;
        }

        .next-steps ul {
            list-style: none;
            padding-left: 0;
        }

        .next-steps li {
            position: relative;
            padding-left: 28px;
            margin-bottom: 12px;
        }

        .next-steps li::before {
            content: '🌿';
            position: absolute;
            left: 0;
            font-size: 18px;
        }

        .cta {
            text-align: center;
            margin: 48px 0;
        }

        .cta-button {
            display: inline-block;
            padding: 16px 48px;
            background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 50px;
            font-size: 17px;
            font-weight: 500;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .cta-button:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(46, 125, 50, 0.4);
        }

        .footer {
            background: linear-gradient(135deg, #1a4d2e 0%, #4a8a59 100%);
            padding: 40px 32px;
            text-align: center;
            color: #ffffff;
            font-size: 14px;
        }

        .footer p {
            margin-bottom: 12px;
        }

        .footer a {
            color: #c8e6c9;
            text-decoration: none;
            transition: color 0.2s ease;
        }

        .footer a:hover {
            color: #ffffff;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-links a {
            margin: 0 16px;
            display: inline-block;
            transition: transform 0.2s ease;
        }

        .social-links a:hover {
            transform: scale(1.2);
        }

        .social-links img {
            width: 28px;
            height: 28px;
        }

        @media (max-width: 600px) {
            .container {
                margin: 16px;
                border-radius: 16px;
            }

            .content {
                padding: 40px 24px;
            }

            .header {
                padding: 48px 24px;
            }

            .header h1 {
                font-size: 30px;
            }

            .header p {
                font-size: 15px;
            }

            .subtitle {
                font-size: 22px;
            }

            .table th, .table td {
                padding: 12px 16px;
                font-size: 14px;
            }

            .detail-list {
                padding: 20px;
            }

            .detail-item {
                flex-direction: column;
                font-size: 14px;
            }

            .next-steps {
                padding: 20px;
            }

            .cta-button {
                padding: 14px 36px;
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <table role="presentation" class="container">
        <!-- Header -->
        <tr>
            <td class="header">
                <div style="max-width: 80px; margin: 0 auto;">
                    <img src="https://ecotwist.in/check-circle.svg" alt="Checkmark" style="width: 100%; height: auto;">
                </div>
                <img src="https://ecotwist.in/logo.png" alt="Ecotwist Logo">
                <h1>Your Order is Confirmed!</h1>
                <p>Thank you for choosing a greener future with Ecotwist.</p>
            </td>
        </tr>
        <!-- Body -->
        <tr>
            <td class="content">
                <p class="greeting">
                    Dear <strong>${user.name || 'Eco Warrior'}</strong>,<br>
                    We're overjoyed to confirm your order <strong>#${orderId}</strong>! Your commitment to sustainability warms our hearts and helps protect our planet. Below are the details of your eco-friendly purchase.
                </p>

                <!-- Order Summary -->
                <div class="section order-summary">
                    <h2 class="subtitle">Your Order Summary</h2>
                    <table role="presentation" class="table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Price</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orderItemsTable}
                        </tbody>
                        <tfoot>
                            <tr class="total">
                                <td colspan="3" style="text-align: right;">Total Amount:</td>
                                <td style="text-align: right;">₹${totalAmount.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- Order Details -->
                <div class="section order-details">
                    <h2 class="subtitle">Order Details</h2>
                    <ul class="detail-list">
                        <li class="detail-item">
                            <strong>Order ID:</strong>
                            <span>${orderId}</span>
                        </li>
                        <li class="detail-item">
                            <strong>Delivery Address:</strong>
                            <span>${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.postalCode}, ${deliveryAddress.country}</span>
                        </li>
                        <li class="detail-item">
                            <strong>Payment Method:</strong>
                            <span>${paymentMethod}</span>
                        </li>
                        <li class="detail-item">
                            <strong>Order Date:</strong>
                            <span>${format(new Date(), 'MMMM dd, yyyy')}</span>
                        </li>
                    </ul>
                </div>

                <!-- What's Next -->
                <div class="section">
                    <h2 class="subtitle">What's Next?</h2>
                    <div class="next-steps">
                        <h3>Your Order is on Its Way!</h3>
                        <ul>
                            <li><strong>Processing:</strong> We’re sustainably packing your order within 1-2 business days.</li>
                            <li><strong>Shipping:</strong> A tracking link will arrive in your inbox once it ships.</li>
                            <li><strong>Delivery:</strong> Expect your eco-friendly package in 3-5 business days.</li>
                            <li><strong>Need Help?</strong> Reach our friendly team at <a href="mailto:support@ecotwist.in" style="color: #1a4d2e; text-decoration: underline;">support@ecotwist.in</a>.</li>
                        </ul>
                    </div>
                </div>

                <!-- CTA Button -->
                <div class="cta">
                    <a href="https://ecotwist.in/orders/view-order?orderId=${orderId}" class="cta-button">Track Your Order</a>
                </div>
            </td>
        </tr>
        <!-- Footer -->
        <tr>
            <td class="footer">
                <p>Join our mission to make the world greener!</p>
                <p>&copy; ${new Date().getFullYear()} Ecotwist. All rights reserved.</p>
                <p>
                    <a href="https://ecotwist.in/contact">Contact Us</a> | 
                    <a href="https://ecotwist.in/privacy-policy">Privacy Policy</a> | 
                    <a href="https://ecotwist.in/terms">Terms of Service</a>
                </p>
                <div class="social-links">
                    <a href="http://x.com/ecotwiststores"><img src="https://ecotwist.in/twitter.svg" alt="Twitter"></a>
                    <a href="https://www.instagram.com/ecotwiststores"><img src="https://ecotwist.in/instagram.svg" alt="Instagram"></a>
                    <a href="https://www.facebook.com/ecotwiststores"><img src="https://ecotwist.in/facebook.svg" alt="Facebook"></a>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`
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