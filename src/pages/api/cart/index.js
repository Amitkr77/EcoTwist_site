import Cart from "@/models/Cart";
import authMiddleware from "@/lib/authMiddleware";
import Product from "@/models/Product";

export default async function handler(req, res) {
    const user = await authMiddleware(req, res);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    try {
        if (req.method === 'POST') {
            const { productId, variantSku, quantity } = req.body;

            // Validate the request body
            if (!productId || !variantSku || !quantity || quantity <= 0) {
                return res.status(400).json({ message: 'Invalid product data' });
            }

            // Fetch product and variant
            const product = await Product.findById(productId);
            if (!product) return res.status(404).json({ message: 'Product not found' });

            const variant = product.variants.find(v => v.sku === variantSku);
            if (!variant) return res.status(404).json({ message: 'Variant not found' });

            // Get primary or fallback image
            const primaryImage =
                product.images?.find(img => img.isPrimary)?.url ||
                product.images?.[0]?.url ||
                null;

            // Check if the item already exists in the cart
            const existingCartItem = await Cart.findOne({
                userId: user.userId,
                'items.productId': productId,
                'items.variantSku': variantSku
            });

            if (existingCartItem) {
                // Update item quantity in the cart if it exists
                await Cart.updateOne(
                    { userId: user.userId, 'items.productId': productId, 'items.variantSku': variantSku },
                    { $inc: { 'items.$.quantity': quantity } }
                );
                const updatedCart = await Cart.findOne({ userId: user.userId });
                return res.status(200).json({ message: 'Cart updated successfully', cart: updatedCart });
            }

            // Add new item to cart
            const cartItem = {
                productId,
                variantSku,
                name: product.name,
                price: variant.price,
                quantity,
                image: primaryImage
            };

            const cart = await Cart.findOneAndUpdate(
                { userId: user.userId },
                { $push: { items: cartItem } },
                { new: true, upsert: true }
            );

            return res.status(201).json({ message: 'Item added to cart', cart });
        }



        if (req.method === 'GET') {
            // Fetch the user's cart, or default to an empty cart structure if none exists
            let cart = await Cart.findOne({ userId: user.userId });
            if (!cart) {
                // If no cart document exists, create an empty one (optional but ensures consistency for future ops)
                cart = await new Cart({ userId: user.userId, items: [] }).save();
            }
            // Always return 200 with the cart (items will be [] if empty)
            return res.status(200).json({ cart });
        }

        if (req.method === 'DELETE') {
            // Clear all items in the user's cart
            const cart = await Cart.findOneAndUpdate(
                { userId: user.userId },
                { $set: { items: [] } },
                { new: true }
            );

            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            return res.status(200).json({ message: 'Cart cleared successfully' });
        }

        // Handle unsupported HTTP methods
        return res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.error('Error in cart handler:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}