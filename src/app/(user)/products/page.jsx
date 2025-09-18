"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { fetchProducts } from "@/store/slices/productSlices";
import { FunnelIcon, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import debounce from "lodash/debounce"; // Ensure lodash is installed

export default function ProductsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, error, allIds, byId } = useSelector(
    (state) => state.products || {}
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortOption, setSortOption] = useState("relevance");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Read query parameters on mount
  useEffect(() => {
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "all";
    const tag = searchParams.get("tag")?.trim() || "all";
    const sort = searchParams.get("sort") || "relevance";
    const minPrice = parseInt(searchParams.get("minPrice")) || 0;
    const maxPrice = parseInt(searchParams.get("maxPrice")) || 1000;

    setSearchTerm(search);
    setSelectedCategory(category);
    setSelectedTag(tag);
    setSortOption(sort);
    setPriceRange({ min: minPrice, max: maxPrice });
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  // Handle errors
  useEffect(() => {
    if (status === "failed" && error) {
      toast.error(error || "Failed to load products.");
      console.error("Product fetch error:", error);
    }
  }, [status, error]);

  // Debounced URL update
  const updateURL = useMemo(
    () =>
      debounce(() => {
        const query = new URLSearchParams();
        if (searchTerm) query.set("search", searchTerm);
        if (selectedCategory !== "all") query.set("category", selectedCategory);
        if (selectedTag !== "all") query.set("tag", selectedTag);
        if (sortOption !== "relevance") query.set("sort", sortOption);
        if (priceRange.min !== 0)
          query.set("minPrice", priceRange.min.toString());
        if (priceRange.max !== 1000)
          query.set("maxPrice", priceRange.max.toString());
        router.push(`/products?${query.toString()}`, { scroll: false });
      }, 300),
    [searchTerm, selectedCategory, selectedTag, sortOption, priceRange, router]
  );

  useEffect(() => {
    updateURL();
    return () => updateURL.cancel(); // Cleanup debounce on unmount
  }, [
    searchTerm,
    selectedCategory,
    selectedTag,
    sortOption,
    priceRange,
    updateURL,
  ]);

  // Extract unique categories and tags
  const categories = useMemo(() => {
    if (status !== "succeeded" || !allIds) return [];
    const cats = new Set();
    allIds.forEach((id) => {
      const prod = byId[id];
      if (prod?.categories) prod.categories.forEach((cat) => cats.add(cat));
    });
    return Array.from(cats).sort();
  }, [status, allIds, byId]);

  const tags = useMemo(() => {
    if (status !== "succeeded" || !allIds) return [];
    const tg = new Set();
    allIds.forEach((id) => {
      const prod = byId[id];
      if (prod?.tags) prod.tags.forEach((tag) => tg.add(tag));
    });
    return Array.from(tg).sort();
  }, [status, allIds, byId]);

  // Validate selectedCategory
  useEffect(() => {
    if (selectedCategory !== "all" && !categories.includes(selectedCategory)) {
      setSelectedCategory("all");
      toast.warning("Invalid category selected. Reset to All.");
    }
  }, [selectedCategory, categories]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (status !== "succeeded" || !allIds) return [];

    return allIds
      .map((id) => byId[id])
      .filter((product) => {
        const matchesSearch =
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === "all" ||
          product.categories?.includes(selectedCategory);
        const matchesTag =
          selectedTag === "all" || product.tags?.includes(selectedTag);
        const matchesPrice =
          product.variants?.some((v) => {
            const price = v.price || 0;
            return price >= priceRange.min && price <= priceRange.max;
          }) || true;
        return matchesSearch && matchesCategory && matchesTag && matchesPrice;
      })
      .sort((a, b) => {
        const aPrice = Math.min(
          ...(a.variants?.map((v) => v.price || 0) || [0])
        );
        const bPrice = Math.min(
          ...(b.variants?.map((v) => v.price || 0) || [0])
        );
        switch (sortOption) {
          case "price-low-high":
            return aPrice - bPrice;
          case "price-high-low":
            return bPrice - aPrice;
          case "name":
            return a.name?.localeCompare(b.name || "") || 0;
          case "rating":
            return (b.ratingAverage || 0) - (a.ratingAverage || 0);
          default:
            return 0;
        }
      });
  }, [
    status,
    allIds,
    byId,
    searchTerm,
    selectedCategory,
    selectedTag,
    sortOption,
    priceRange,
  ]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document
      .querySelector("#products-grid")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  if (status === "loading") {
    return (
      <main className="pt-20 pb-16 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Discovering eco-friendly wonders...
          </p>
        </motion.div>
      </main>
    );
  }

  if (status === "failed") {
    return (
      <main className="pt-20 pb-16 min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900 dark:to-pink-900 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Oops! Something went wrong.
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "Unknown error"}
          </p>
          <button
            onClick={() => dispatch(fetchProducts())}
            className="bg-red-600 dark:bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
          >
            Retry Loading Products
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-16  bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-800 dark:to-emerald-900 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            Eco-Friendly Essentials
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
          >
            Discover sustainable products that blend innovation with the
            planet's well-being.
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for sustainable goodies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-gray-300"
                aria-label="Search products"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/30 hover:bg-white/30 transition-all"
              aria-label="Toggle filters"
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
            </button>
          </div>
        </div>
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full"
          animate={{ y: [0, -20, 0], rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full"
          animate={{ y: [0, 20, 0], rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </section>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <div className="flex gap-8">
            <aside className="w-80 pr-8 sticky top-24 self-start">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
              >
                <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
                  Refine Your Search
                </h3>

                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Categories
                  </h4>
                  <ul className="space-y-2">
                    {["all", ...categories].map((cat) => (
                      <li key={cat}>
                        <button
                          onClick={() => setSelectedCategory(cat)}
                          className={`w-full text-left py-2 px-3 rounded-lg transition-colors ${
                            selectedCategory === cat
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-medium"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                          aria-label={`Filter by ${
                            cat === "all" ? "All Categories" : cat
                          }`}
                        >
                          {cat === "all" ? "All Categories" : cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {["all", ...tags.slice(0, 6)].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedTag === tag
                            ? "bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                        aria-label={`Filter by ${
                          tag === "all" ? "All Tags" : tag
                        }`}
                      >
                        {tag === "all" ? "All Tags" : tag}
                      </button>
                    ))}
                    {tags.length > 6 && (
                      <button className="text-sm text-gray-500 dark:text-gray-400 underline">
                        + More
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Price Range (INR)
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({
                          ...priceRange,
                          min: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                      aria-label="Minimum price"
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({
                          ...priceRange,
                          max: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                      aria-label="Maximum price"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ₹{priceRange.min} - ₹{priceRange.max}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      viewMode === "grid"
                        ? "bg-green-600 text-white dark:bg-green-500"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                    aria-label="Switch to grid view"
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      viewMode === "list"
                        ? "bg-green-600 text-white dark:bg-green-500"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                    aria-label="Switch to list view"
                  >
                    List
                  </button>
                </div>
              </motion.div>
            </aside>

            <div className="flex-1">
              <div className="flex justify-between items-center mb-8">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Showing{" "}
                  <span className="text-green-600 dark:text-green-400">
                    {filteredProducts.length}
                  </span>{" "}
                  of {allIds?.length || 0} eco-friendly products
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    Sort by:
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                      aria-label="Sort products"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price-low-high">Price: Low to High</option>
                      <option value="price-high-low">Price: High to Low</option>
                      <option value="name">Name</option>
                      <option value="rating">Rating</option>
                    </select>
                  </label>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {paginatedProducts.length > 0 ? (
                  <motion.section
                    key="products"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    id="products-grid"
                    className="space-y-8"
                  >
                    <div
                      className={`grid gap-6 ${
                        viewMode === "grid"
                          ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                          : "grid-cols-1"
                      }`}
                    >
                      {paginatedProducts.map((product, index) => (
                        <motion.div
                          key={product._id}
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -10, scale: 1.02 }}
                          className={`group relative overflow-hidden rounded-xl shadow-md bg-white dark:bg-gray-800 transition-all duration-300 ${
                            viewMode === "list" ? "flex gap-4 p-4" : ""
                          }`}
                        >
                          <ProductCard product={product} viewMode={viewMode} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                ) : (
                  <motion.section
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24"
                  >
                    <div className="inline-block p-8 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
                      <Search className="h-12 w-12 text-gray-400 dark:text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Try adjusting your filters or search terms.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("all");
                        setSelectedTag("all");
                        setSortOption("relevance");
                        setPriceRange({ min: 0, max: 1000 });
                      }}
                      className="bg-green-600 dark:bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                      aria-label="Clear all filters"
                    >
                      Clear All Filters
                    </button>
                  </motion.section>
                )}
              </AnimatePresence>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    aria-label="Previous page"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded ${
                          currentPage === page
                            ? "bg-green-600 text-white dark:bg-green-500"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                        aria-label={`Go to page ${page}`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="lg:hidden">
          <div className="flex justify-between items-center mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredProducts.length} products
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(true)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                aria-label="Open filters"
              >
                <FunnelIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                aria-label="Sort products"
              >
                <option value="relevance">Sort</option>
                <option value="price-low-high">Price Low-High</option>
                <option value="price-high-low">Price High-Low</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          <div id="products-grid" className="grid grid-cols-2 gap-4 mb-12">
            {paginatedProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <ProductCard product={product} viewMode="grid" />
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg disabled:opacity-50"
                aria-label="Go to first page"
              >
                1
              </button>
              {currentPage > 2 && (
                <span className="text-gray-600 dark:text-gray-400">...</span>
              )}
              <button
                onClick={() => handlePageChange(currentPage)}
                className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg"
                aria-label={`Current page ${currentPage}`}
              >
                {currentPage}
              </button>
              {currentPage < totalPages - 1 && (
                <span className="text-gray-600 dark:text-gray-400">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg disabled:opacity-50"
                aria-label="Go to last page"
              >
                {totalPages}
              </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 lg:hidden"
              onClick={() => setShowFilters(false)}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", bounce: 0.3 }}
                className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    Filters
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label="Close filters"
                  >
                    Close
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">
                      Categories
                    </h4>
                    {["all", ...categories].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setShowFilters(false);
                        }}
                        className={`block w-full text-left py-2 px-3 rounded-lg mb-1 ${
                          selectedCategory === cat
                            ? "bg-green-100 dark:bg-green-900"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        aria-label={`Filter by ${
                          cat === "all" ? "All Categories" : cat
                        }`}
                      >
                        {cat === "all" ? "All" : cat}
                      </button>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {["all", ...tags.slice(0, 6)].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            setSelectedTag(tag);
                            setShowFilters(false);
                          }}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            selectedTag === tag
                              ? "bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                          aria-label={`Filter by ${
                            tag === "all" ? "All Tags" : tag
                          }`}
                        >
                          {tag === "all" ? "All Tags" : tag}
                        </button>
                      ))}
                      {tags.length > 6 && (
                        <button className="text-sm text-gray-500 dark:text-gray-400 underline">
                          + More
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">
                      Price Range (INR)
                    </h4>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            min: parseInt(e.target.value),
                          })
                        }
                        className="w-full"
                        aria-label="Minimum price"
                      />
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            max: parseInt(e.target.value),
                          })
                        }
                        className="w-full"
                        aria-label="Maximum price"
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ₹{priceRange.min} - ₹{priceRange.max}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setSelectedTag("all");
                      setSortOption("relevance");
                      setPriceRange({ min: 0, max: 1000 });
                      setShowFilters(false);
                    }}
                    className="w-full bg-green-600 dark:bg-green-500 text-white py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600"
                    aria-label="Clear all filters"
                  >
                    Clear Filters
                  </button>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* <section className="bg-gradient-to-r from-green-800 to-emerald-900 dark:from-green-900 dark:to-emerald-950 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Why Choose Sustainable?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Every product here is crafted with the earth in mind. From
            biodegradable materials to refillable designs, we're reducing waste
            one purchase at a time.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div whileHover={{ scale: 1.05 }} className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌿</span>
              </div>
              <h3 className="font-semibold mb-2">Eco-Materials</h3>
              <p className="text-sm opacity-90">
                100% biodegradable where possible.
              </p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">♻️</span>
              </div>
              <h3 className="font-semibold mb-2">Refillable</h3>
              <p className="text-sm opacity-90">
                Minimize waste with reusable options.
              </p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="font-semibold mb-2">Ethical Brands</h3>
              <p className="text-sm opacity-90">Support brands that care.</p>
            </motion.div>
          </div>
        </div>
      </section> */}
    </main>
  );
}
