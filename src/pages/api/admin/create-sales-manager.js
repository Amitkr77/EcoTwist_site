import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { hashPassword } from "@/lib/hashPassword"; 
import { verifyToken } from "@/lib/adminToken";
import SalesManager from "@/models/salesManager";

// Function to generate strong random password
function generatePassword(length = 12) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    await dbConnect();

    const decoded = verifyToken(req);
    if (!decoded || decoded.role !== "admin") return res.status(401).json({ message: "Unauthorized" });

    const { email, name } = req.body;
    if (!email || !name) return res.status(400).json({ message: "Email and Name of manager is required" });

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const password = generatePassword();
    const hashedPassword = await hashPassword(password);

    const newManager = new SalesManager({ name, email, password: hashedPassword });
    await newManager.save();

    res.status(200).json({ success: true, password }); // return password to show in toast
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
