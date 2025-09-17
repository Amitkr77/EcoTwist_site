"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import moment from "moment";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search, Calendar, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner for toasts; adjust if using another lib

export default function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc"); // New: sorting state
  const [currentPage, setCurrentPage] = useState(1); // New: pagination
  const [loading, setLoading] = useState(false); // New: loading state
  const postsPerPage = 8; // New: configurable posts per page

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
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
          toast.error("Failed to load blog posts.");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while loading posts.");
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  // New: Sorting function
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (sortBy === "date-desc") return dateB - dateA;
    if (sortBy === "date-asc") return dateA - dateB;
    if (sortBy === "title-asc") return a.title.localeCompare(b.title);
    if (sortBy === "title-desc") return b.title.localeCompare(a.title);
    return 0;
  });

  const filteredPosts = sortedPosts.filter((post) => {
    const matchesCategory =
      activeCategory === "All" || post.category === activeCategory;
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // New: Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

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

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading eco-insights...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-br from-green-50 via-white to-green-100 min-h-screen">
      {/* Hero Section with Integrated Search and Controls */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        {/* Eco Background */}
        <div className="absolute inset-0 bg-[url('/nature-bg.jpg')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-green-50/90 via-white/80 to-green-100/95"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="bg-green-700 text-white px-5 py-2 rounded-full mb-6 text-sm shadow-md">
              🌿 EcoTwist Blog
            </Badge>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-green-900 mb-6 leading-tight">
              Insights & Eco-Stories
            </h1>
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto mb-8">
              Discover sustainability tips, real-world eco-impact, and conscious
              gifting ideas that make a difference 🌍.
            </p>
          </motion.div>

          {/* Integrated Search and Sort Controls */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search eco-friendly posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-full shadow-lg border-green-200 focus:ring-green-500"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 rounded-full border-green-200 focus:ring-green-500">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Latest
                  </div>
                </SelectItem>
                <SelectItem value="date-asc">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Oldest
                  </div>
                </SelectItem>
                <SelectItem value="title-asc">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Title A-Z
                  </div>
                </SelectItem>
                <SelectItem value="title-desc">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Title Z-A
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </div>
      </section>

      {/* Improved Breadcrumbs - Sticky Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-green-100 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between text-sm text-gray-600">
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
              <li className="text-gray-800 font-medium">Blog</li>
            </ol>
            <div className="text-sm text-slate-500">
              Showing {paginatedPosts.length} of {filteredPosts.length} posts
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content Grid - Improved Layout */}
      <div className="max-w-7xl mx-auto px-6 pb-24 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Blog Cards - Full Width on Mobile, Responsive Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {paginatedPosts.map((post) => (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="group rounded-2xl shadow-lg border border-green-100 bg-white overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100">
                    <img
                      src={post.headerImage}
                      alt={post.title}
                      className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/95 text-green-700 shadow-md px-3 py-1 text-xs font-medium">
                        {post.category}
                      </Badge>
                    </div>
                    {/* New: Quick Stats Badge */}
                    {post.views && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-green-600/80 text-white shadow-md px-2 py-1 text-xs">
                          {post.views} views
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-heading text-xl font-bold text-green-900 mb-3 group-hover:text-green-700 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 text-base mb-4 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500 mb-4">
                      <span>By {post.author}</span>
                      <span>{post.readTime} min read</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {moment(post.date).format("DD MMM YYYY")}
                      </span>
                      <Link href={`/blog/${post.slug}`}>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-2 shadow-md"
                          asChild
                        >
                          <span>Read More →</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* No Posts Message */}
            {paginatedPosts.length === 0 && !loading && (
              <div className="text-center py-12 col-span-full">
                <p className="text-gray-500 text-lg">No blogs found matching your criteria. Try adjusting your search or filters!</p>
              </div>
            )}

            {/* New: Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-full"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="rounded-full min-w-[40px]"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-full"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Improved Sticky Categories Sidebar */}
          <aside className="lg:col-span-1 sticky top-20 self-start h-fit bg-white border border-green-100 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-green-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Filters
            </h3>
            
            {/* Categories */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Categories</h4>
              <ul className="space-y-2">
                {categories.map((cat, index) => (
                  <li key={index}>
                    <button
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-4 py-2 rounded-xl transition-all font-medium ${
                        activeCategory === cat
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-green-50 text-green-800 hover:bg-green-100 hover:shadow-sm"
                      }`}
                    >
                      {cat} {cat !== "All" && `(${posts.filter(p => p.category === cat).length})`}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* New: Quick Links or Popular Posts Teaser */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">Popular</h4>
              <ul className="space-y-2">
                {sortedPosts.slice(0, 3).map((post) => (
                  <li key={post._id} className="text-xs">
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-green-700 hover:underline line-clamp-2"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Enhanced Newsletter Section */}
      {/* <motion.section
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
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mt-6"
            >
              <Input
                type="email"
                placeholder="Enter your email for green vibes"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
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
      </motion.section> */}
    </main>
  );
}