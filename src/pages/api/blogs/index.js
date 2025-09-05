import dbConnect from "@/lib/mongodb";
import Blog from "@/models/BlogPost";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST" || req.method === "PUT") {
    try {
      const { _id, title, slug, excerpt, content, headerImage, tags, status, author, readTime } = req.body;

      if (!_id) {
        // Create new post
        const newPost = new Blog({
          title,
          slug,
          excerpt,
          content,
          headerImage,  
          tags,
          status,
          author,
          readTime,
        });
        await newPost.save();
        return res.status(201).json(newPost);
      } else {
        // Update existing post
        const updatedPost = await Blog.findByIdAndUpdate(
          _id,
          {
            title,
            slug,
            excerpt,
            content,
            headerImage,  
            tags,
            status,
            author,
            readTime,
          },
          { new: true }
        );

        if (!updatedPost) {
          return res.status(404).json({ message: "Post not found" });
        }

        return res.status(200).json(updatedPost);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "GET") {
    // List all posts
    try {
    const { status } = req.query;
    const filter = status ? { status } : {}; 
    const posts = await Blog.find(filter).sort({ createdAt: -1 });
      return res.status(200).json(posts);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch posts" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
