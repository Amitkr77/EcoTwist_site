import mongoose from "mongoose";

const BlogPostSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  headerImage: { type: String },
  category: { type: String },
  readTime: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Avoid model overwrite issue in Next.js dev
export default mongoose.models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);
