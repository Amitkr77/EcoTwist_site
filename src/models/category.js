// import mongoose from "mongoose";
// import { Schema } from "mongoose";

// const categorySchema = new Schema({
//     name: {
//         type: String,
//         required: [true, 'Category name is required'],
//         trim: true,
//         maxlength: [50, 'Category name cannot exceed 50 characters'],
//         unique: true,
//     },
//     slug: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true,
//         lowercase: true,
//     },
//     description: {
//         type: String,
//         trim: true,
//         maxlength: [500, 'Description cannot exceed 500 characters'],
//     },
//     image: {
//         type: String,
//         trim: true,
//     },
//     isActive: {
//         type: Boolean,
//         default: true,
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
// }, { timestamps: true });

// categorySchema.index({ name: 'text', slug: 1 }); // Text search and slug index

// export default mongoose.model('Category', categorySchema)