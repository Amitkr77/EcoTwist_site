import dbConnect from "@/lib/mongodb";
import Manager from "@/models/Manager";
import { comparePassword } from "@/lib/hashPassword";
import cookie from "cookie";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const { email, password, roleManager } = req.body;

    try {
      const manager = await Manager.findOne({ email });
      if (!manager || manager.role!=roleManager) {
        return res.status(401).json({ error: "Invalid credentials or selected role" });
      }

      const isMatch = await comparePassword(password, manager.password);

      if (!isMatch) {
       return res.status(401).json({ error: "Invalid credentials" });
      }

      const JWT_SECRET=process.env.MANAGER_JWT_SECRET;
      const token = jwt.sign(
        {
            id: manager._id,
            role: manager.role
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.setHeader(
        "Set-Cookie",
          cookie.serialize(`${manager.role}-token`, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24,
          sameSite: "strict",
          path: "/",
       })
      );

      return res.status(200).json({ success: true, role: manager.role });
    } catch (error) {
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
