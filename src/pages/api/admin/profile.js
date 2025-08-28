import dbConnect from "@/lib/mongodb";
import { verifyToken } from "@/lib/adminToken";
import Admin from "@/models/Admin";


export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    await dbConnect();
    const decoded = verifyToken(req);

    if (!decoded || decoded.role !== "admin")
      return res.status(401).json({ message: "Unauthorized" });

    const admin = await Admin.findById(decoded.id).select("-password");
    res.status(200).json({ success: true, admin });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
