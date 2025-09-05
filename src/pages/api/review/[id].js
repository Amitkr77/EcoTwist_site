import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import { authenticate } from "@/lib/rbacAuth";

export default async function handler(req, res) {
    await dbConnect();

    const user = await authenticate(req, res);
    if (!user) return; // auth failed, response sent from middleware

    const {
        query: { id },
        method,
        body,
    } = req;

    const sendError = (status, message) =>
        res.status(status).json({ success: false, message });

    try {
        switch (method) {
            case "GET": {
                const review = await Review.findById(id)
                    .populate("user", "name")
                    .populate("product", "name");

                if (!review) return sendError(404, "Review not found");

                return res.status(200).json({ success: true, data: review });
            }

            case "PUT": {
                const review = await Review.findById(id);
                if (!review) return sendError(404, "Review not found");

                if (user.role !== "admin" && review.user.toString() !== user.id) {
                    return sendError(403, "You are not authorized to update this review");
                }

                const updateData = { ...body };

                if (updateData.status === "published") {
                    updateData.moderatedAt = new Date();
                }

                const updatedReview = await Review.findByIdAndUpdate(id, updateData, {
                    new: true,
                    runValidators: true,
                });

                return res.status(200).json({ success: true, data: updatedReview });
            }

            case "DELETE": {
                const review = await Review.findById(id);
                if (!review) return sendError(404, "Review not found");

                if (user.role !== "admin" && review.user.toString() !== user.id) {
                    return sendError(403, "You are not authorized to delete this review");
                }

                await Review.findByIdAndDelete(id);
                return res.status(200).json({ success: true, message: "Review deleted" });
            }

            default:
                res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
                return sendError(405, `Method ${method} Not Allowed`);
        }
    } catch (error) {
        return sendError(400, error.message || "An error occurred");
    }
}

