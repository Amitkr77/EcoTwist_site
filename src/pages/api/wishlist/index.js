import Wishlist from '@/models/Wishlist';
import authMiddleware from '@/lib/authMiddleware';
import Product from '@/models/Product';
import mongoose from 'mongoose';


export default async function handler(req, res) {
    const user = await authMiddleware(req, res);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    try {
        if (req.method === 'POST') {
            const { productId, selectedOptions } = req.body;
            if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ message: 'Valid Product ID is required' });
            }

            const product = await Product.findById(productId).select('name images variants isActive');
            if (!product || !product.isActive) {
                return res.status(404).json({ message: 'Product not found or inactive' });
            }

            const existingWishlist = await Wishlist.findOne({ userId: user.userId });
            if (existingWishlist && existingWishlist.items.some(item => item.productId.toString() === productId)) {
                return res.status(400).json({ message: 'Product is already in your wishlist' });
            }

            let variant = product.variants[0];
            if (selectedOptions) {
                variant = product.variantBySelectedOptions(selectedOptions);
                if (!variant) {
                    return res.status(400).json({ message: 'Invalid variant options' });
                }
            }
            if (!variant) {
                return res.status(400).json({ message: 'No valid variants available' });
            }

            const primaryImage = product.images.find(img => img.isPrimary) || product.images[0] || { url: '' };

            const wishlistItem = {
                productId,
                variantId: variant.sku,
                name: product.name,
                price: variant.price,
                imageUrl: primaryImage.url,
            };

            const wishlist = await Wishlist.findOneAndUpdate(
                { userId: user.userId },
                { $push: { items: wishlistItem } },
                { new: true, upsert: true }
            );

            return res.status(201).json({ message: 'Product added to wishlist', data: { wishlist } });
        }

        if (req.method === 'GET') {
            const wishlist = await Wishlist.findOne({ userId: user.userId }).populate({
                path: 'items.productId',
                select: 'name images variants isActive',
            });

            if (!wishlist) {
                return res.status(200).json({ message: 'Wishlist is empty', data: { wishlist: { items: [] } } });
            }

            const formattedItems = wishlist.items
                .map(item => {
                    const product = item.productId;
                    if (!product || !product.isActive) return null;
                    const variant = item.variantId
                        ? product.variants.find(v => v.sku === item.variantId)
                        : product.variants[0];
                    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0] || { url: '' };
                    return {
                        productId: item.productId,
                        variantId: item.variantId,
                        name: item.name,
                        price: variant?.price || item.price,
                        imageUrl: primaryImage.url || item.imageUrl,
                    };
                })
                .filter(item => item !== null);

            return res.status(200).json({ message: 'Wishlist retrieved', data: { wishlist: { ...wishlist.toObject(), items: formattedItems } } });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Valid Product ID is required' });
            }

            const wishlist = await Wishlist.findOneAndUpdate(
                { userId: user.userId, 'items.productId': id },
                { $pull: { items: { productId: id } } },
                { new: true }
            );

            if (!wishlist) {
                return res.status(404).json({ message: 'Product not found in your wishlist' });
            }

            return res.status(200).json({ message: 'Product removed from wishlist', data: { wishlist } });
        }

        return res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.error('Error in wishlist handler:', { error, userId: user.userId, productId: req.body?.productId || req.query?.id });
        return res.status(500).json({ message: 'Server error' });
    }
}