import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Invoice from "@/models/Invoice";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import User from "@/models/User";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET;

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ message: `Method ${req.method} not allowed` });
  }

  try {
    // Parse token from cookie
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No authentication token found" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Check if user is admin
    // const user = await User.findById(decoded.userId).select("role");
    // if (!user || user.role !== "admin") {
    //   return res.status(403).json({ message: "Access denied: Admins only" });
    // }

    // Fetch all orders
    const orders = await Order.find({})
      .populate("invoice")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Admin Orders API error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
