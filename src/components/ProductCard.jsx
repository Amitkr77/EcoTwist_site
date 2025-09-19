"use client";

import { useDispatch, useSelector } from "react-redux";
import { useState, useCallback } from "react";
import { addToCart } from "@/store/slices/cartSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  CheckCircle,
  Heart,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import axios from "axios";
import Link from "next/link";
import { updateWishlist } from "@/store/slices/userSlice";
import { useRouter } from "next/navigation";

function ProductCard({ product, viewMode = "grid" }) {
  const dispatch = useDispatch();
  const router = useRouter();
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
      // Auto-redirect to cart after 2 seconds, or keep showing "Go to Cart" button
      // setTimeout(() => setAdded(false), 3000);
    } catch (error) {
      setLoading(false);
      console.error("Failed to add item to cart", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToCart = useCallback(() => {
    router.push("/cart");
  }, [router]);

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
    ? product.categories[0].split(" ")[1] ||
      product.categories[0] ||
      "No categories"
    : product.categories || "No categories";

  const price = product.variants?.[0]?.price
    ? `₹${product.variants[0].price.toFixed(2)}`
    : "Price unavailable";

  // Responsive image dimensions
  const imageDimensions = {
    width: viewMode === "list" ? 160 : 320,
    height: viewMode === "list" ? 160 : 240,
  };

  return (
    <motion.div
      className={`
        relative group bg-white rounded-2xl overflow-hidden shadow-sm 
        hover:shadow-lg transition-all duration-300 w-full max-w-full
        ${
          viewMode === "list"
            ? "flex flex-col lg:flex-row gap-3 lg:gap-4 p-3 lg:p-4"
            : "max-w-sm mx-auto sm:max-w-none"
        }
      `}
      style={{
        maxWidth: viewMode === "list" ? "100%" : "400px",
        minWidth: viewMode === "list" ? "280px" : "auto",
      }}
      whileHover={{ scale: viewMode === "grid" ? 1.02 : 1 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Container */}
      <div
        className={`
          relative overflow-hidden bg-white w-full h-56 rounded-2xl
          ${
            viewMode === "list"
              ? "aspect-square sm:aspect-[4/3] lg:aspect-[3/4]"
              : "aspect-[4/5] sm:aspect-[3/4]"
          }
          min-h-[200px] sm:min-h-[220px] md:min-h-[240px] lg:min-h-[260px]
        `}
      >
        <Link href={`/product-info/${product._id}`} passHref>
          <div className="relative w-full h-full">
            <Image
              src={imageError ? "/placeholder.svg" : images[currentImageIndex]}
              alt={product.name || "Product"}
              width={imageDimensions.width}
              height={imageDimensions.height}
              sizes={`
                ${
                  viewMode === "list"
                    ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    : "(max-width: 640px) 100vw, 33vw"
                }
              `}
              className="
                w-full h-full object-cover rounded-2xl 
                transition-transform duration-300 group-hover:scale-105 cursor-pointer
                xs:object-contain sm:object-cover
              "
              onError={() => setImageError(true)}
              priority={currentImageIndex === 0}
            />
          </div>
        </Link>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl pointer-events-none" />

        {/* Wishlist Button */}
        <motion.button
          className="
            absolute top-2 right-2 p-1.5 sm:p-2 bg-white/90 
            rounded-full hover:bg-white transition-all duration-200 
            focus:ring-2 focus:ring-rose-500/50 z-10
            shadow-md hover:shadow-lg
          "
          aria-label="Add to wishlist"
          onClick={handleToggleWishlist}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          disabled={wishlistLoading}
        >
          <Heart
            className={`
              w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-200
              ${
                isInWishlist
                  ? "text-rose-500 fill-rose-500"
                  : "text-gray-600 hover:text-rose-500"
              }
            `}
          />
        </motion.button>

        {/* Image Navigation - Only show on hover for larger screens */}
        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
          <motion.button
            className="
              pointer-events-auto p-1.5 sm:p-2 bg-white/80 hover:bg-white/95 
              rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100
              focus:ring-2 focus:ring-indigo-500/50 shadow-md
              hidden sm:flex
            "
            onClick={handlePrevImage}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>

          <motion.button
            className="
              pointer-events-auto p-1.5 sm:p-2 bg-white/80 hover:bg-white/95 
              rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100
              focus:ring-2 focus:ring-indigo-500/50 shadow-md
              hidden sm:flex
            "
            onClick={handleNextImage}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Content Container */}
      <div
        className={`
          p-2 sm:p-3 lg:p-4 flex-1 flex flex-col
          ${
            viewMode === "list"
              ? "justify-between gap-2 sm:gap-3"
              : "gap-2 sm:gap-3"
          }
          min-h-[120px] sm:min-h-[140px]
        `}
      >
        {/* Header Section - Product Name and Categories */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
          {/* Product Name */}
          <div className="flex-1 min-h-[2rem] sm:min-h-[2.25rem] md:min-h-[2.5rem]">
            <h3
              className="
                text-xs xs:text-sm sm:text-base md:text-lg font-semibold 
                text-gray-900 leading-tight line-clamp-2
                xs:line-clamp-1 sm:line-clamp-2
              "
              style={{
                display: "-webkit-box",
                WebkitLineClamp: viewMode === "list" ? 2 : 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product?.name || "Unnamed Product"}
            </h3>
          </div>

          {/* Categories Badge */}
          <div className="flex-shrink-0">
            <span
              className="
              bg-green-100 text-green-700 text-[10px] xs:text-xs 
              px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full inline-block
              whitespace-nowrap
            "
            >
              {categories}
            </span>
          </div>
        </div>

        {/* Description (List view only) */}
        {viewMode === "list" && (
          <div className="min-h-[2rem] sm:min-h-[3rem] mb-2 sm:mb-3">
            <p
              className="
              text-xs xs:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3 
              leading-relaxed xs:leading-tight sm:leading-relaxed
            "
            >
              {product.description || "No description available"}
            </p>
          </div>
        )}

        {/* Price and Action Section */}
        <div
          className={`
            flex w-full justify-between  ${viewMode === "list" ? "mt-auto" : ""}
          `}
        >
          {/* Price */}
          <div className="flex-shrink-0">
            <span className="text-xs text-gray-500 block mb-0.5 sm:mb-1 sr-only sm:not-sr-only">
              Price
            </span>
            <span
              className="
              text-sm xs:text-base sm:text-lg font-semibold 
              text-indigo-600 leading-tight
              block
            "
            >
              {price}
            </span>
          </div>

          {/* Add to Cart Button */}
          <motion.button
            onClick={handleAddToCart}
            disabled={loading}
            className={`
              flex items-center justify-center gap-1.5 sm:gap-2 
              px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm 
              font-medium text-white flex-1 sm:flex-none
              transition-all duration-200 focus:ring-2 focus:ring-indigo-500/50
              min-h-[2rem] sm:min-h-[2.5rem]
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : added
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }
            `}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            aria-label={
              loading ? "Adding to cart" : added ? "Go to cart" : "Add to cart"
            }
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 sm:gap-2"
                >
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin flex-shrink-0" />
                  <span className="hidden xs:inline">Adding...</span>
                  <span className="xs:hidden">...</span>
                </motion.span>
              ) : added ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                  onClick={handleGoToCart}
                >
                  <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden xs:inline">Go to Cart</span>
                  <span className="xs:hidden">Cart</span>
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 sm:gap-2"
                >
                  <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden xs:inline">Add</span>
                  <span className="xs:hidden">+</span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;
