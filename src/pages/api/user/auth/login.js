import jwt from "jsonwebtoken";
import User from "@/models/User.js";
import dbConnect from "@/lib/mongodb";
import cookie from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await dbConnect();
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Missing email or password:", { email, password });
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log("No user found for email:", email);
      return res.status(401).json({ error: "Invalid Email" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid Password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your email first" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.setHeader(
      "Set-Cookie",
      cookie.serialize("user-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
        path: "/",
        sameSite: "lax",
      })
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.firstName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}