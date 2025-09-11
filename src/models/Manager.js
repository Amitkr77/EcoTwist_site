import mongoose from "mongoose";

const ManagerSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, default: "manager:sales" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Manager || mongoose.model("Manager", ManagerSchema);
