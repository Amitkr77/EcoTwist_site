import mongoose from 'mongoose';

const { Schema } = mongoose;

const CartItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: String,
    name: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 },
});

const CartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [CartItemSchema],
});

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);
