"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

export default function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      const res = await fetch("/api/blogs?status=published");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      } else {
        console.error("Failed to fetch blog posts.");
      }
    }
    fetchPosts();
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const result = await response.json();
      console.log(result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to subscribe");
      }

      toast.success(
        "Subscribed to our newsletter! Check your inbox for eco-tips."
      );
      setNewsletterEmail("");
    } catch (error) {
      toast.error(error.message || "Failed to subscribe. Please try again.");
      console.error("Newsletter subscription error:", error);
    }
  };

  return (
    <main className="container mx-auto mt-16 ">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-8 bg-gradient-to-br from-[#f1f8f4] to-white overflow-hidden">
        {/* Leaf SVG Behind Badge */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-10 w-32 sm:w-40 h-32 sm:h-40 pointer-events-none">
          <img
            src="/leaf-green.png"
            alt="leaf"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Text Content */}
        <div className="text-center relative z-10">
          <Badge className="bg-[#2E7D32] text-white px-4 py-1.5 rounded-full mb-4 sm:mb-6 text-xs sm:text-sm shadow-sm">
            EcoTwist Blog
          </Badge>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[#1B4332] mb-4 leading-tight">
            Insights & Stories
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Dive into sustainability tips, real-world impact, and stories that
            redefine the way we think about conscious corporate gifting.
          </p>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="p-4">
        <nav className="text-sm text-gray-500 mb-6 px-2">
          <ol className="list-reset flex flex-wrap">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Home
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-800 font-medium">Blog</li>
          </ol>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto ">
        {/* Blog Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 px-2">
          {posts.map((post) => (
            <article
              key={post._id}
              className="eco-card group cursor-pointer rounded-lg shadow-sm border border-slate-100 bg-white transition hover:shadow-md"
            >
              {/* Image */}
              <div className="relative overflow-hidden rounded-t-lg mb-3">
                <img
                  src={post.headerImage}
                  alt={post.title}
                  className="w-full h-36 sm:h-48 md:h-56 object-contain bg-slate-50 transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <Badge
                    variant="secondary"
                    className="bg-white/90 text-slate-700 text-xs px-2 py-0.5"
                  >
                    {post.category}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-heading text-lg font-semibold text-slate-800 mb-2 group-hover:text-forest transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-600 text-sm mb-3 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>By {post.author}</span>
                  <span>{post.readTime}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {moment(post.date).format("DD MMM YYYY")}
                  </span>
                  <Link href={`/blog/${post.slug}`}>
                    <Button
                      variant="ghost"
                      className="text-forest hover:text-forest-600 hover:bg-forest-50 p-0 text-sm"
                    >
                      Read More →
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Newsletter Signup */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-16 text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Join Our Eco-Community
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">
          Subscribe to receive tips on sustainable living, product updates, and
          exclusive offers.
        </p>
        <form
          onSubmit={handleNewsletterSubmit}
          className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
        >
          <Input
            type="email"
            placeholder="Enter your email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            required
            className="border-gray-200 dark:border-gray-700 focus:ring-green-500"
          />
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Subscribe
          </Button>
        </form>
      </motion.section>
    </main>
  );
}
