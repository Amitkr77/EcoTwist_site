import authMiddleware from '@/lib/authMiddleware';
import Wishlist from '@/models/Wishlist';

export default async function handler(req, res) {
    // Only allow DELETE method
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    try {
        const user = await authMiddleware(req, res);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'Product ID is required' });
        }
        const wishlist = await Wishlist.findOneAndUpdate(
            { userId: user.userId, 'items.productId': id },
            { $pull: { items: { productId: id } } },
            { new: true }
        );
        if (!wishlist) {
            return res.status(404).json({ message: 'Product not found in your wishlist' });
        }
        return res.status(200).json({ message: 'Product removed from wishlist', wishlist });
    } catch (err) {
        console.error('Error removing product from wishlist:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}
