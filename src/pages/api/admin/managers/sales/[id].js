import dbConnect from "@/lib/mongodb";
import { verifyToken } from "@/lib/adminToken";
import Manager from "@/models/Manager";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  await dbConnect();

  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.query;

  try {
    if (req.method === "PUT") {
      // Reset password
      const { newPassword } = req.body;
      if (!newPassword) {
        return res.status(400).json({ message: "New password required" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await Manager.findByIdAndUpdate(id, { password: hashedPassword });

      return res.status(200).json({ success: true, message: "Password reset successfully" });
    }

    if (req.method === "DELETE") {
      // Delete manager
      await Manager.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: "Manager deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
