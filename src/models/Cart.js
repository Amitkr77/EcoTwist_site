// /models/cart.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const CartItemSchema = new Schema({
    productId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    variantSku: String,
    name: { 
        type: String, 
        required: true 
    }, // ✅ Make required
    price: { 
        type: Number, 
        required: true, 
        min: 0 
    }, // ✅ Make required
    quantity: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    hsnCode: { 
        type: String, 
        required: true, 
        default: 'N/A' 
    }, // ✅ Added HSN code
    image: String, // Keep existing image field
});

const CartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [CartItemSchema],
}, { timestamps: true });

CartSchema.index({ userId: 1 }, { unique: true });
export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);