"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
// import { Link } from "lucide-react";
import moment from "moment";

export default function BlogPostPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await fetch(`/api/blogs/${slug}`);
        if (!res.ok) throw new Error("Blog post not found");
        const data = await res.json();
        setBlog(data.blog);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchBlog();
  }, [slug]);

  if (loading) return <p>Loading...</p>;
  if (!blog) return <p>Blog not found.</p>;

  return (
    <div className="max-w-4xl mx-auto py-30 px-4">
      <nav className="text-sm text-gray-500 mb-6">
        <ol className="list-reset flex">
         <li>
            <Link href="/" className="text-blue-600 hover:underline">
              Home
            </Link>
         </li>
         <li>
           <span className="mx-2">/</span>
         </li>
         <li>
            <Link href="/blog" className="text-blue-600 hover:underline">
              Blogs
            </Link>
          </li>
          <li>
           <span className="mx-2">/</span>
         </li>
          <li>
              {blog.excerpt}
          </li>
        </ol>
      </nav>

      <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
      <p className="text-slate-600 mb-2">{moment(blog.date).format("DD MMMM YYYY")}</p>
      <p className="text-slate-400 mb-4">By {blog.author}</p>
      <p className="text-slate-900 mb-6">{blog.excerpt}</p>
      <img src={blog.headerImage} alt={blog.title} className="rounded-lg mb-6" />
      <div className="text-lg text-slate-800 leading-relaxed">{blog.content}</div>
      {/* <div className="mt-6 hover:fade-in">
        <Link><Button>← Back to Blog</Button></Link>
        
      </div> */}
    </div>
  );
}
