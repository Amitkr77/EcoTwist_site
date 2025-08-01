import User from "@/models/User.js";
import dbConnect from "@/lib/mongodb";

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
    });

    await user.save();

    // Log OTP for now — replace with real email logic later
    console.log(`OTP for ${email}: ${otp}`);

    return res.status(201).json({
      message: "Registration successful. Check your email for OTP.",
      userId: user._id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
