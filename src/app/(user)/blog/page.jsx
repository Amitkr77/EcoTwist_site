"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      const res = await fetch("/api/blogs?status=published");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);

        const uniqueCategories = [
          "All",
          ...new Set(data.map((post) => post.category)),
        ];
        setCategories(uniqueCategories);
      } else {
        console.error("Failed to fetch blog posts.");
      }
    }
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      activeCategory === "All" || post.category === activeCategory;
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to subscribe");
      }

      toast.success("Subscribed to our newsletter! 🌱");
      setNewsletterEmail("");
    } catch (error) {
      toast.error(error.message || "Failed to subscribe. Please try again.");
    }
  };

  return (
    <main className="bg-gradient-to-br from-green-50 via-white to-green-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        {/* Eco Background */}
        <div className="absolute inset-0 bg-[url('/nature-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-green-50/80 via-white/70 to-green-100/90"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="bg-green-700 text-white px-5 py-2 rounded-full mb-6 text-sm shadow-md">
              🌿 EcoTwist Blog
            </Badge>

            <h1 className="font-heading text-5xl sm:text-6xl font-bold text-green-900 mb-6 leading-tight">
              Insights & Eco-Stories
            </h1>
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto">
              Discover sustainability tips, real-world eco-impact, and conscious
              gifting ideas that make a difference 🌍.
            </p>
          </motion.div>
        </div>

        {/* Search box */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative mt-12 max-w-lg mx-auto"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search eco-friendly posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 rounded-full shadow-lg border-green-200 focus:ring-green-500"
          />
        </motion.div>
      </section>

      {/* Breadcrumbs */}
      <div className="px-6 mb-8">
        <nav className="text-sm text-gray-600">
          <ol className="flex flex-wrap">
            <li>
              <Link href="/" className="text-green-700 hover:underline">
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

      {/* Blog + Categories */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-10 px-6 pb-24">
        {/* Blog Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {filteredPosts.map((post) => (
           <motion.article
  key={post._id}
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
  className="group rounded-xl shadow-md border border-green-100 bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all"
>
  <div className="relative overflow-hidden">
    <img
      src={post.headerImage}
      alt={post.title}
      className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-110"
    />
    <div className="absolute top-2 left-2">
      <Badge className="bg-white/90 text-green-700 shadow px-2 py-0.5 text-[10px]">
        {post.category}
      </Badge>
    </div>
  </div>

  <div className="p-4">
    <h3 className="font-heading text-lg font-semibold text-green-900 mb-2 group-hover:text-green-700 transition">
      {post.title}
    </h3>
    <p className="text-slate-600 text-sm mb-3 line-clamp-2">
      {post.excerpt}
    </p>

    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
      <span>By {post.author}</span>
      <span>{post.readTime}</span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-[11px] text-slate-400">
        {moment(post.date).format("DD MMM YYYY")}
      </span>
      <Link href={`/blog/${post.slug}`}>
        <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-3 py-1.5 text-sm">
          Read →
        </Button>
      </Link>
    </div>
  </div>
</motion.article>

          ))}

          {filteredPosts.length === 0 && (
            <p className="text-center col-span-full text-gray-500">
              No blogs found.
            </p>
          )}
        </div>

        {/* Categories */}
        <aside className="lg:col-span-1 bg-white border border-green-100 rounded-2xl shadow-lg p-6 h-fit">
          <h3 className="text-lg font-semibold text-green-900 mb-5">
            Categories
          </h3>
          <ul className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full transition font-medium shadow-sm ${
                    activeCategory === cat
                      ? "bg-green-600 text-white"
                      : "bg-green-50 text-green-800 hover:bg-green-100"
                  }`}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* Newsletter */}
      <motion.section
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative py-20 text-center bg-gradient-to-r from-green-700 via-green-600 to-green-800 text-white rounded-t-3xl"
      >
        <div className="absolute inset-0 opacity-10 bg-[url('/leaves-pattern.png')] bg-cover"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Join Our Eco-Community 🌱</h2>
          <p className="text-green-100 mb-6">
            Subscribe to receive tips on sustainable living, product updates,
            and exclusive offers.
          </p>
          <form
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="rounded-full border-green-300 text-green-900 focus:ring-green-400 bg-white"
            />
            <Button className="bg-white text-green-700 hover:bg-green-100 rounded-full px-6">
              Subscribe
            </Button>
          </form>
        </div>
      </motion.section>
    </main>
  );
}
