"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, MessageSquare, ChevronLeft, Calendar } from "lucide-react";
import moment from "moment";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import EnhancedBlogContent from "@/components/EnhancedBlogContent";
import { Skeleton } from "@/components/ui/skeleton"; // Add this import

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
        setError(null);

        // Fetch the main blog post
        const res = await fetch(`/api/blogs/${slug}`);
        if (!res.ok) {
          throw new Error("Blog post not found");
        }
        const data = await res.json();

        // Normalize the blog data to handle different field names
        const normalizedBlog = {
          ...data.blog,
          date:
            data.blog.date || data.blog.createdAt || new Date().toISOString(),
          readTime: data.blog.readTime || data.blog.readingTime || "5",
          excerpt: data.blog.excerpt || data.blog.description || "",
          category:
            data.blog.category || data.blog.categories?.[0] || "Uncategorized",
          author: data.blog.author || data.blog.authorName || "EcoTwist Team",
          title: data.blog.title || "Untitled Blog Post",
          headerImage:
            data.blog.headerImage ||
            data.blog.image ||
            "/placeholder-blog-image.jpg",
          content: data.blog.content || data.blog.body || "",
          tags: data.blog.tags || [],
        };

        setBlog(normalizedBlog);

        // Fetch related posts based on category
        const category = normalizedBlog.category;
        const relatedRes = await fetch(
          `/api/blogs?status=published&category=${encodeURIComponent(
            category
          )}&_limit=4`
        );
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          // Exclude the current post and limit to 3
          setRelatedPosts(
            relatedData
              .filter((post) => post.slug !== slug)
              .slice(0, 3)
              .map((post) => ({
                ...post,
                date: post.date || post.createdAt || new Date().toISOString(),
                readTime: post.readTime || post.readingTime || "5",
                excerpt: post.excerpt || post.description || "",
                category:
                  post.category || post.categories?.[0] || "Uncategorized",
                headerImage:
                  post.headerImage ||
                  post.image ||
                  "/placeholder-blog-image.jpg",
              }))
          );
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError(err.message || "Failed to load blog post");
        toast.error(err.message || "Failed to load blog post.");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  // Share functionality
  const handleShare = async () => {
    if (!blog) return;

    const shareData = {
      title: blog.title,
      text: blog.excerpt,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share error:", err);
      toast.error("Failed to share. Please try again.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-green-100 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
              <Skeleton className="h-4 w-64" />
            </nav>
          </div>
        </div>

        <article className="max-w-7xl mx-auto px-6 py-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-96 rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </article>
      </main>
    );
  }

  // Error state
  if (error || !blog) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="max-w-md w-full mx-auto">
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-2xl text-red-600 flex items-center gap-2">
                <span className="text-3xl">🌱</span>
                Oops!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 text-center">
                {error || "Blog not found."}
              </p>
              <Button
                asChild
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full"
              >
                <Link href="/blog">← Back to Blog</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
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
                <Link
                  href="/"
                  className="flex items-center gap-1 text-green-700 hover:underline transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Home
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-green-700 hover:underline transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li
                className="text-gray-800 truncate max-w-xs"
                aria-current="page"
                title={blog.title}
              >
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
          <header className="mb-8">
            <Badge className="mb-4 bg-green-700 text-white px-4 py-1 rounded-full shadow-md inline-flex items-center gap-1">
              <span className="text-xs">{blog.category}</span>
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-green-900 mb-4 leading-tight">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                {moment(blog.date).format("DD MMMM YYYY")}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-semibold">
                  {blog.author.charAt(0).toUpperCase()}
                </span>
                By {blog.author}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 text-green-600">⏱️</span>
                {blog.readTime} min read
              </span>
            </div>

            {/* Header Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg mb-8 bg-gray-100">
              <div className="relative w-full h-96">
                <Image
                  src={blog.headerImage}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  priority={true}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8Alt2YvSItK9G9Q3jY0J8A5x7/AAB/9k="
                  onError={(e) => {
                    console.warn(
                      "Blog header image failed to load:",
                      blog.headerImage
                    );
                    e.target.src = "/placeholder-blog-image.jpg";
                  }}
                />
                {/* Fallback overlay if needed */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="absolute top-4 right-4 flex flex-wrap gap-1">
                    {blog.tags.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-white/90 text-green-700 text-xs px-2 py-0.5 backdrop-blur-sm"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Blog Content - FIXED: Added blog prop */}
          <div className="prose-wrapper mb-8">
            <EnhancedBlogContent
              blog={blog} // ✅ Fixed: Added the blog prop
              className="max-w-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/blog" className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back to Blog
              </Link>
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-full px-6 py-2 transition-all duration-200"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Story
            </Button>
          </div>

          {/* Tags Section */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm">
                  #
                </span>
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="inline-block bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-100 dark:hover:bg-green-800 transition-colors duration-200"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </article>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-green-900 mb-6 flex items-center gap-3">
              <span className="text-green-600">🌿</span>
              Related Eco-Stories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((post, index) => (
                <motion.div
                  key={post._id || post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group rounded-xl shadow-md border border-green-100 bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative overflow-hidden h-48">
                    <Image
                      src={post.headerImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <Badge className="absolute top-3 left-3 bg-white/95 text-green-700 shadow-lg px-2 py-0.5 text-xs backdrop-blur-sm">
                      {post.category}
                    </Badge>
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-lg text-green-900 mb-2 leading-tight line-clamp-2 group-hover:text-green-700 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <span>{moment(post.date).format("DD MMM YYYY")}</span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-green-100 rounded-full"></span>
                        {post.readTime} min
                      </span>
                    </div>
                    <Button
                      asChild
                      variant="link"
                      className="text-green-700 p-0 h-auto text-sm font-medium hover:underline hover:text-green-600 transition-colors"
                    >
                      <Link
                        href={`/blog/${post.slug}`}
                        className="flex items-center gap-1"
                      >
                        Read More
                        <span className="ml-1 transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
    </main>
  );
}
