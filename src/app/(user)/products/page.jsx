"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { fetchProducts } from "@/store/slices/productSlices";
import { FiStar, FiClock, FiGift } from "react-icons/fi";
import {
  FunnelIcon,
  Search,
  X,
  Zap,
  IndianRupee,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function ProductsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, error, allIds, byId } = useSelector(
    (state) => state.products || {}
  );
  const wishlist = useSelector((state) => state.user.wishlist || []);

  // Core states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortOption, setSortOption] = useState("relevance");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterProgress, setFilterProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Active filters for chips
  const activeFilters = useMemo(
    () => [
      ...(searchTerm
        ? [{ id: "search", label: "Search", value: searchTerm }]
        : []),
      ...(selectedCategory !== "all"
        ? [{ id: "category", label: "Category", value: selectedCategory }]
        : []),
      ...(selectedTag !== "all"
        ? [{ id: "tag", label: "Tag", value: selectedTag }]
        : []),
      ...(sortOption !== "relevance"
        ? [
            {
              id: "sort",
              label: "Sort",
              value: sortOption.replace(/-/g, " "), // Apply replace to sortOption string
            },
          ]
        : []),
      ...(priceRange.min > 0 || priceRange.max < 1000
        ? [
            {
              id: "price",
              label: "Price",
              value: `₹${priceRange.min}-${priceRange.max}`,
            },
          ]
        : []),
    ],
    [searchTerm, selectedCategory, selectedTag, sortOption, priceRange]
  );

  // Debounced URL updater
  const updateURL = useMemo(
    () =>
      debounce((params) => {
        if (!router) return;
        setIsFiltering(true);
        setFilterProgress(0);
        const progressInterval = setInterval(() => {
          setFilterProgress((prev) => Math.min(prev + 20, 80));
        }, 100);

        const query = new URLSearchParams();
        if (params.search) query.set("search", params.search);
        if (params.category && params.category !== "all")
          query.set("category", params.category);
        if (params.tag && params.tag !== "all") query.set("tag", params.tag);
        if (params.sort && params.sort !== "relevance")
          query.set("sort", params.sort);
        if (params.minPrice && params.minPrice > 0)
          query.set("minPrice", params.minPrice.toString());
        if (params.maxPrice && params.maxPrice < 1000)
          query.set("maxPrice", params.maxPrice.toString());
        if (params.page && params.page > 1)
          query.set("page", params.page.toString());

        const url = `/products?${query.toString()}`;
        router.push(url, { scroll: false });

        setTimeout(() => {
          clearInterval(progressInterval);
          setFilterProgress(100);
          setTimeout(() => {
            setIsFiltering(false);
            setFilterProgress(0);
          }, 300);
        }, 300);
      }, 300),
    [router]
  );

  // Sync query params
  useEffect(() => {
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams.toString());
    const newSearch = params.get("search")?.trim() || "";
    const newCategory = params.get("category")?.trim() || "all";
    const newTag = params.get("tag")?.trim() || "all";
    const newSort = params.get("sort") || "relevance";
    const newMinPrice = parseInt(params.get("minPrice") || "0") || 0;
    const newMaxPrice = parseInt(params.get("maxPrice") || "1000") || 1000;
    const newPage = parseInt(params.get("page") || "1") || 1;

    setSearchTerm((prev) => {
      if (prev !== newSearch) {
        setCurrentPage(1);
      }
      return prev !== newSearch ? newSearch : prev;
    });

    setSelectedCategory((prev) => {
      if (prev !== newCategory) {
        setCurrentPage(1);
      }
      return prev !== newCategory ? newCategory : prev;
    });

    setSelectedTag((prev) => {
      if (prev !== newTag) {
        setCurrentPage(1);
      }
      return prev !== newTag ? newTag : prev;
    });

    setSortOption((prev) => {
      if (prev !== newSort) {
        setCurrentPage(1);
      }
      return prev !== newSort ? newSort : prev;
    });

    setPriceRange((prev) => {
      if (prev.min !== newMinPrice || prev.max !== newMaxPrice) {
        setCurrentPage(1);
      }
      return prev.min !== newMinPrice || prev.max !== newMaxPrice
        ? { min: newMinPrice, max: newMaxPrice }
        : prev;
    });

    setCurrentPage((prev) => (prev !== newPage ? newPage : prev));
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  // Load recentlyViewed from localStorage
  useEffect(() => {
    try {
      const savedViewed = localStorage.getItem("recentlyViewed");
      if (savedViewed) {
        const parsed = JSON.parse(savedViewed);
      }
    } catch (error) {
      console.error("Error loading recentlyViewed:", error);
    }
  }, []);

  // Migrate existing localStorage wishlist
  useEffect(() => {
    const migrateWishlist = async () => {
      const token = localStorage.getItem("user-token");
      if (!token) return;
      const savedWishlist = localStorage.getItem("wishlist");
      if (savedWishlist) {
        try {
          const parsed = JSON.parse(savedWishlist);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const response = await axios.post(
              "/api/wishlist/bulk",
              { productIds: parsed },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            dispatch(updateWishlist(response.data?.wishlist?.items || []));
            localStorage.removeItem("wishlist");
          }
        } catch (error) {
          console.error("Wishlist migration failed", error);
          toast.error("Failed to migrate wishlist");
        }
      }
    };
    migrateWishlist();
  }, [dispatch]);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (updateURL) {
        updateURL.cancel();
      }
    };
  }, [updateURL]);

  // Filter handlers
  const handleSearchChange = useCallback(
    (value) => {
      setSearchTerm(value);
      setCurrentPage(1);
      if (updateURL) {
        updateURL({
          search: value,
          category: selectedCategory,
          tag: selectedTag,
          sort: sortOption,
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
          page: 1,
        });
      }
    },
    [selectedCategory, selectedTag, sortOption, priceRange, updateURL]
  );

  const handleCategoryChange = useCallback(
    (category) => {
      setSelectedCategory(category);
      setCurrentPage(1);
      if (updateURL) {
        updateURL({
          search: searchTerm,
          category,
          tag: selectedTag,
          sort: sortOption,
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
          page: 1,
        });
      }
    },
    [searchTerm, selectedTag, sortOption, priceRange, updateURL]
  );

  const handleTagChange = useCallback(
    (tag) => {
      setSelectedTag(tag);
      setCurrentPage(1);
      if (updateURL) {
        updateURL({
          search: searchTerm,
          category: selectedCategory,
          tag,
          sort: sortOption,
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
          page: 1,
        });
      }
    },
    [searchTerm, selectedCategory, sortOption, priceRange, updateURL]
  );

  const handleSortChange = useCallback(
    (sort) => {
      setSortOption(sort);
      setCurrentPage(1);
      if (updateURL) {
        updateURL({
          search: searchTerm,
          category: selectedCategory,
          tag: selectedTag,
          sort,
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
          page: 1,
        });
      }
    },
    [searchTerm, selectedCategory, selectedTag, priceRange, updateURL]
  );

  const handlePriceChange = useCallback(
    (newRange) => {
      const validRange = {
        min: Math.max(0, Math.min(newRange.min, newRange.max - 1)),
        max: Math.min(1000, Math.max(newRange.max, newRange.min + 1)),
      };
      setPriceRange(validRange);
      setCurrentPage(1);
      if (updateURL) {
        updateURL({
          search: searchTerm,
          category: selectedCategory,
          tag: selectedTag,
          sort: sortOption,
          minPrice: validRange.min,
          maxPrice: validRange.max,
          page: 1,
        });
      }
    },
    [searchTerm, selectedCategory, selectedTag, sortOption, updateURL]
  );

  // Remove filter chip
  const removeFilter = useCallback(
    (filterId) => {
      switch (filterId) {
        case "search":
          handleSearchChange("");
          break;
        case "category":
          handleCategoryChange("all");
          break;
        case "tag":
          handleTagChange("all");
          break;
        case "sort":
          handleSortChange("relevance");
          break;
        case "price":
          handlePriceChange({ min: 0, max: 1000 });
          break;
      }
    },
    [
      handleSearchChange,
      handleCategoryChange,
      handleTagChange,
      handleSortChange,
      handlePriceChange,
    ]
  );

  // Smart presets
  const applyPreset = useCallback(
    (preset) => {
      let needsUpdate = false;

      if (
        preset.filters.category &&
        preset.filters.category !== selectedCategory
      ) {
        handleCategoryChange(preset.filters.category);
        needsUpdate = true;
      }
      if (preset.filters.tag && preset.filters.tag !== selectedTag) {
        handleTagChange(preset.filters.tag);
        needsUpdate = true;
      }
      if (
        preset.filters.maxPrice &&
        preset.filters.maxPrice !== priceRange.max
      ) {
        handlePriceChange({ min: 0, max: preset.filters.maxPrice });
        needsUpdate = true;
      }
      if (preset.filters.sort && preset.filters.sort !== sortOption) {
        handleSortChange(preset.filters.sort);
        needsUpdate = true;
      }

      if (needsUpdate) {
        setCurrentPage(1);
      }
    },
    [
      selectedCategory,
      selectedTag,
      priceRange.max,
      sortOption,
      handleCategoryChange,
      handleTagChange,
      handlePriceChange,
      handleSortChange,
    ]
  );

  // Categories and tags with counts
  const categories = useMemo(() => {
    if (status !== "succeeded" || !allIds?.length) return [];
    const countMap = {};
    allIds.forEach((id) => {
      const prod = byId[id];
      if (prod?.categories?.length) {
        prod.categories.forEach((cat) => {
          countMap[cat] = (countMap[cat] || 0) + 1;
        });
      }
    });
    return Object.entries(countMap)
      .map(([cat, count]) => ({ name: cat, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [status, allIds, byId]);

  const tags = useMemo(() => {
    if (status !== "succeeded" || !allIds?.length) return [];
    const countMap = {};
    allIds.forEach((id) => {
      const prod = byId[id];
      if (prod?.tags?.length) {
        prod.tags.forEach((tag) => {
          countMap[tag] = (countMap[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(countMap)
      .map(([tag, count]) => ({ name: tag, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [status, allIds, byId]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (status !== "succeeded" || !allIds?.length) return [];

    return allIds
      .map((id) => byId[id])
      .filter((product) => {
        const matchesSearch =
          !searchTerm ||
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
          }) ||
          (priceRange.min === 0 && priceRange.max === 1000);
        return matchesSearch && matchesCategory && matchesTag && matchesPrice;
      })
      .sort((a, b) => {
        const aPrice = Math.min(
          ...(a.variants?.map((v) => v.price || Infinity) || [Infinity])
        );
        const bPrice = Math.min(
          ...(b.variants?.map((v) => v.price || Infinity) || [Infinity])
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
          case "newest":
            return (
              new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime() || 0
            );
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

  // Get count for specific category/tag
  const getCategoryCount = useCallback(
    (cat) => {
      if (cat === "all") return filteredProducts.length;
      return categories.find((c) => c.name === cat)?.count || 0;
    },
    [categories, filteredProducts.length]
  );

  // Validate filters
  useEffect(() => {
    if (
      selectedCategory !== "all" &&
      !categories.some((c) => c.name === selectedCategory)
    ) {
      handleCategoryChange("all");
      toast.warning("Category no longer available.");
    }
    if (selectedTag !== "all" && !tags.some((t) => t.name === selectedTag)) {
      handleTagChange("all");
      toast.warning("Tag no longer available.");
    }
  }, [
    categories,
    tags,
    selectedCategory,
    selectedTag,
    handleCategoryChange,
    handleTagChange,
  ]);

  // Paginated products
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filter suggestions
  const suggestions = useMemo(() => {
    if (!searchTerm) return [];
    return [
      {
        icon: "🗂️",
        text: "Kitchen essentials",
        action: () => handleCategoryChange("kitchen"),
      },
      {
        icon: "🏷️",
        text: "Under ₹500",
        action: () => handlePriceChange({ min: 0, max: 500 }),
      },
    ].filter((s) => s.text.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, handleCategoryChange, handlePriceChange]);

  // Presets
  const presets = [
    {
      label: "Budget Friendly",
      icon: <IndianRupee />,
      filters: { maxPrice: 500 },
    },
    { label: "Best Sellers", icon: <FiStar />, filters: { sort: "rating" } },
    { label: "New Arrivals", icon: <FiClock />, filters: { sort: "newest" } },
    {
      label: "Eco Gifts",
      icon: <FiGift />,
      filters: { category: "gifts", tags: ["eco-friendly"] },
    },
  ];

  // Clear all
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedTag("all");
    setSortOption("relevance");
    setPriceRange({ min: 0, max: 1000 });
    setCurrentPage(1);
    if (updateURL) {
      updateURL({
        search: "",
        category: "all",
        tag: "all",
        sort: "relevance",
        minPrice: 0,
        maxPrice: 1000,
        page: 1,
      });
    }
  }, [updateURL]);

  // Handle errors
  useEffect(() => {
    if (status === "failed" && error) {
      toast.error(error || "Failed to load products.");
    }
  }, [status, error]);

  // EARLY RETURNS
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

  const allCategories = ["all", ...categories.map((c) => c.name)];

  // MAIN RENDER
  return (
    <main className="pt-16 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 min-h-screen">
      {/* Hero Section */}
      <section className="relative  flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 dark:from-green-800 dark:via-emerald-800 dark:to-teal-900 text-white py-16">
        {/* Subtle Eco Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>

        {/* Dark Overlay for Depth */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Enhanced Background Animations */}
        <motion.div
          className="absolute top-20 left-10 w-24 h-24 bg-white/15 rounded-full backdrop-blur-sm border border-white/20"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-36 h-36 bg-white/10 rounded-full backdrop-blur-sm border border-white/30"
          animate={{
            y: [0, 30, 0],
            rotate: [0, -180, -360],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-8 w-16 h-16 bg-emerald-200/20 rounded-full backdrop-blur-sm"
          animate={{ x: [-15, 15, -15], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-12 w-20 h-20 bg-teal-100/15 rounded-full backdrop-blur-sm"
          animate={{
            x: [10, -10, 10],
            y: [0, -15, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl">
          {/* Title */}
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-4 sm:mb-6 tracking-tight"
          >
            Eco-Friendly{" "}
            <span className="bg-gradient-to-r from-white/90 to-emerald-100/90 bg-clip-text text-transparent px-2 sm:px-3 py-1 rounded-md shadow-lg">
              Essentials
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed text-white/95 font-light"
          >
            Discover sustainable products that blend innovation with the
            planet's well-being.
          </motion.p>

          {/* Enhanced Search Container */}
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto relative"
          >
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
              <input
                type="text"
                placeholder="Search for sustainable goodies..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 text-white placeholder-white/70 font-medium text-sm sm:text-base transition-all duration-300 hover:border-white/30"
                aria-label="Search products"
              />
              {searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSearchChange("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              )}
            </div>

            {/* Filter Suggestions Dropdown */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full left-0 w-full sm:w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-2xl z-20 p-1 max-h-64 overflow-y-auto mt-2"
                >
                  {suggestions.map((suggestion, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{
                        x: 4,
                        backgroundColor: "rgba(34,197,94,0.1)",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        suggestion.action();
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 text-sm font-medium transition-all duration-200"
                    >
                      <span className="flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                        {suggestion.icon}
                      </span>
                      <span className="truncate text-gray-800 dark:text-gray-200">
                        {suggestion.text}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Progress Bar */}
        {/* <AnimatePresence>
          {isFiltering && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                <div className="animate-spin h-4 w-4 border-b-2 border-green-600 rounded-full"></div>
                <span>Updating results ({filterProgress}%)</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-green-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${filterProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence> */}

        {/* Active Filter Chips */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              {activeFilters.map((filter, index) => (
                <motion.button
                  key={filter.id}
                  initial={{ opacity: 0, scale: 0.9, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => removeFilter(filter.id)}
                  className="group flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 hover:scale-105"
                >
                  <span className="truncate max-w-24">
                    {filter.label}: {filter.value}
                  </span>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="ml-1 h-3 w-3 rounded-full bg-red-500 group-hover:bg-red-600"
                  />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="w-80 pr-8 sticky top-24 self-start">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 space-y-6"
              >
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Refine Your Search
                </h3>

                {/* Quick Filter Presets */}
                <section className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-200/50 dark:border-green-800/50">
                  <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    Quick Filters
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {presets.map((preset, idx) => (
                      <motion.button
                        key={preset.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => applyPreset(preset)}
                        whileHover={{ scale: 1.02 }}
                        className="flex flex-col items-center gap-1 p-3 rounded-lg bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all duration-200 border border-gray-200 dark:border-gray-600"
                      >
                        <span className="text-2xl">{preset.icon}</span>
                        <span className="text-xs text-center text-gray-600 dark:text-gray-300 line-clamp-2">
                          {preset.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </section>

                {/* Categories */}

                <section className="relative">
                  <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Categories
                  </h4>

                  {/* Custom Dropdown Trigger */}
                  <div
                    className={`w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm cursor-pointer flex justify-between items-center transition-all duration-200 hover:shadow-md ${
                      isOpen ? "rounded-b-none shadow-lg" : ""
                    }`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Select category"
                  >
                    <span>
                      {selectedCategory === "all"
                        ? "All Categories"
                        : selectedCategory}{" "}
                    </span>
                    {isOpen ? (
                      <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                    )}
                  </div>

                  {/* Custom Dropdown Options */}
                  {isOpen && (
                    <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-b-md shadow-lg max-h-60 overflow-y-auto mt-0">
                      {allCategories.map((cat) => (
                        <li key={cat}>
                          <button
                            onClick={() => {
                              handleCategoryChange(cat);
                              setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-600 transition-colors duration-150 flex justify-between items-center ${
                              selectedCategory === cat
                                ? "bg-green-50 dark:bg-green-900/20 border-l-2 border-green-500"
                                : ""
                            }`}
                          >
                            <span>
                              {cat === "all" ? "All Categories" : cat}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Backdrop to close on outside click (optional enhancement) */}
                  {isOpen && (
                    <div
                      className="fixed inset-0 z-0"
                      onClick={() => setIsOpen(false)}
                    />
                  )}
                </section>

                {/* Price Range */}
                <section>
                  <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Price Range (₹)
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 font-medium">
                      <span>₹{priceRange.min}</span>
                      <span>₹{priceRange.max}</span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange.min}
                        onChange={(e) =>
                          handlePriceChange({
                            ...priceRange,
                            min: Math.min(
                              parseInt(e.target.value),
                              priceRange.max - 1
                            ),
                          })
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange.max}
                        onChange={(e) =>
                          handlePriceChange({
                            ...priceRange,
                            max: Math.max(
                              parseInt(e.target.value),
                              priceRange.min + 1
                            ),
                          })
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Min Price</span>
                      <span>Max Price</span>
                    </div>
                  </div>
                </section>

                {/* View Toggle */}
                <section>
                  <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">
                    View
                  </h4>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => setViewMode("grid")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 ${
                        viewMode === "grid"
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 inline mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Grid
                    </motion.button>
                    <motion.button
                      onClick={() => setViewMode("list")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 ${
                        viewMode === "list"
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 inline mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      List
                    </motion.button>
                  </div>
                </section>

                <motion.button
                  onClick={clearAllFilters}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Clear All Filters
                </motion.button>
              </motion.div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Showing{" "}
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    {displayedProducts.length}
                  </span>{" "}
                  of {allIds?.length || 0} eco-friendly products
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    Sort by:
                    <select
                      value={sortOption}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price-low-high">Price: Low to High</option>
                      <option value="price-high-low">Price: High to Low</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="rating">Rating</option>
                      <option value="newest">Newest</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Products Grid */}
              <AnimatePresence mode="wait">
                {displayedProducts.length > 0 ? (
                  <motion.section
                    key="products"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div
                      className={`grid gap-6 ${
                        viewMode === "grid"
                          ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                          : "grid-cols-1"
                      }`}
                    >
                      {displayedProducts.map((product, index) => (
                        <motion.div
                          key={product._id}
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02, duration: 0.4 }}
                          whileHover={{ y: -8, scale: 1.02 }}
                          className={`group relative overflow-hidden rounded-xl shadow-md bg-white dark:bg-gray-800 transition-all duration-300 ${
                            viewMode === "list" ? "flex gap-4 p-4" : ""
                          }`}
                        >
                          <ProductCard product={product} viewMode={viewMode} />
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-center items-center gap-4 mt-8"
                    >
                      <motion.button
                        onClick={() => {
                          if (currentPage > 1) {
                            const newPage = currentPage - 1;
                            setCurrentPage(newPage);
                            updateURL({
                              search: searchTerm,
                              category: selectedCategory,
                              tag: selectedTag,
                              sort: sortOption,
                              minPrice: priceRange.min,
                              maxPrice: priceRange.max,
                              page: newPage,
                            });
                          }
                        }}
                        disabled={currentPage === 1}
                        whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                        whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          currentPage === 1
                            ? "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                        }`}
                        aria-label="Go to previous page"
                      >
                        Previous
                      </motion.button>

                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Page {currentPage} of {totalPages}
                      </span>

                      <motion.button
                        onClick={() => {
                          if (currentPage < totalPages) {
                            const newPage = currentPage + 1;
                            setCurrentPage(newPage);
                            updateURL({
                              search: searchTerm,
                              category: selectedCategory,
                              tag: selectedTag,
                              sort: sortOption,
                              minPrice: priceRange.min,
                              maxPrice: priceRange.max,
                              page: newPage,
                            });
                          }
                        }}
                        disabled={currentPage >= totalPages}
                        whileHover={{
                          scale: currentPage >= totalPages ? 1 : 1.05,
                        }}
                        whileTap={{
                          scale: currentPage >= totalPages ? 1 : 0.95,
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          currentPage >= totalPages
                            ? "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                        }`}
                        aria-label="Go to next page"
                      >
                        Next
                      </motion.button>
                    </motion.div>
                  </motion.section>
                ) : (
                  <motion.section
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24"
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-block p-8 bg-gray-100 dark:bg-gray-700 rounded-full mb-6"
                    >
                      <Search className="h-12 w-12 text-gray-400 dark:text-gray-300" />
                    </motion.div>
                    <motion.h3
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2"
                    >
                      No products found
                    </motion.h3>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto"
                    >
                      Try adjusting your filters or search terms to find what
                      you're looking for.
                    </motion.p>
                    <motion.button
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      onClick={clearAllFilters}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-green-600 dark:bg-green-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200 shadow-lg"
                    >
                      Clear All Filters
                    </motion.button>
                  </motion.section>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Mobile Header */}
          <div className="flex gap-2 items-center justify-between mb-6 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 sm:hidden">
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Showing {displayedProducts.length} products
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-4">
                <select
                  value={sortOption}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-xs bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-green-500 w-20"
                  aria-label="Sort products"
                >
                  <option value="relevance">Sort</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="name">Name</option>
                  <option value="rating">Rating</option>
                </select>
                <motion.button
                  onClick={() => setShowFilters(true)}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Open filters"
                >
                  <FunnelIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Mobile Products Grid */}
          <div className="grid grid-cols-2 gap-4 mb-12">
            {displayedProducts.length > 0 ? (
              displayedProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative"
                >
                  <ProductCard product={product} viewMode="grid" />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-2 text-center py-12"
              >
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No products found
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Try different filters
                </p>
              </motion.div>
            )}
          </div>

          {/* Mobile Pagination Controls */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center gap-4 mt-8"
          >
            <motion.button
              onClick={() => {
                if (currentPage > 1) {
                  const newPage = currentPage - 1;
                  setCurrentPage(newPage);
                  updateURL({
                    search: searchTerm,
                    category: selectedCategory,
                    tag: selectedTag,
                    sort: sortOption,
                    minPrice: priceRange.min,
                    maxPrice: priceRange.max,
                    page: newPage,
                  });
                }
              }}
              disabled={currentPage === 1}
              whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
              whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              }`}
              aria-label="Go to previous page"
            >
              Previous
            </motion.button>

            <span className="text-sm text-gray-600 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>

            <motion.button
              onClick={() => {
                if (currentPage < totalPages) {
                  const newPage = currentPage + 1;
                  setCurrentPage(newPage);
                  updateURL({
                    search: searchTerm,
                    category: selectedCategory,
                    tag: selectedTag,
                    sort: sortOption,
                    minPrice: priceRange.min,
                    maxPrice: priceRange.max,
                    page: newPage,
                  });
                }
              }}
              disabled={currentPage >= totalPages}
              whileHover={{ scale: currentPage >= totalPages ? 1 : 1.05 }}
              whileTap={{ scale: currentPage >= totalPages ? 1 : 0.95 }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentPage >= totalPages
                  ? "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              }`}
              aria-label="Go to next page"
            >
              Next
            </motion.button>
          </motion.div>
        </div>

        {/* Mobile Filter Modal */}
        <AnimatePresence>
          {showFilters && (
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetContent
                side="right"
                className="w-80 bg-white dark:bg-gray-800 p-0 overflow-y-auto lg:hidden"
                aria-describedby="filter-sheet-description"
              >
                <SheetHeader className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      Filters
                    </SheetTitle>
                    <SheetClose asChild>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Close filters"
                      >
                        <X className="h-5 w-5" />
                      </motion.button>
                    </SheetClose>
                  </div>
                  {activeFilters.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeFilters.slice(0, 3).map((filter) => (
                        <motion.button
                          key={filter.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => removeFilter(filter.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                        >
                          <span className="truncate max-w-16">
                            {filter.label}
                          </span>
                          <X className="h-3 w-3" />
                        </motion.button>
                      ))}
                      {activeFilters.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{activeFilters.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </SheetHeader>

                <div className="p-4 space-y-5">
                  {/* Quick Presets */}
                  <section>
                    <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      Quick Filters
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {presets.map((preset, idx) => (
                        <motion.button
                          key={preset.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => {
                            applyPreset(preset);
                            setShowFilters(false);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex flex-col items-center gap-1 p-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all duration-200"
                        >
                          <span className="text-xl">{preset.icon}</span>
                          <span className="text-xs text-gray-600 dark:text-gray-300 text-center">
                            {preset.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </section>

                  {/* Categories */}
                  <section>
                    <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Categories
                    </h4>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                      aria-label="Select category"
                    >
                      {[
                        "all",
                        ...categories.slice(0, 6).map((c) => c.name),
                      ].map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === "all" ? "All Categories" : cat} (
                          {getCategoryCount(cat)})
                        </option>
                      ))}
                    </select>
                    {categories.length > 6 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                        +{categories.length - 6} more
                      </p>
                    )}
                  </section>

                  {/* Price Range */}
                  <section>
                    <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Price Range (₹)
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>₹{priceRange.min}</span>
                        <span>₹{priceRange.max}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange.min}
                        onChange={(e) =>
                          handlePriceChange({
                            ...priceRange,
                            min: Math.min(
                              parseInt(e.target.value),
                              priceRange.max - 1
                            ),
                          })
                        }
                        className="w-full accent-green-500"
                        aria-label="Minimum price"
                      />
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange.max}
                        onChange={(e) =>
                          handlePriceChange({
                            ...priceRange,
                            max: Math.max(
                              parseInt(e.target.value),
                              priceRange.min + 1
                            ),
                          })
                        }
                        className="w-full accent-green-500"
                        aria-label="Maximum price"
                      />
                    </div>
                  </section>
                </div>

                <SheetFooter className="p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        clearAllFilters();
                        setShowFilters(false);
                      }}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md font-medium transition-all duration-200"
                    >
                      Clear All Filters
                    </Button>
                    <Button
                      onClick={() => setShowFilters(false)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md font-medium transition-all duration-200"
                    >
                      Apply Filters ({activeFilters.length})
                    </Button>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
