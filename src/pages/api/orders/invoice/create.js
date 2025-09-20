// /api/invoice/create.js
import mongoose from 'mongoose';
import authMiddleware from '@/lib/authMiddleware';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Order from '@/models/Order';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = await authMiddleware(req, res);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { orderId } = req.body;
    if (!orderId || !mongoose.isValidObjectId(orderId)) {
        return res.status(400).json({ error: 'Invalid Order ID' });
    }

    try {
        await dbConnect();
        const objectId = new mongoose.Types.ObjectId(orderId);

        // Fetch order with all necessary fields
        const order = await Order.findById(objectId).select(
            'userId deliveryAddress items totalAmount paymentMethod'
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.userId.toString() !== user.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Check for existing invoice
        const existingInvoice = await Invoice.findOne({ orderId: objectId });
        if (existingInvoice) {
            return res.status(200).json({
                success: true,
                message: 'Invoice already exists',
                data: existingInvoice,
            });
        }

        // Transform order items - now they already have all data!
        const invoiceItems = order.items.map(item => ({
            productId: item.productId,
            name: item.name, // ✅ Use "name" (not itemName)
            price: item.price,
            quantity: item.quantity,
            hsnCode: item.hsnCode, // ✅ Already available from order
            total: item.price * item.quantity, // ✅ Calculate total
        }));

        // Calculate financials
        const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = 0; // You can calculate this based on HSN codes if needed
        const shippingFee = 0; // Add shipping logic if needed

        // Create invoice
        const invoice = new Invoice({
            orderId: order._id,
            userId: order.userId,
            billingAddress: order.deliveryAddress,
            items: invoiceItems,
            subtotal,
            tax,
            shippingFee,
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentMethod === 'cod' ? 'unpaid' : 'paid',
            gstDetails: {
                cgst: 0, // Calculate based on HSN codes if needed
                sgst: 0,
                igst: 0,
                taxRate: 0,
            },
        });

        await invoice.save();

        return res.status(201).json({
            success: true,
            message: 'Invoice created successfully',
            data: invoice,
        });

    } catch (error) {
        console.error('Invoice creation error:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: error.message 
            });
        }
        
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Invoice already exists' });
        }
        
        return res.status(500).json({ error: 'Internal server error' });
    }
}