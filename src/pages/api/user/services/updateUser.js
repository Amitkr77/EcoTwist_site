import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const token = req.headers.authorization?.split(" ")[1];
    const { id } = req.query;
    const { email, firstName, lastName, phone } = req.body;

    if (!token) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        await dbConnect();

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check permissions
        if (decoded.id !== user._id.toString() && decoded.role !== "admin") {
            return res.status(403).json({ error: "Unauthorized" });
        }

        // Safely update allowed fields
        const updates = {};
        if (email) updates.email = email;
        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (phone) updates.phone = phone;

        
        Object.assign(user, updates);
        await user.save();

        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.refreshToken;
        delete userObj.__v;

        return res.status(200).json({
            message: "User updated successfully",
            user: userObj,
        });
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
