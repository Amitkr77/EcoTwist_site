import User from "@/models/User.js";
import dbConnect from "@/lib/mongodb";
import sendEmail from "@/lib/nodemailer/mail-handler";

const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, time: now };

  if (now - record.time > 15 * 60 * 1000) {
    rateLimitMap.set(ip, { count: 1, time: now });
    return false;
  }

  if (record.count >= 5) {
    return true;
  }

  record.count += 1;
  rateLimitMap.set(ip, record);
  return false;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  try {
    await dbConnect();

    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      otp,
      otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    await user.save();

    const emailHtml = `
  <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fafafa;">
    <h2 style="color: #333;">Hello ${firstName},</h2>

    <p style="font-size: 16px; color: #555;">
      Thank you for registering with <strong>EcoTwist</strong>! Please use the following One-Time Password (OTP) to complete your registration:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <span style="display: inline-block; padding: 12px 24px; font-size: 24px; font-weight: bold; background-color: #4CAF50; color: white; border-radius: 5px;">
        ${otp}
      </span>
    </div>

    <p style="font-size: 14px; color: #888;">
      This code is valid for <strong>15 minutes</strong>. If you did not request this, please ignore this email.
    </p>

    <p style="margin-top: 40px; font-size: 16px; color: #333;">
      Best regards,<br/>
      Technical team
    </p>

    <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />

    <p style="font-size: 12px; color: #aaa; text-align: center;">
      &copy; ${new Date().getFullYear()} EcoTwist Pvt Ltd. All rights reserved.
    </p>
  </div>
`
    await sendEmail({
      to: email,
      subject: "Your OTP Code",
      html: emailHtml
    });

    return res.status(201).json({
      message: `Registration successful. Check your email for OTP. or ${otp}`,
      userId: user._id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
