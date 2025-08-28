import authMiddleware from '@/lib/authMiddleware';
import Wishlist from '@/models/Wishlist';

export default async function handler(req, res) {
    // Only allow DELETE method
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Authenticate user
        const user = await authMiddleware(req, res);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        // Get the productId from URL params (req.query is for query params, req.params is for URL params)
        const { id } = req.query; // 'id' comes from the URL

        // Validate productId presence
        if (!id) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        // Find the wishlist and remove the product by id
        const wishlist = await Wishlist.findOneAndUpdate(
            { userId: user.userId },
            { $pull: { items: { productId: id } } },
            { new: true } // Return the updated wishlist
        );

        // // If the wishlist does not exist or product is not found
        // if (!wishlist || wishlist.items.length === 0) {
        //     return res.status(404).json({ message: 'Product not found in your wishlist' });
        // }

        // Return the updated wishlist
        return res.status(200).json({ message: 'Product removed from wishlist', wishlist });
    } catch (err) {
        console.error('Error removing product from wishlist:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}
