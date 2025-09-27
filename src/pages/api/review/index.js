import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";
import User from "@/models/User";

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === "POST") {
        try {
            const { product, user, rating, title, body, status } = req.body;

            const data = {
                product,
                user,
                rating,
                title,
                body,
                status,
            };

            // Only set moderatedAt if review is published
            if (status === "published") {
                data.moderatedAt = new Date();
            }

            const review = await Review.create(data);

            // ✅ Recalculate product ratings
            await Product.recalculateRatings(review.product);

            return res.status(201).json({ success: true, data: review });
        } catch (error) {
            console.error("Error creating review:", error);

            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "You have already reviewed this product.",
                });
            }

            return res.status(400).json({
                success: false,
                message: error.message || "Something went wrong.",
            });
        }
    }
    if (req.method === "GET") {
        try {
            const { product, user, status } = req.query;

            const filter = {};
            if (product) filter.product = product;
            if (user) filter.user = user;
            if (status) filter.status = status;

            const reviews = await Review.find(filter)
                .sort({ createdAt: -1 }) // Newest first
                .populate("user", "name") // Optional: show reviewer name
                .populate("product", "name"); // Optional

            return res.status(200).json({ success: true, data: reviews });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    } else {
        res.setHeader("Allow", ["POST", "GET"]);
        return res
            .status(405)
            .json({ success: false, message: `Method ${req.method} Not Allowed` });
    }
}