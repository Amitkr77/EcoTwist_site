import authMiddleware from "@/lib/authMiddleware";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import Address from "@/models/Address";
import Order from "@/models/Order";
import Invoice from "@/models/Invoice";

export default async function handler(req, res) {
  // Get the user from the auth middleware
  const user = await authMiddleware(req, res);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  // Get the token from headers
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Get userId from URL params
  const { id } = req.query;

  // Connect to the database
  await dbConnect();

  try {
    if (req.method === "GET") {
      // Verify JWT token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      // Fetch user details with all related data
      const userToFetch = await User.findById(id)
        .populate({
          path: "wishlist",
          populate: {
            path: "items",
            populate: { path: "productId", select: "name images price slug variants" },
          },
        })
        .populate({
          path: "cart",
          populate: {
            path: "items",
            populate: { path: "productId", select: "name images price " },
          },
        })
        .populate({
          path: "address",
          select: "street city state country postalCode isDefault",
        })
        .populate({
          path: "orders",
          options: {
            sort: { createdAt: -1 },
            limit: 10,
          },
          populate: [
            {
              path: "invoice",
              model: "Invoice",
              select: "invoiceNumber totalAmount status paymentStatus createdAt",
            },
            {
              path: "items.productId",
              model: "Product",
              select: "name images hsnCode price category",
            },
          ],
        });

      if (!userToFetch) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if the logged-in user is trying to access their own profile or is an admin
      if (decoded.id !== userToFetch._id.toString() && decoded.role !== "admin") {
        return res.status(403).json({
          error: "Forbidden: You are not authorized to access this user profile",
        });
      }

      // Get additional stats using static methods
      const [totalSpent, orderStats] = await Promise.all([
        User.getTotalSpent(id).catch(() => 0), // Fallback to 0 if error
        User.getOrderStats(id).catch(() => []), // Fallback to empty array if error
      ]);

      // Sanitize the user object
      const userObj = userToFetch.toObject();
      delete userObj.password;
      delete userObj.__v;
      delete userObj.otp;
      delete userObj.otpExpiresAt;

      return res.status(200).json({
        message: "User profile fetched successfully",
        user: {
          ...userObj,
          totalSpent,
          orderStats,
          totalOrders: userObj.orders?.length || 0,
        },
      });
    }

    if (req.method === "PUT") {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by ID
      const userToUpdate = await User.findById(id);
      if (!userToUpdate) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check permissions (either the user itself or an admin can update)
      if (
        decoded.id !== userToUpdate._id.toString() &&
        decoded.role !== "admin"
      ) {
        return res
          .status(403)
          .json({
            error: "Forbidden: You are not authorized to update this user",
          });
      }

      // Extract fields to be updated
      const { email, firstName, lastName, phone } = req.body;

      // Prepare update object
      const updates = {};
      if (email) updates.email = email;
      if (firstName) updates.firstName = firstName;
      if (lastName) updates.lastName = lastName;
      if (phone) updates.phone = phone;

      // If no valid fields to update, return a message
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      // Update the user document
      Object.assign(userToUpdate, updates);
      await userToUpdate.save();

      // Sanitize user object before returning
      const userObj = userToUpdate.toObject();
      delete userObj.password;
      delete userObj.__v;

      return res.status(200).json({
        message: "User updated successfully",
        user: userObj,
      });
    }

    // Return 405 if method is not supported
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
