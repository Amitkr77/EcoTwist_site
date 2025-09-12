"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Page = () => {
  const [products, setProducts] = useState([]); 
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(null);

  // Fetch product data from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = Array.from(
    new Set(products.map((product) => product.categories[0]))
  );

  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("default");

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    setMinRating(0);
    setSortBy("default");
  };

  // Filtering
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || product.categories[0] === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // if (sortBy === "priceLowHigh") {
    //   return a.price - b.price;
    // }
    // if (sortBy === "priceHighLow") {
    //   return b.price - a.price;
    // }
    if (sortBy === "ratingHighLow") {
      return b.rating - a.rating;
    }
    if (sortBy === "nameAZ") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "nameZA") {
      return b.name.localeCompare(a.name);
    }
    return 0; // default (no sorting)
  });

  return (
    <div className="min-h-screen pt-20  bg-gray-50 ">
      <div className="text-center pt-10">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#1B4332] mb-4 tracking-tight">
          Discover Sustainable Gifts
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed ">
          Explore our handpicked collection of eco-friendly, artisan-made, and
          biodegradable products — curated with care for conscious gifting.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8 ">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-6 sticky top-1 z-10 h-fit">
          {/* Search */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search Products
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="search"
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Category
            </h3>
            <div className="space-y-3 text-sm">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === ""}
                  onChange={() => setSelectedCategory("")}
                  className="form-radio text-green-600 h-4 w-4"
                />
                <span>All Categories</span>
              </label>
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category}
                    onChange={() => setSelectedCategory(category)}
                    className="form-radio text-green-600 h-4 w-4"
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Sort By
            </h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="default">Default</option>
              {/* <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option> */}
              <option value="ratingHighLow">Rating: High to Low</option>
              <option value="nameAZ">Name: A to Z</option>
              <option value="nameZA">Name: Z to A</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
          >
            Reset Filters
          </button>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
                >
                  <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
              <p className="text-gray-500 text-lg font-medium">
                No products found matching your criteria.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Impact Section */}
      <div className="p-4">
        <div className="mt-20 bg-gradient-to-r from-[#2E7D32] to-[#1B4332] text-white rounded-2xl px-8 py-12 text-center shadow-lg">
          <div className="max-w-3xl mx-auto">
            <DotLottieReact
              src="https://lottie.host/852a0a5e-2e1c-40ed-a0b2-98e500cdb5bd/OFbUN4ZK7Y.lottie"
              loop
              autoplay
            />
            <h3 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Every Purchase Makes a Difference
            </h3>
            <p className="text-lg md:text-xl text-white/90">
              When you shop with <strong>EcoTwist</strong>, you're not just
              buying a product — you're empowering artisan communities,
              supporting sustainable practices, and helping us reduce waste.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
