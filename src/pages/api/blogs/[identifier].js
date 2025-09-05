import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";

export default async function handler(req, res) {
  await dbConnect();

  const {
    query: { identifier },
    method,
  } = req;

  switch (method) {
    case "GET":
      try {
        // Try slug first
        let blog = await BlogPost.findOne({ slug: identifier });
        if (!blog) {
          // Then try by ID
          blog = await BlogPost.findById(identifier);
        }

        if (!blog) {
          return res.status(404).json({ success: false, message: "Blog post not found" });
        }

        return res.status(200).json({ success: true, blog });
      } catch (error) {
        console.error("Error fetching blog post:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
      }

    case "DELETE":
      try {
        const deletedPost = await BlogPost.findByIdAndDelete(identifier);
        if (!deletedPost) {
          return res.status(404).json({ success: false, message: "Post not found" });
        }
        return res.status(200).json({ success: true, message: "Post deleted" });
      } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

    default:
      res.setHeader("Allow", ["GET", "DELETE"]);
      return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}
