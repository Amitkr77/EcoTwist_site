import Wishlist from "@/models/Wishlist";
import authMiddleware from "@/lib/authMiddleware";
import Product from "@/models/Product";

export default async function handler(req, res) {
    const user = await authMiddleware(req, res);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    try {
        if (req.method === 'POST') {
            const { productId } = req.body;

            if (!productId) {
                return res.status(400).json({ message: 'Product ID is required' });
            }

            const product = await Product.findById(productId);
            if (!product) return res.status(404).json({ message: 'Product not found' });

            // Check if the product is already in the wishlist
            const existingWishlist = await Wishlist.findOne({ userId: user.userId });
            if (existingWishlist && existingWishlist.items.some(item => item.productId.toString() === productId)) {
                return res.status(400).json({ message: 'Product is already in your wishlist' });
            }

            // Add product to wishlist
            const wishlistItem = { productId, name: product.name, price: product.price, imageUrl: product.imageUrl };

            const wishlist = await Wishlist.findOneAndUpdate(
                { userId: user.userId },
                { $push: { items: wishlistItem } },
                { new: true, upsert: true }
            );

            return res.status(201).json({ message: 'Product added to wishlist', wishlist });
        }
        if(req.method === 'GET') {
            
        // Get the user's wishlist
        const wishlist = await Wishlist.findOne({ userId: user.userId }).populate('items.productId');

        if (!wishlist || wishlist.items.length === 0) {
            return res.status(404).json({ message: 'Your wishlist is empty' });
        }

        return res.status(200).json({ wishlist });
        }
    } catch (error) {
        console.error('Error adding product to wishlist:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}