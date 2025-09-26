import Cart from "@/models/Cart";
import authMiddleware from "@/lib/authMiddleware";
import Product from "@/models/Product";
import dbConnect from '@/lib/mongodb';

export default async function handler(req, res) {
    await dbConnect();
    
    const user = await authMiddleware(req, res);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    try {
        if (req.method === 'POST') {
            const { productId, variantSku, quantity = 1 } = req.body;

            if (!productId || !variantSku || quantity <= 0) {
                return res.status(400).json({ message: 'Invalid product data' });
            }

            const product = await Product.findById(productId).select('name variants hsnCode images').lean();
            if (!product) return res.status(404).json({ message: 'Product not found' });

            const variant = product.variants.find(v => v.sku === variantSku);
            if (!variant) return res.status(404).json({ message: 'Variant not found' });

            const primaryImage =
                product.images?.find(img => img.isPrimary)?.url ||
                product.images?.[0]?.url ||
                null;

            const existingCartItem = await Cart.findOne({
                userId: user.userId,
                'items.productId': productId,
                'items.variantSku': variantSku
            });

            if (existingCartItem) {
                await Cart.updateOne(
                    { 
                        userId: user.userId, 
                        'items.productId': productId, 
                        'items.variantSku': variantSku 
                    },
                    { 
                        $set: { 
                            'items.$.name': product.name,
                            'items.$.price': variant.price,
                            'items.$.hsnCode': product.hsnCode || 'N/A',
                            'items.$.image': primaryImage
                        },
                        $inc: { 'items.$.quantity': quantity } 
                    }
                );
                const updatedCart = await Cart.findOne({ userId: user.userId }).lean();
                return res.status(200).json({ 
                    message: 'Cart updated successfully', 
                    cart: updatedCart 
                });
            }

            const cartItem = {
                productId,
                variantSku,
                name: product.name,
                price: variant.price,
                quantity,
                hsnCode: product.hsnCode || 'N/A',
                image: primaryImage
            };

            const cart = await Cart.findOneAndUpdate(
                { userId: user.userId },
                { $push: { items: cartItem } },
                { new: true, upsert: true }
            ).lean();

            return res.status(201).json({ 
                message: 'Item added to cart', 
                cart 
            });
        }

        if (req.method === 'GET') {
            const cart = await Cart.findOne({ userId: user.userId })
                .populate({ path: 'items.productId', select: 'name images' })
                .lean();
            
            if (!cart) {
                const newCart = await new Cart({ userId: user.userId, items: [] }).save();
                return res.status(200).json({ cart: newCart });
            }
            
            return res.status(200).json({ cart });
        }

        if (req.method === 'DELETE') {
            const cart = await Cart.findOneAndDelete({ userId: user.userId });
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            return res.status(200).json({ 
                message: 'Cart cleared successfully', 
                cart: { userId: user.userId, items: [] } 
            });
        }

        return res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.error('Error in cart handler:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}