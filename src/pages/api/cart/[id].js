import Cart from "@/models/Cart";
import authMiddleware from "@/lib/authMiddleware";

export default async function handler(req, res) {
    const user = await authMiddleware(req, res);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    try {
        if (req.method === 'DELETE') {
            const { productId, variantSku } = req.query;

            if (!productId || !variantSku) {
                return res.status(400).json({ message: 'Invalid data' });
            }

            // Remove item from cart
            const cart = await Cart.findOneAndUpdate(
                { userId: user.userId },
                { $pull: { items: { productId, variantSku } } },
                { new: true }
            );

            if (!cart || cart.items.length === 0) {
                return res.status(404).json({ message: 'Item not found in cart or cart is empty' });
            }

            return res.status(200).json({ message: 'Item removed from cart', cart });
        }

        if (req.method === 'PUT') {
            const { productId, variantSku, quantity } = req.body;

            if (!productId || !variantSku || !quantity || quantity <= 0) {
                return res.status(400).json({ message: 'Invalid data' });
            }

            // Update item quantity in cart
            const cart = await Cart.findOneAndUpdate(
                { userId: user.userId, 'items.productId': productId, 'items.variantSku': variantSku },
                { $set: { 'items.$.quantity': quantity } },
                { new: true }
            );

            if (!cart) {
                return res.status(404).json({ message: 'Item not found in cart' });
            }

            return res.status(200).json({ message: 'Cart updated successfully', cart });
        }

        if (req.method === 'GET') {
            // Get the user's cart
            const cart = await Cart.findOne({ userId: user.userId }).populate('items.productId');

            if (!cart || cart.items.length === 0) {
                return res.status(404).json({ message: 'Cart is empty' });
            }

            return res.status(200).json({ cart });
        }

        // Handle unsupported HTTP methods
        return res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.error('Error handling cart:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}
