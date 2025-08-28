import { verifyToken } from "@/lib/adminToken";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const decoded = verifyToken(req);
    if (!decoded || decoded.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    const { name, phone } = req.body;

    // Validation
    if (phone && !/^\+?[1-9]\d{9,14}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (name) admin.name = name;
    if (phone) admin.phone = phone;

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        avatar: admin.avatar || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
