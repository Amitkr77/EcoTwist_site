"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import moment from "moment";

export default function BlogListPage() {
  const [posts, setPosts] = useState([]);

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

  return (
    <main className="container mx-auto   sm:px-4 lg:px-6">
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

      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-forest/90 to-forest-dark/90 rounded-2xl p-6 sm:p-10 lg:p-20 max-w-4xl mx-auto relative overflow-hidden text-black">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6 drop-shadow-lg text-center">
          Stay Updated with{" "}
          <span className="text-green-800">Sustainability Insights</span>
        </h2>

        <p className="text-green-800 max-w-xl mx-auto mb-8 sm:mb-10 text-sm sm:text-base md:text-lg tracking-wide text-center">
          Join thousands of eco-conscious readers. Get exclusive updates on
          sustainable business, new eco products, and inspiring impact stories
          straight to your inbox.
        </p>

        <form className="flex flex-col sm:flex-row items-center gap-4 max-w-lg mx-auto w-full">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="Enter your email"
            required
            className="flex-1 w-full rounded-lg px-4 py-3 sm:px-5 sm:py-4 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-green-800 transition shadow-md"
          />
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-ochre to-ochre-dark hover:from-ochre-dark hover:to-ochre transition-all duration-300 rounded-lg px-6 sm:px-8 py-3 sm:py-4 text-green-800 font-semibold shadow-lg"
          >
            Subscribe
            <svg
              className="w-5 h-5 ml-2 -mr-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </form>
      </div>
    </main>
  );
}
