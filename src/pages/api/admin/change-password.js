import dbConnect from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/adminToken";
import Admin from "@/models/Admin";


export default async function handler(req, res) {
  if (req.method !== "PUT")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const decoded = verifyToken(req);
    if (!decoded) return res.status(401).json({ message: "Unauthorized" });

    await dbConnect();
    const { oldPassword, newPassword } = req.body;

    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Old password incorrect" });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
