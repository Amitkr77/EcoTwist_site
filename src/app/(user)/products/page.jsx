"use client";
import React, { useState } from "react";
import { Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// Mock products data
const mockProducts = [
  {
    id: "1",
    name: "Eco-Friendly Water Bottle",
    price: 24.99,
    originalPrice: 29.99,
    image: "/placeholder.svg",
    description: "Sustainable stainless steel water bottle with bamboo cap",
    category: "Drinkware",
    stock: 15,
    material: "Stainless Steel",
    rating: 4.5,
    eco_score: 9,
  },
  {
    id: "2",
    name: "Organic Cotton Tote Bag",
    price: 18.99,
    originalPrice: 21.99,
    image: "/placeholder.svg",
    description: "Reusable shopping bag made from 100% organic cotton",
    category: "Bags",
    stock: 8,
    material: "Organic Cotton",
    rating: 4.3,
    eco_score: 10,
  },
  {
    id: "3",
    name: "Bamboo Phone Case",
    price: 29.99,
    originalPrice: 34.99,
    image: "/placeholder.svg",
    description: "Biodegradable phone case made from sustainable bamboo",
    category: "Accessories",
    stock: 12,
    material: "Bamboo",
    rating: 4.7,
    eco_score: 9,
  },
  {
    id: "4",
    name: "Solar Power Bank",
    price: 45.99,
    originalPrice: 59.99,
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80",
    description: "Portable solar-powered charger for eco-conscious users",
    category: "Electronics",
    stock: 5,
    material: "Plastic & Solar Cells",
    rating: 4.9,
    eco_score: 10,
  },
  {
    id: "5",
    name: "Recycled Notebook Set",
    price: 16.99,
    originalPrice: 19.99,
    image: "/placeholder.svg",
    description: "Set of 3 notebooks made from recycled paper",
    category: "Stationery",
    stock: 20,
    material: "Recycled Paper",
    rating: 4.1,
    eco_score: 8,
  },
  {
    id: "6",
    name: "Plant-Based Soap Bar",
    price: 8.99,
    originalPrice: 12.99,
    image: "/placeholder.svg",
    description: "Natural soap bar with essential oils and herbs",
    category: "Personal Care",
    stock: 0,
    material: "Plant-Based Oils",
    rating: 4.0,
    eco_score: 9,
  },
  {
    id: "7",
    name: "Cork Yoga Mat",
    price: 39.99,
    originalPrice: 49.99,
    image: "/placeholder.svg",
    description: "Non-slip yoga mat made from natural cork and rubber",
    category: "Fitness",
    stock: 10,
    material: "Cork & Natural Rubber",
    rating: 4.6,
    eco_score: 9,
  },
  {
    id: "8",
    name: "Beeswax Food Wraps",
    price: 14.99,
    originalPrice: 17.99,
    image: "/placeholder.svg",
    description:
      "Reusable alternative to plastic wrap, made with beeswax and cotton",
    category: "Kitchen",
    stock: 25,
    material: "Beeswax & Cotton",
    rating: 4.2,
    eco_score: 10,
  },
  {
    id: "9",
    name: "Compostable Phone Charger",
    price: 27.99,
    originalPrice: 32.99,
    image: "/placeholder.svg",
    description: "Phone charger made from biodegradable materials",
    category: "Electronics",
    stock: 7,
    material: "Bioplastic",
    rating: 4.4,
    eco_score: 9,
  },
  {
    id: "10",
    name: "Hemp Baseball Cap",
    price: 22.99,
    originalPrice: 26.99,
    image: "/placeholder.svg",
    description: "Adjustable baseball cap made from sustainable hemp fabric",
    category: "Apparel",
    stock: 14,
    material: "Hemp",
    rating: 4.3,
    eco_score: 8,
  },
  {
    id: "11",
    name: "Reusable Bamboo Cutlery Set",
    price: 12.99,
    originalPrice: 15.99,
    image: "/placeholder.svg",
    description: "Travel cutlery set with pouch, made from bamboo",
    category: "Travel",
    stock: 30,
    material: "Bamboo",
    rating: 4.5,
    eco_score: 10,
  },
  {
    id: "12",
    name: "Eco-Friendly Laundry Detergent Sheets",
    price: 19.99,
    originalPrice: 24.99,
    image: "/placeholder.svg",
    description: "Plastic-free detergent sheets for eco-conscious laundry",
    category: "Household",
    stock: 18,
    material: "Plant-Based",
    rating: 4.6,
    eco_score: 9,
  },
];

const page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { getTotalItems } = useCart();
  const [isLoading, setIsLoading] = useState(null);

  const categories = Array.from(
    new Set(mockProducts.map((product) => product.category))
  );

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  // const [availability, setAvailability] = useState({
  //   inStock: false,
  //   outOfStock: false,
  // });
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("default");

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    setAvailability({ inStock: false, outOfStock: false });
    setMinRating(0);
    setSortBy("default");
  };

  // const handleAvailabilityChange = (type) => {
  //   setAvailability((prev) => ({
  //     ...prev,
  //     [type]: !prev[type],
  //   }));
  // };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="text-center pt-10">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#1B4332] mb-4 tracking-tight">
          Discover Sustainable Gifts
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Explore our handpicked collection of eco-friendly, artisan-made, and
          biodegradable products — curated with care for conscious gifting.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8 ">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-6 transition-all duration-300 sticky top-1 z-10 h-fit">
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
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
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
              <label className="flex items-center space-x-3 cursor-pointer hover:text-green-600 transition-colors duration-200">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === ""}
                  onChange={() => setSelectedCategory("")}
                  className="form-radio text-green-600 focus:ring-green-500 h-4 w-4"
                />
                <span>All Categories</span>
              </label>
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-3 cursor-pointer hover:text-green-600 transition-colors duration-200"
                >
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category}
                    onChange={() => setSelectedCategory(category)}
                    className="form-radio text-green-600 focus:ring-green-500 h-4 w-4"
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Price Range (₹)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                }
                className="text-sm border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                min="0"
                aria-label="Minimum price"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                }
                className="text-sm border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                min="0"
                aria-label="Maximum price"
              />
            </div>
          </div>

          {/* Availability */}
          {/* <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Availability
            </h3>
            <div className="space-y-3 text-sm">
              <label className="flex items-center space-x-3 cursor-pointer hover:text-green-600 transition-colors duration-200">
                <input
                  type="checkbox"
                  checked={availability.inStock}
                  onChange={() => handleAvailabilityChange("inStock")}
                  className="form-checkbox text-green-600 focus:ring-green-500 h-4 w-4"
                />
                <span>In Stock</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer hover:text-green-600 transition-colors duration-200">
                <input
                  type="checkbox"
                  checked={availability.outOfStock}
                  onChange={() => handleAvailabilityChange("outOfStock")}
                  className="form-checkbox text-green-600 focus:ring-green-500 h-4 w-4"
                />
                <span>Out of Stock</span>
              </label>
            </div>
          </div> */}

          {/* Ratings */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Minimum Rating
            </h3>
            <div className="space-y-3 text-sm">
              {[5, 4, 3, 2, 1].map((rating) => (
                <label
                  key={rating}
                  className="flex items-center space-x-3 cursor-pointer hover:text-green-600 transition-colors duration-200"
                >
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === rating}
                    onChange={() => setMinRating(rating)}
                    className="form-radio text-green-600 focus:ring-green-500 h-4 w-4"
                  />
                  <span className="flex items-center">
                    {[...Array(rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                      </svg>
                    ))}
                    {[...Array(5 - rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                      </svg>
                    ))}
                  </span>
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
              className="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
              aria-label="Sort products"
            >
              <option value="default">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
            aria-label="Reset all filters"
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
          ) : filteredProducts.length === 0 ? (
            <div
              className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200"
              role="alert"
              aria-live="polite"
            >
              <p className="text-gray-500 text-lg font-medium">
                No products found matching your criteria.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 inline-block px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      <div className="p-4">
        {/* Impact Message */}
        <div className="mt-20 bg-gradient-to-r from-[#2E7D32] to-[#1B4332] text-white rounded-2xl px-8 py-12 text-center shadow-lg">
          <div className="max-w-3xl mx-auto">
            <DotLottieReact
              src="https://lottie.host/852a0a5e-2e1c-40ed-a0b2-98e500cdb5bd/OFbUN4ZK7Y.lottie"
              loop
              autoplay
            />
            <h3 className="font-heading text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Every Purchase Makes a Difference
            </h3>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              When you shop with <strong>EcoTwist</strong>, you're not just
              buying a product — you're empowering artisan communities,
              supporting sustainable practices, and helping us reduce
              environmental waste with every order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
