import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs"
import { generateToken } from "@/lib/adminToken";
import cookie from 'cookie'

console.log("admin LoginPage..");


export default async function handler(req, res) {
    if (req.method != 'POST') return res.status(405).json({ message: "Method not allowed" })
    try {
        const { email, password } = req.body;
        await dbConnect();

        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(401).json({ message: "Email not found" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            admin.failedLoginAttempts += 1;
            await admin.save();
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = generateToken(admin);

        admin.lastLogin = new Date();
        // admin.failedLoginAttempts = 0;
        await admin.save();

        res.setHeader(
            "Set-Cookie",
            cookie.serialize("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24,
                sameSite: "strict",
                path: "/",
            })
        );

        res.status(200).json({
            success: true,
            admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
        });
    } catch (error) {
          console.error('Error in admin login :', error);
        res.status(500).json({ message: "Server error" });
    }
}