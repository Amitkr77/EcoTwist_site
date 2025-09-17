"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, MessageSquare, ChevronLeft, Calendar } from "lucide-react";
import moment from "moment";
import { motion } from "framer-motion";
import { toast } from "sonner"; // Assuming sonner for toasts
import parse from "html-react-parser"; // For parsing HTML content
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function BlogPostPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBlog() {
      try {
        setLoading(true);
        const res = await fetch(`/api/blogs/${slug}`);
        if (!res.ok) throw new Error("Blog post not found");
        const data = await res.json();
        setBlog(data.blog);

        // Fetch related posts based on category
        const relatedRes = await fetch(
          `/api/blogs?status=published&category=${encodeURIComponent(data.blog.category)}`
        );
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          // Exclude the current post
          setRelatedPosts(relatedData.filter((post) => post.slug !== slug).slice(0, 3));
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
        toast.error(err.message || "Failed to load blog post.");
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchBlog();
  }, [slug]);

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: blog.title,
      text: blog.excerpt,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      toast.error("Failed to share. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading eco-story...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <Card className="max-w-md p-6">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">Oops!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">{error || "Blog not found."}</p>
            <Button asChild className="mt-4 bg-green-600 hover:bg-green-700 text-white rounded-full">
              <Link href="/blog">Back to Blog</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-br from-green-50 via-white to-green-100 min-h-screen">
      {/* Sticky Breadcrumbs */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-green-100 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="flex items-center gap-1 text-green-700 hover:underline">
                  <ChevronLeft className="w-4 h-4" />
                  Home
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li>
                <Link href="/blog" className="text-green-700 hover:underline">
                  Blog
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-gray-800 truncate max-w-xs" aria-current="page">
                {blog.title}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <article className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header Section */}
          <div className="mb-8">
            <Badge className="mb-4 bg-green-700 text-white px-4 py-1 rounded-full shadow-md">
              {blog.category}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-green-900 mb-4 leading-tight">
              {blog.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {moment(blog.date).format("DD MMMM YYYY")}
              </span>
              <span>By {blog.author}</span>
              <span>{blog.readTime} min read</span>
            </div>
          </div>

          {/* Header Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg mb-8">
            <img
              src={blog.headerImage}
              alt={blog.title}
              className="w-full h-96 object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Blog Content */}
          <div className="prose prose-lg prose-green max-w-none text-slate-800 leading-relaxed">
            {parse(blog.content)} {/* Parse HTML or markdown content */}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2"
            >
              <Link href="/blog">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Blog
              </Link>
            </Button>
            <Button
              onClick={handleShare}
              className="bg-green-50 text-green-700 hover:bg-green-100 rounded-full px-6 py-2"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </motion.div>
      </article>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <h2 className="text-3xl font-bold text-green-900 mb-6">Related Eco-Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((post) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="group rounded-xl shadow-md border border-green-100 bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={post.headerImage}
                    alt={post.title}
                    className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Badge className="absolute top-2 left-2 bg-white/90 text-green-700 shadow px-2 py-0.5 text-xs">
                    {post.category}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-heading text-lg font-semibold text-green-900 mb-2 group-hover:text-green-700 transition">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{moment(post.date).format("DD MMM YYYY")}</span>
                    <Button
                      asChild
                      variant="link"
                      className="text-green-700 p-0 hover:underline"
                    >
                      <Link href={`/blog/${post.slug}`}>Read More</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Comments Section Placeholder */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-green-900">
              <MessageSquare className="w-5 h-5" />
              Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Join the conversation! Comments are coming soon. Stay tuned! 🌱
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Enhanced Newsletter Section */}
      <motion.section
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative py-20 text-center bg-gradient-to-r from-green-700 via-green-600 to-green-800 text-white rounded-t-3xl -mx-6 lg:-mx-0 lg:rounded-none lg:rounded-b-3xl"
      >
        <div className="absolute inset-0 opacity-5 bg-[url('/leaves-pattern.png')] bg-cover bg-center"></div>
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Join Our Eco-Community 🌱</h2>
            <p className="text-green-100 text-lg leading-relaxed">
              Stay inspired with weekly tips on sustainable living, fresh product updates,
              and exclusive eco-deals delivered straight to your inbox.
            </p>
            <form
              // onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mt-6"
            >
              <Input
                type="email"
                placeholder="Enter your email for green vibes"
                // value={newsletterEmail}
                // onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="rounded-full border-green-300/50 text-green-900 focus:ring-green-400 bg-white/90 placeholder-green-300 flex-1"
              />
              <Button 
                type="submit" 
                className="bg-white text-green-700 hover:bg-green-100 rounded-full px-8 py-3 font-semibold shadow-lg"
              >
                Subscribe Now
              </Button>
            </form>
            <p className="text-xs text-green-200 mt-2">
              No spam, ever. Unsubscribe anytime. 🌍
            </p>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}