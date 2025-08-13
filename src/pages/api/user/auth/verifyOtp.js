import dbConnect from "@/lib/mongodb";
import User from "@/models/User.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "MethodNotAllowed",
      message: "Only POST requests are allowed.",
    });
  }

  try {
    await dbConnect();
  } catch (dbError) {
    console.error("Database connection error:", dbError);
    return res.status(500).json({
      error: "DatabaseError",
      message: "Failed to connect to the database.",
    });
  }

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      error: "ValidationError",
      message: "Both email and OTP are required.",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "UserNotFound",
        message: "No account found with this email.",
      });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({
        error: "NoOTP",
        message: "No OTP has been generated for this user.",
      });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        error: "OTPExpired",
        message: "The OTP has expired. Please request a new one.",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        error: "InvalidOTP",
        message: "The provided OTP is incorrect.",
      });
    }

    // OTP is valid
    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully." });

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      error: "ServerError",
      message: "An error occurred during OTP verification.",
    });
  }
}
