import jwt from "jsonwebtoken";
import User from "@/models/User.js";
import dbConnect from "@/lib/mongodb";
import sendEmail from "../../nodemailer/mail-handler";

// Rate Limiting function
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowTime = 15 * 60 * 1000; 
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

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f9; border-radius: 8px;">
    <h2 style="color: #333; font-size: 24px; text-align: center;">Reset Your Password</h2>
    <p style="font-size: 16px; color: #555; line-height: 1.5;">We received a request to reset your password. If this was you, please click the link below to reset your password:</p>
    
    <p style="text-align: center;">
        <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; font-size: 16px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">Reset My Password</a>
    </p>

    <p style="font-size: 14px; color: #777; text-align: center;">This link will expire in 1 hour.</p>

    <footer style="font-size: 12px; text-align: center; color: #aaa; margin-top: 30px;">
        <p>If you did not request a password reset, please ignore this email.</p>
    </footer>
</div>

    `;

    
    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      html: emailHtml,
    });

    return res.status(200).json({ message: "Password reset link sent to your email", resetUrl });

  } catch (error) {
    console.error("Error in password reset:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
