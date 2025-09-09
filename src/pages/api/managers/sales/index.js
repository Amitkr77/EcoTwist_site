import dbConnect from "@/lib/mongodb";
import SalesManager from "@/models/salesManager";
import { comparePassword } from "@/lib/hashPassword";
import cookie from "cookie";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const { email, password } = req.body;

    try {
      const manager = await SalesManager.findOne({ email });
      if (!manager) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isMatch = await comparePassword(password, manager.password);

      if (!isMatch) {
       return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
            id: "user-id-123",
            role: "manager:sales"
        },
        process.env.MANAGER_JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.setHeader(
        "Set-Cookie",
          cookie.serialize("manager-sales-token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24,
          sameSite: "strict",
          path: "/",
       })
      );

      return res.status(200).json({ success: true, role: "sales" });
    } catch (error) {
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
