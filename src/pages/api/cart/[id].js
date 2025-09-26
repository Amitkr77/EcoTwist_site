import Cart from "@/models/Cart";
import authMiddleware from "@/lib/authMiddleware";
import dbConnect from '@/lib/mongodb';

export default async function handler(req, res) {
    await dbConnect();

    const user = await authMiddleware(req, res);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    try {
        if (req.method === 'DELETE') {
            const { productId, variantSku } = req.query;

            if (!productId || !variantSku) {
                return res.status(400).json({ message: 'Missing productId or variantSku' });
            }

            const cart = await Cart.findOne({ userId: user.userId });
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            const updatedCart = await Cart.findOneAndUpdate(
                { userId: user.userId, 'items.productId': productId, 'items.variantSku': variantSku },
                { $pull: { items: { productId, variantSku } } },
                { new: true }
            ).lean();

            if (!updatedCart) {
                return res.status(404).json({ message: 'Item not found in cart' });
            }

            return res.status(200).json({ 
                message: 'Item removed from cart', 
                cart: updatedCart 
            });
        }

        if (req.method === 'PUT') {
            const { productId, variantSku, quantity } = req.body;

            if (!productId || !variantSku || !quantity || quantity <= 0) {
                return res.status(400).json({ message: 'Invalid data' });
            }

            const cart = await Cart.findOneAndUpdate(
                { userId: user.userId, 'items.productId': productId, 'items.variantSku': variantSku },
                { $set: { 'items.$.quantity': quantity } },
                { new: true }
            ).lean();

            if (!cart) {
                return res.status(404).json({ message: 'Item not found in cart' });
            }

            return res.status(200).json({ 
                message: 'Cart updated successfully', 
                cart 
            });
        }

        if (req.method === 'GET') {
            const cart = await Cart.findOne({ userId: user.userId })
                .populate('items.productId')
                .lean();

            if (!cart || cart.items.length === 0) {
                return res.status(404).json({ message: 'Cart is empty' });
            }

            return res.status(200).json({ cart });
        }

        return res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.error('Error handling cart:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}