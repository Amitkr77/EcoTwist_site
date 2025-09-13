"use client";

import { useDispatch, useSelector } from "react-redux";
import { useState, useCallback } from "react";
import { addToCart } from "@/store/slices/cartSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  CheckCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import axios from "axios";
import Link from "next/link";
import { updateWishlist } from "@/store/slices/userSlice";

function ProductCard({ product, viewMode = "grid" }) {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.user.wishlist || []);
  const isInWishlist = wishlist.some((item) => item.productId === product._id);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.map((img) => img.url)
      : ["/placeholder.svg"];

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await dispatch(
        addToCart({
          productId: product._id,
          variantSku: product.variants[0].sku,
          quantity: 1,
        })
      );
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      setLoading(false);
      console.error("Failed to add item to cart", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevImage = useCallback(
    (e) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    },
    [images.length]
  );

  const handleNextImage = useCallback(
    (e) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    },
    [images.length]
  );

  const getAuthToken = () => {
    return localStorage.getItem("user-token") || "";
  };

  const handleToggleWishlist = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      console.warn("No authentication token found");
      return;
    }

    setWishlistLoading(true);
    try {
      const response = await axios.post(
        "/api/wishlist",
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 && response.data.success) {
        dispatch(updateWishlist(response.data?.wishlist?.items || []));
      }
    } catch (error) {
      console.error("Failed to toggle wishlist", error);
    } finally {
      setWishlistLoading(false);
    }
  }, [product._id, dispatch]);

  const categories = Array.isArray(product.categories)
    ? product.categories.join(", ")
    : product.categories || "No categories";

  const price = product.variants?.[0]?.price
    ? `₹${product.variants[0].price.toFixed(2)}`
    : "Price unavailable";

  return (
    <motion.div
      className={`relative group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 w-full ${
        viewMode === "list"
          ? "flex flex-col sm:flex-row gap-4 p-4"
          : "max-w-sm mx-auto"
      }`}
      whileHover={{ scale: viewMode === "grid" ? 1.02 : 1 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Container */}
      <div
        className={`relative overflow-hidden ${
          viewMode === "grid" ? "aspect-[4/3]" : "w-full sm:w-48 h-48"
        }`}
      >
        <Image
          src={imageError ? "/placeholder.svg" : images[currentImageIndex]}
          alt={product.name || "Product"}
          width={viewMode === "list" ? 192 : 400}
          height={viewMode === "list" ? 192 : 300}
          className="w-full h-full object-cover rounded-t-2xl sm:rounded-2xl transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
          priority={currentImageIndex === 0}
        />
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-white/50 hover:bg-white rounded-full focus:ring-2 focus:ring-indigo-500 z-10"
              onClick={handlePrevImage}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/50 hover:bg-white rounded-full focus:ring-2 focus:ring-indigo-500 z-10"
              onClick={handleNextImage}
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </Button>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex
                      ? "bg-indigo-600"
                      : "bg-gray-300"
                  } hover:bg-indigo-500 transition-colors`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-0" />
        <Link href={`/product-info/${product._id}`} passHref>
          <motion.button
            className="absolute top-3 left-3 p-1 bg-white/80 rounded-full hover:bg-white transition-colors focus:ring-2 focus:ring-indigo-500 z-10 "
            aria-label="Quick view product"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-3 h-3 text-gray-700" />
          </motion.button>
        </Link>
      </div>

      {/* Content Container */}
      <div
        className={`p-4 ${
          viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""
        }`}
      >
        {/* Product Name and Categories */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2 sm:mb-3">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 line-clamp-2">
            {product.name || "Unnamed Product"}
          </h3>
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full shrink-0">
            {categories}
          </span>
        </div>

        {/* Description (List view only) */}
        {viewMode === "list" && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {product.description || "No description available"}
          </p>
        )}

        {/* Price and Add to Cart */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
            viewMode === "list" ? "mt-auto" : "mt-3"
          }`}
        >
          <div>
            <span className="text-xs text-gray-500 block">Price</span>
            <span className="text-base sm:text-lg font-semibold text-indigo-600">
              {price}
            </span>
          </div>
          <motion.button
            onClick={handleAddToCart}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : added
                ? "bg-green-500"
                : "bg-indigo-600 hover:bg-indigo-700"
            } transition-colors focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto`}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            aria-label={loading ? "Adding to cart" : "Add to cart"}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Adding...
                </motion.span>
              ) : added ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Added!
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart size={16} />
                  Add
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Decorative Element */}
      {viewMode === "grid" && (
        <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-100 rounded-bl-full opacity-50 group-hover:opacity-75 transition-opacity" />
      )}
    </motion.div>
  );
}

export default ProductCard;
