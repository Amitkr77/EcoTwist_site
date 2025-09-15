import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order"
import Invoice from "@/models/Invoice";
import mongoose from "mongoose";
export default async function handler(req, res) {
    await dbConnect();

    const { id } = req.query;

    try {
        if (req.method === 'GET') {

            // Check if the ID is a valid ObjectId
            let searchQuery = {};
            if (mongoose.Types.ObjectId.isValid(id)) {
                // If it's a valid ObjectId, search by `_id`
                searchQuery = { _id: id };
            } else {
                // If it's not a valid ObjectId, search by `orderId`
                searchQuery = { orderId: id };
            }
            // Retrieve the item by ID
            const order = await Order.findOne(searchQuery).populate({
                path: 'invoice',
                options: { strictPopulate: false },
            });

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            return res.status(200).json(order);

        } else if (req.method === 'PUT') {
            // Update the item by ID
            const { products, deliveryAddress, paymentMethod } = req.body;

            // Ensure that the required fields are provided
            if (!products || !Array.isArray(products) || products.length === 0) {
                return res.status(400).json({ message: 'Products array is required' });
            }

            if (!paymentMethod) {
                return res.status(400).json({ message: 'Payment method is required' });
            }

            // Find the order and update it
            const updatedOrder = await Order.findByIdAndUpdate(id, {
                products,
                deliveryAddress,
                paymentMethod,
            }, { new: true });

            if (!updatedOrder) {
                return res.status(404).json({ message: 'Order not found' });
            }

            return res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });

        } else if (req.method === 'DELETE') {

            // Delete the item by ID
            const deletedOrder = await Order.findByIdAndDelete(id);

            if (!deletedOrder) {
                return res.status(404).json({ message: 'Order not found' });
            }

            return res.status(200).json({ message: 'Order deleted successfully' });

        } else {
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
