import dbConnect from "@/lib/mongodb";
import { verifyToken } from "@/lib/adminToken";
import { hashPassword } from "@/lib/hashPassword"; 
import sendEmail from "@/lib/nodemailer/mail-handler";
import SalesManager from "@/models/salesManager";


function generatePassword(length = 12) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default async function handler(req, res) {
  await dbConnect();

  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (req.method === "GET") {
      // Fetch all sales managers
      const managers = await SalesManager.find().select("-password");
      return res.status(200).json({ success: true, managers });
    }

    if (req.method === "POST") {
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existing = await SalesManager.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const password = generatePassword();
      const hashedPassword = await hashPassword(password);

      const newManager = new SalesManager({ name, email, password: hashedPassword });
      await newManager.save();

      const emailHtml = `
  <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fafafa;">
    <h2 style="color: #333;">Hello ${name},</h2>

    <p style="font-size: 16px; color: #555;">
      <strong>Congratulations!</strong> 💐 on being appointed as Sales Manager of <strong>EcoTwist</strong> Below are the login credentials and steps to login:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <span style="display: inline-block; padding: 12px 24px; font-size: 24px; font-weight: bold; color: Black; border-radius: 5px;">
       <strong>Email:</strong>  ${email}
      </span>
      <span style="display: inline-block; padding: 12px 24px; font-size: 24px; font-weight: bold; color: Black; border-radius: 5px;">
       <strong>Password:</strong>  ${password}
      </span>
    </div>

    <p style="font-size: 14px; color: #888;">
      To change the password you can contact admin@example.com. If you did not request this, please ignore this email.
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
        subject: "Welcome Onboard",
        html: emailHtml
      });

      return res.status(201).json({
        success: true,
        manager: {
          id: newManager._id,
          name: newManager.name,
          email: newManager.email,
          password: password
        },
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
