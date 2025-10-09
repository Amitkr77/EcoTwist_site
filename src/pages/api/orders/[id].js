import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Invoice from "@/models/Invoice";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/auth"; // you need to create this

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  try {
    // ✅ Step 1: Get token and decode user
    const token = req.cookies["user-token"];
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    let decodedUser;
    try {
      decodedUser = verifyToken(token); // contains userId, email, etc.
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const userId = decodedUser.id;

    if (req.method === "GET") {
      let searchQuery = {};

      if (mongoose.Types.ObjectId.isValid(id)) {
        searchQuery = { _id: id };
      } else {
        searchQuery = { orderId: id };
      }

      // ✅ Step 2: Fetch order and check user ownership
      const order = await Order.findOne(searchQuery)
        .populate({
          path: "invoice",
          select:
            "invoiceId issueDate billingAddress items subtotal tax shippingFee totalAmount paymentMethod paymentStatus gstDetails",
        })
        .lean();

      if (!order) {
        return res.status(404).json({ message: "Something went wrong!" });
      }

      if (order.userId?.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "Unauthorized access to order" });
      }


      return res.status(200).json(order);
    }

    // PUT - update
    else if (req.method === "PUT") {
      const { products, deliveryAddress, paymentMethod } = req.body;

      if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: "Products array is required" });
      }

      if (!paymentMethod) {
        return res.status(400).json({ message: "Payment method is required" });
      }

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId?.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "Unauthorized access to order" });
      }


      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        {
          products,
          deliveryAddress,
          paymentMethod,
        },
        { new: true }
      );

      return res
        .status(200)
        .json({ message: "Order updated successfully", order: updatedOrder });
    }

    // DELETE
    else if (req.method === "DELETE") {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId?.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "Unauthorized access to order" });
      }


      await Order.findByIdAndDelete(id);

      return res.status(200).json({ message: "Order deleted successfully" });
    }

    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
