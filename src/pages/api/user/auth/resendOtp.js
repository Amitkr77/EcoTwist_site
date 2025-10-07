import User from "@/models/User.js";
import rateLimit from "express-rate-limit";
import dbConnect from "@/lib/mongodb";
import sendEmail from "../../nodemailer/mail-handler";

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

    // console.log(`New OTP for ${email}: ${otp}`);
    const emailHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f9; border-radius: 8px;">
  <h2 style="color: #333; font-size: 24px; text-align: center;">Your OTP Code (Resent)</h2>

  <p style="font-size: 16px; color: #555; line-height: 1.5;">
    As requested, here is your One-Time Password (OTP) again. Use this code to continue your verification or login process.
  </p>

  <div style="text-align: center; margin: 30px 0;">
    <span style="display: inline-block; background-color: #007bff; color: #ffffff; font-size: 28px; font-weight: bold; padding: 12px 24px; border-radius: 6px; letter-spacing: 4px;">
      ${otp}
    </span>
  </div>

  <p style="font-size: 14px; color: #777; text-align: center;">
    This code is valid for 10 minutes. Please do not share it with anyone.
  </p>

  <footer style="font-size: 12px; text-align: center; color: #aaa; margin-top: 30px;">
    <p>If you did not request this code, please ignore this email or contact our support team.</p>
    <p>— Ecotwist Team</p>
  </footer>
</div>

    `

    await sendEmail({
      to: email,
      subject: "Your new otp",
      html: emailHtml
    })


    return res.status(200).json({ message: "New OTP sent to your email" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
