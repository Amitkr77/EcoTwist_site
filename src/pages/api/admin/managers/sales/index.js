import dbConnect from "@/lib/mongodb";
import { verifyToken } from "@/lib/adminToken";
import { hashPassword } from "@/lib/hashPassword"; 
import SalesManager from "@/models/salesManager";


function generatePassword(length = 12) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default async function handler(req, res) {
  await dbConnect();

  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (req.method === "GET") {
      // Fetch all sales managers
      const managers = await SalesManager.find().select("-password");
      return res.status(200).json({ success: true, managers });
    }

    if (req.method === "POST") {
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existing = await SalesManager.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const password = generatePassword();
      const hashedPassword = await hashPassword(password);

      const newManager = new SalesManager({ name, email, password: hashedPassword });
      await newManager.save();

      return res.status(201).json({
        success: true,
        manager: {
          id: newManager._id,
          name: newManager.name,
          email: newManager.email,
          password: password
        },
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
