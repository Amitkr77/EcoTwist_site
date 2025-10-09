"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchUserProfile, removeFromWishlist } from "@/store/slices/userSlice";
import { addToCart } from "@/store/slices/cartSlice"; // Assumed cartSlice
import { FunnelIcon, Heart, Trash2, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import debounce from "lodash/debounce";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { profile, wishlist, status, error } = useSelector(
    (state) => state.user || {}
  );
  const {
    allIds,
    byId,
    status: productStatus,
  } = useSelector((state) => state.products || {});
  const [sortOption, setSortOption] = useState("added");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  console.log(wishlist);

  // Fetch user profile and wishlist
  useEffect(() => {
    const userId = localStorage.getItem("user-id");
    if (userId && status === "idle") {
      dispatch(fetchUserProfile(userId));
    }
  }, [dispatch, status]);

  // Handle errors
  useEffect(() => {
    if (status === "failed" && error) {
      toast.error(error);
      console.error("Wishlist error:", error);
    }
  }, [status, error]);

  // Extract categories from products
  const categories = useMemo(() => {
    if (productStatus !== "succeeded" || !allIds) return [];
    const cats = new Set();
    allIds.forEach((id) => {
      const prod = byId[id];
      if (prod?.categories) prod.categories.forEach((cat) => cats.add(cat));
    });
    return Array.from(cats).sort();
  }, [productStatus, allIds, byId]);

  // Validate selectedCategory
  useEffect(() => {
    if (selectedCategory !== "all" && !categories.includes(selectedCategory)) {
      setSelectedCategory("all");
      toast.warning("Invalid category selected. Reset to All.");
    }
  }, [selectedCategory, categories]);

  // Normalize product data from wishlist or products store
  const normalizedWishlist = useMemo(() => {
    if (!wishlist) return [];
    return wishlist.map((item) => {
      const id = typeof item.productId === "string" ? item.productId : item.productId?._id;
      const storedProduct = id ? byId[id] : null;
      return storedProduct || (typeof item.productId === "object" ? { ...item, ...item.productId } : item);
    });
  }, [wishlist, byId]);

  // Filter and sort wishlist items
  const filteredWishlist = useMemo(() => {
    if (productStatus !== "succeeded" && !normalizedWishlist.length) return [];

    return normalizedWishlist
      .filter((product) => {
        if (!product) return false;
        const matchesCategory =
          selectedCategory === "all" ||
          product.categories?.includes(selectedCategory);
        return matchesCategory;
      })
      .sort((a, b) => {
        const aPrice = a.price || Math.min(
          ...(a.variants?.map((v) => v.price || 0) || [0])
        );
        const bPrice = b.price || Math.min(
          ...(b.variants?.map((v) => v.price || 0) || [0])
        );
        switch (sortOption) {
          case "price-low-high":
            return aPrice - bPrice;
          case "price-high-low":
            return bPrice - aPrice;
          case "name":
            return (a.name || "").localeCompare(b.name || "");
          case "rating":
            return (b.ratingAverage || 0) - (a.ratingAverage || 0);
          case "added":
          default:
            return 0; // Maintain original order
        }
      });
  }, [normalizedWishlist, selectedCategory, sortOption, productStatus]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredWishlist.length / itemsPerPage);
  const paginatedWishlist = filteredWishlist.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    document
      .querySelector("#wishlist-grid")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const getProductId = (product) => {
    return product._id || (product.productId?._id) || product.productId || product.id;
  };

  const handleRemoveFromWishlist = (product) => {
    const userId = localStorage.getItem("user-id");
    const productId = getProductId(product);
    if (userId && productId) {
      dispatch(removeFromWishlist({ userId, productId }))
        .unwrap()
        .then(() => toast.success("Removed from wishlist"))
        .catch((err) => toast.error(err || "Failed to remove from wishlist"));
    }
  };

  const handleAddToCart = (product) => {
    const userId = localStorage.getItem("user-id");
    const productId = getProductId(product);
    if (userId && productId) {
      dispatch(addToCart({ userId, productId, quantity: 1 }))
        .unwrap()
        .then(() => toast.success("Added to cart"))
        .catch((err) => toast.error(err || "Failed to add to cart"));
    }
  };

  // Debounced URL update for filters
  const updateURL = useMemo(
    () =>
      debounce(() => {
        const query = new URLSearchParams();
        if (selectedCategory !== "all") query.set("category", selectedCategory);
        if (sortOption !== "added") query.set("sort", sortOption);
        router.push(`/wishlist?${query.toString()}`, { scroll: false });
      }, 300),
    [selectedCategory, sortOption, router]
  );

  useEffect(() => {
    updateURL();
    return () => updateURL.cancel();
  }, [selectedCategory, sortOption, updateURL]);

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
            Loading your wishlist...
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
            onClick={() =>
              dispatch(fetchUserProfile(localStorage.getItem("user-id")))
            }
            className="bg-red-600 dark:bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
            aria-label="Retry loading wishlist"
          >
            Retry Loading Wishlist
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-16 pb-16 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 min-h-screen">
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
            Your Wishlist
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
          >
            Curate your eco-friendly favorites and shop sustainably.
          </motion.p>
          <button
            onClick={() => router.push("/products")}
            className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/30 hover:bg-white/30 text-white transition-all"
            aria-label="Shop more products"
          >
            Continue Shopping
          </button>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside className="w-80 pr-8 sticky top-24 self-start">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
              >
                <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
                  Refine Your Wishlist
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

            {/* Main Content */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-8">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Showing{" "}
                  <span className="text-green-600 dark:text-green-400">
                    {filteredWishlist.length}
                  </span>{" "}
                  of {wishlist?.length || 0} wishlist items
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    Sort by:
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                      aria-label="Sort wishlist"
                    >
                      <option value="added">Recently Added</option>
                      <option value="price-low-high">Price: Low to High</option>
                      <option value="price-high-low">Price: High to Low</option>
                      <option value="name">Name</option>
                      <option value="rating">Rating</option>
                    </select>
                  </label>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {paginatedWishlist.length > 0 ? (
                  <motion.section
                    key="wishlist"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    id="wishlist-grid"
                    className="space-y-8"
                  >
                    <div
                      className={`grid gap-6 ${
                        viewMode === "grid"
                          ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                          : "grid-cols-1"
                      }`}
                    >
                      {paginatedWishlist.map((product, index) => (
                        <motion.div
                          key={getProductId(product)}
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -10, scale: 1.02 }}
                          className={`group relative overflow-hidden rounded-xl shadow-md bg-white dark:bg-gray-800 transition-all duration-300 ${
                            viewMode === "list" ? "flex gap-4 p-4" : "p-4"
                          }`}
                        >
                          {viewMode === "grid" ? (
                            <>
                              <img
                                src={product.imageUrl || (product.images?.[0]?.url)}
                                alt={product.name}
                                className="w-full h-48 object-cover rounded-md mb-2"
                              />
                              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                                {product.name}
                              </h3>
                              <p className="text-green-600 dark:text-green-400">
                                ₹{product.price || (product.variants?.[0]?.price) || "N/A"}
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="flex-shrink-0">
                                <img
                                  src={product.imageUrl || (product.images?.[0]?.url)}
                                  alt={product.name}
                                  className="w-32 h-32 object-cover rounded-md"
                                />
                              </div>
                              <div className="flex-grow">
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                                  {product.name}
                                </h3>
                                <p className="text-green-600 dark:text-green-400">
                                  ₹{product.price || (product.variants?.[0]?.price) || "N/A"}
                                </p>
                              </div>
                            </>
                          )}
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="p-2 bg-green-600 dark:bg-green-500 text-white rounded-full hover:bg-green-700 dark:hover:bg-green-600"
                              aria-label="Add to cart"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveFromWishlist(product)}
                              className="p-2 bg-red-600 dark:bg-red-500 text-white rounded-full hover:bg-red-700 dark:hover:bg-red-600"
                              aria-label="Remove from wishlist"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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
                      <Heart className="h-12 w-12 text-gray-400 dark:text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                      Your Wishlist is Empty
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Add some eco-friendly products to your wishlist!
                    </p>
                    <button
                      onClick={() => router.push("/products")}
                      className="bg-green-600 dark:bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                      aria-label="Shop now"
                    >
                      Shop Now
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

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="flex justify-between items-center mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredWishlist.length} items
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
                aria-label="Sort wishlist"
              >
                <option value="added">Sort</option>
                <option value="price-low-high">Price Low-High</option>
                <option value="price-high-low">Price High-Low</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          <div id="wishlist-grid" className="grid grid-cols-2 gap-4 mb-12">
            {paginatedWishlist.map((product, index) => (
              <motion.div
                key={getProductId(product)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-xl shadow-md bg-white dark:bg-gray-800 transition-all duration-300 p-4"
              >
                <img
                  src={product.imageUrl || (product.images?.[0]?.url)}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-md mb-2"
                />
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  {product.name}
                </h3>
                <p className="text-green-600 dark:text-green-400">
                  ₹{product.price || (product.variants?.[0]?.price) || "N/A"}
                </p>
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="p-2 bg-green-600 dark:bg-green-500 text-white rounded-full hover:bg-green-700 dark:hover:bg-green-600"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(product)}
                    className="p-2 bg-red-600 dark:bg-red-500 text-white rounded-full hover:bg-red-700 dark:hover:bg-red-600"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
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

        {/* Mobile Filter Overlay */}
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
                    <div>
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
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSortOption("added");
                    setShowFilters(false);
                  }}
                  className="w-full bg-green-600 dark:bg-green-500 text-white py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600"
                  aria-label="Clear filters"
                >
                  Clear Filters
                </button>
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

      {/* Footer Section */}
      <section className="bg-gradient-to-r from-green-800 to-emerald-900 dark:from-green-900 dark:to-emerald-950 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Your Eco-Friendly Wishlist
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Save your favorite sustainable products and make a difference with
            every purchase.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/30 hover:bg-white/30 text-white transition-all"
            aria-label="Shop more products"
          >
            Explore More Products
          </button>
        </div>
      </section>
    </main>
  );
}