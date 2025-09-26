import authMiddleware from '@/lib/authMiddleware';
import User from "@/models/User.js";
import dbConnect from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await dbConnect();

    const authData = await authMiddleware(req, res);
    if (!authData) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New password and confirmation do not match" });
    }

    const { userId } = authData;

    // Explicitly select the password field
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if password field exists
    if (!user.password) {
      return res.status(400).json({ error: "No password set for this user" });
    }

    // Use the model's comparePassword method
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Update password (hashing handled by User model's pre-save hook)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error in updatePassword:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}