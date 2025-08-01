import jwt from "jsonwebtoken";
import User from "@/models/User.js";
import dbConnect from "@/lib/mongodb";

// Rate Limiting function
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowTime = 15 * 60 * 1000; // 15 minutes
  const limit = 3;

  const entry = rateLimitMap.get(ip) || { count: 0, firstRequestTime: now };

  if (now - entry.firstRequestTime > windowTime) {
    rateLimitMap.set(ip, { count: 1, firstRequestTime: now });
    return false;
  }

  if (entry.count >= limit) {
    return true;
  }

  rateLimitMap.set(ip, { ...entry, count: entry.count + 1 });
  return false;
}


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Try again later." });
  }

  try {
    await dbConnect();

    const { email } = req.body; 

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_RESET_SECRET,
      { expiresIn: "1h" }
    );

    user.otp = resetToken;
    await user.save();

    // Generate reset URL (for frontend redirection)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // For now, log instead of sending email (replace with Nodemailer)
    console.log(`Reset URL for ${email} at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}: ${resetUrl}`);
    // Log the token instead of sending an email
    console.log(`Reset token for ${email} at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}: ${resetToken}`);

    return res.status(200).json({ message: "Password reset link sent to your email", resetUrl });
  } catch (error) {
    console.error("Error in password reset:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
