import mongoose from 'mongoose';

const { Schema } = mongoose;

const WishlistItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    imageUrl: String,  
});

const WishlistSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [WishlistItemSchema],
});

export default mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);
