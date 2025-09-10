import mongoose from "mongoose";

const SalesManagerSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, default: "manager:sales" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.SalesManager || mongoose.model("SalesManager", SalesManagerSchema);
