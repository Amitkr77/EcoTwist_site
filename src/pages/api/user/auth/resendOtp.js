import User from "@/models/User.js";
import rateLimit from "express-rate-limit";
import dbConnect from "@/lib/mongodb";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await dbConnect();
  const { email } = req.body;

  try {
    // Apply rate limiting
    // await new Promise((resolve, reject) => {
    //   limiter(req, { status: (s) => resolve(s === 200) }, () =>
    //     reject(new Error("Too many resend requests"))
    //   );
    // });

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    console.log(`New OTP for ${email}: ${otp}`);

    return res.status(200).json({ message: "New OTP sent to your email" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  } 
}
