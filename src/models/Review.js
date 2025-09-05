// models/Review.js

import mongoose from "mongoose";
const { Schema } = mongoose;

const ReviewSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: {
        type: Number,
        required: [true, "Rating is required"],
        min: [1, "Minimum rating is 1"],
        max: [5, "Maximum rating is 5"]
    },
    title: { type: String, trim: true },
    body: { type: String, trim: true },
    status: { type: String, enum: ["pending", "published", "rejected"], default: "pending" },
    moderatedAt: { type: Date },

}, { timestamps: true });
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });


ReviewSchema.index({ status: 1 });


export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);


