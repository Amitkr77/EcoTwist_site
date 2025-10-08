"use client";

import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Share2,
  Heart,
  LoaderCircle,
  ShoppingCart,
  Minus,
  Plus,
  CheckCircle,
  BookOpen,
  ChevronDown,
  Sparkles,
  Settings,
  Lightbulb,
  Quote,
  X,
  XCircle,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewsTabContent from "@/components/ReviewsTabContent";
import Head from "next/head";
import { addToCart, updateCart } from "@/store/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
  fetchUserProfile,
} from "@/store/slices/userSlice";
import Link from "next/link";
import { fetchProducts } from "@/store/slices/productSlices";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

export default function ProductPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { slugAndId } = useParams();
  const {
    byId: productsById,
    allIds,
    status: productStatus,
    error: productError,
  } = useSelector((state) => state.products || {});
  const {
    profile,
    wishlist,
    status: userStatus,
    error: userError,
  } = useSelector((state) => state.user || {});
  const { status: cartStatus, error: cartError } = useSelector(
    (state) => state.cart || {}
  );
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (token) {
      const decoded = jwtDecode(token);
      console.log("decoded", decoded);
      setUserId(decoded.id);
    }
  }, []);

  // Add this utility function
  const truncateDescription = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };
  const productId = useMemo(() => {
    return slugAndId?.split("--").pop();
  }, [slugAndId]);

  const product = productsById[productId];

  // Fetch products and user profile
  useEffect(() => {
    if (productStatus === "idle") {
      dispatch(fetchProducts());
    }
    const userId = localStorage.getItem("user-id");
    if (userId && userStatus === "idle") {
      dispatch(fetchUserProfile(userId));
    }
  }, [dispatch, productStatus, userStatus]);

  // Initialize variant selections and image
  useEffect(() => {
    if (product && product.options) {
      const initialSelections = {};
      product.options.forEach((opt) => {
        const vals = opt.values
          .join(",")
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v);
        if (vals.length > 0) {
          initialSelections[opt.name] = vals[0];
        }
      });
      setSelectedOptions(initialSelections);
      if (product.images?.length > 0) {
        setSelectedImage(
          product.images.find((img) => img.isPrimary)?.url ||
            product.images[0].url
        );
      }
    }
  }, [product]);

  // Check wishlist status
  useEffect(() => {
    if (productId && wishlist) {
      setIsWishlisted(wishlist.some((item) => item.productId === productId));
    }
  }, [productId, wishlist]);

  // Handle errors
  useEffect(() => {
    if (productStatus === "failed" && productError) {
      toast.error(productError);
      console.error("Product fetch error:", productError);
    }
    if (userStatus === "failed" && userError) {
      toast.error(userError);
      console.error("User fetch error:", userError);
    }
    if (cartStatus === "failed" && cartError) {
      toast.error(cartError);
      console.error("Cart error:", cartError);
    }
  }, [
    productStatus,
    productError,
    userStatus,
    userError,
    cartStatus,
    cartError,
  ]);

  // Get related products
  const relatedProducts = useMemo(() => {
    if (productStatus !== "succeeded" || !allIds || !product) return [];
    return allIds
      .filter(
        (id) =>
          id !== productId &&
          productsById[id]?.categories?.some((cat) =>
            product.categories?.includes(cat)
          )
      )
      .slice(0, 4)
      .map((id) => productsById[id]);
  }, [allIds, productsById, product, productId]);

  const getSelectedVariant = () => {
    if (!product?.variants) return null;
    return (
      product.variants.find((variant) =>
        Object.entries(selectedOptions).every(([optName, selVal]) => {
          const variantVal = variant.optionValues?.[optName];
          if (!selVal || !variantVal) return true;
          return variantVal.includes(selVal);
        })
      ) || product.variants[0]
    );
  };

  const selectedVariant = getSelectedVariant();
  const isAvailable = selectedVariant?.inventory?.quantity > 0;

  function getUserIdFromToken(token) {
    try {
      const decoded = jwtDecode(token);
      return decoded?.userId || decoded?.sub;
    } catch (error) {
      return null;
    }
  }
  const handleAddToCart = async () => {
    if (!isAvailable) return;
    setLoading(true);
    try {
      await dispatch(
        addToCart({
          productId: product._id,
          variantSku: selectedVariant?.sku || product.variants[0].sku,
          quantity: quantity, 
        })
      );
      toast.success(`${quantity} item(s) added to your cart!`);
    } catch (error) {
      console.error("Failed to add item to cart", error);
      toast.error("Failed to add item to cart");
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = () => {
    const userId = localStorage.getItem("user-id");
    if (!userId) {
      if (
        window.confirm(
          "You need to be logged in to manage your wishlist. Do you want to login now?"
        )
      ) {
        router.push("/login");
      }
      return;
    }
    if (isWishlisted) {
      dispatch(removeFromWishlist({ userId, productId }))
        .unwrap()
        .then(() => {
          setIsWishlisted(false);
          toast.success(`${product.name} removed from wishlist`);
        })
        .catch((err) => toast.error(err || "Failed to remove from wishlist"));
    } else {
      dispatch(addToWishlist({ userId, productId }))
        .unwrap()
        .then(() => {
          setIsWishlisted(true);
          toast.success(`${product.name} added to wishlist`);
        })
        .catch((err) => toast.error(err || "Failed to add to wishlist"));
    }
  };

  const handleQuantityChange = (value) => {
    const parsedValue = parseInt(value);
    if (isNaN(parsedValue) || parsedValue < 1) {
      setQuantity(1);
      return;
    }
    const newQuantity = Math.min(
      parsedValue,
      selectedVariant?.inventory?.quantity || 1
    );
    setQuantity(newQuantity);
  };

  const handleQuantityIncrement = () => {
    const newQuantity = Math.min(
      quantity + 1,
      selectedVariant?.inventory?.quantity || 1
    );
    setQuantity(newQuantity);
  };

  const handleQuantityDecrement = () => {
    const newQuantity = Math.max(quantity - 1, 1);
    setQuantity(newQuantity);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Product link copied to clipboard!");
  };

  const getOptionIcon = (name) => {
    switch (name) {
      case "Size":
        return "📐";
      case "Capacity":
        return "📦";
      case "Material":
        return "🔧";
      default:
        return null;
    }
  };

  console.log(product);

  const UsageList = product?.usage
    .split("\n")
    .filter((line) => line.trim() !== "");

  if (productStatus === "loading" || userStatus === "loading") {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="p-10 space-y-6">
          <div className="flex items-center space-x-2">
            <LoaderCircle className="h-5 w-5 animate-spin text-green-600 dark:text-green-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Fetching product...
            </p>
          </div>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (productStatus === "failed" || !product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900 dark:to-pink-900">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Oops! Something went wrong.
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {productError || "Product not found"}
          </p>
          <Button
            onClick={() => dispatch(fetchProducts())}
            className="bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600"
            aria-label="Retry loading product"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <Head>
        <title>{product.name} | Eco-Friendly Store</title>
        <meta name="description" content={product.description} />
        <meta name="keywords" content={product.tags?.join(", ") || ""} />
      </Head>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Image Section */}
          <div className="lg:col-span-2">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <Image
                src={selectedImage || "/product_image.png"}
                alt={product.name || "Product image"}
                fill
                className="object-contain transition-transform duration-300"
              />
            </motion.div>
            <div className="flex gap-2 sm:gap-3 justify-start mt-3 sm:mt-4 p-2 overflow-x-auto">
              {product.images?.map((img) => (
                <motion.button
                  key={img.position}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-md overflow-hidden border-2 flex-shrink-0  ${
                    selectedImage === img.url
                      ? "border-green-500 dark:border-green-400"
                      : "border-gray-200 dark:border-gray-700"
                  } shadow-sm`}
                  aria-label={`Select image ${img.alt}`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sidebar: Product Actions */}
          <div className="space-y-6 lg:space-y-8">
            {/* Hero Section - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-800/95 dark:to-gray-900/95 shadow-xl hover:shadow-2xl transition-all duration-500 p-6 lg:p-8"
            >
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/20 to-emerald-50/20 dark:from-indigo-900/10 dark:to-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-8">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-gray-100 dark:via-gray-200 dark:to-white bg-clip-text text-transparent leading-tight tracking-tight">
                        {product.name}
                      </h1>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex -space-x-2 overflow-hidden">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 ring-2 ring-white dark:ring-gray-800"
                            />
                          ))}
                        </div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 tracking-wide">
                          {product.brand}
                        </p>
                      </div>
                      {/* <p className="mt-2 text-base lg:text-lg font-normal text-gray-600 dark:text-gray-400 leading-relaxed max-w-none lg:max-w-md">
                        {product.bestUse}
                      </p> */}
                    </div>
                  </div>
                </div>

                {/* Tags - Enhanced */}
                {/* <div className="flex-shrink-0">
                  <div className="flex flex-wrap gap-2">
                    {product.tags?.map((tag, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="group relative"
                      >
                        <Badge
                          variant="secondary"
                          className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 text-xs lg:text-sm font-medium px-3 py-1.5 rounded-full shadow-lg hover:shadow-md transition-all duration-200 overflow-hidden"
                        >
                          <span className="relative z-10">{tag}</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 transform -skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div> */}
              </div>
            </motion.div>

            {/* Enhanced Product Card */}
            <Card className="border border-gray-200/60 dark:border-gray-700/60 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <CardContent className="p-6 lg:p-8 space-y-6 lg:space-y-8">
                {/* Price & Share - Enhanced */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Current Price
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
                        ₹{selectedVariant?.price || 0}
                      </span>
                      <span className="text-lg font-normal text-gray-500 dark:text-gray-400">
                        {selectedVariant?.currency || "INR"}
                      </span>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleShare}
                      className="relative bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 w-12 h-12"
                      aria-label="Share product"
                    >
                      <Share2 className="h-5 w-5" />
                      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Variant Selection - Unified Dynamic */}
                {product.options?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    {product.options.map((option) => {
                      const isColorOption =
                        option.name.toLowerCase() === "color";
                      const optionValues = option.values
                        .join(",")
                        .split(",")
                        .map((val) => val.trim())
                        .filter((val) => val.length > 0);
                      const currentSelection =
                        selectedOptions[option.name] || "";
                      const icon = getOptionIcon(option.name);

                      return (
                        <div key={option.name} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 capitalize tracking-wide">
                              {option.name}
                            </h3>
                            {["Size", "Capacity"].includes(option.name) && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200 cursor-pointer flex items-center gap-1"
                                  >
                                    📏 {option.name} Guide
                                  </motion.div>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 rounded-2xl">
                                  <DialogHeader className="space-y-3">
                                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                                      {option.name} Guide
                                    </DialogTitle>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Choose the right{" "}
                                      {option.name.toLowerCase()} for your needs
                                    </p>
                                  </DialogHeader>
                                  <div className="space-y-4 text-sm lg:text-base text-gray-700 dark:text-gray-300">
                                    {optionValues.map((item) => {
                                      let desc = "";
                                      if (option.name === "Capacity") {
                                        if (item === "500ml")
                                          desc =
                                            "Ideal for short trips or daily commutes";
                                        if (item === "750ml")
                                          desc =
                                            "Perfect for all-day hydration or workouts";
                                        if (item === "1L")
                                          desc =
                                            "Best for long hikes or shared use";
                                      } else if (option.name === "Size") {
                                        if (item === "A5")
                                          desc =
                                            "Standard size for detailed journaling and planning";
                                        if (item === "A6")
                                          desc =
                                            "Compact pocket size for quick notes on the go";
                                      }
                                      return (
                                        <div
                                          key={item}
                                          className="flex items-start gap-3 p-3 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl"
                                        >
                                          <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                                          <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                              {item}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                              {desc}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs font-medium text-gray-500 dark:text-gray-400"
                          >
                            Essential
                          </Badge>
                          <RadioGroup
                            value={currentSelection}
                            onValueChange={(val) =>
                              setSelectedOptions((prev) => ({
                                ...prev,
                                [option.name]: val,
                              }))
                            }
                            className={`grid gap-3 ${
                              isColorOption
                                ? "grid-cols-5 sm:grid-cols-6 lg:grid-cols-8"
                                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                            }`}
                          >
                            {optionValues.map((value) => {
                              const id = `${option.name.toLowerCase()}-${value
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`;
                              const isSelected = currentSelection === value;

                              return (
                                <motion.div
                                  key={value}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 300,
                                  }}
                                  className="relative group"
                                >
                                  <RadioGroupItem
                                    value={value}
                                    id={id}
                                    className="sr-only peer"
                                  />
                                  <Label
                                    htmlFor={id}
                                    className={`relative block w-full aspect-square rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
                                      isSelected
                                        ? "border-green-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/20 ring-2 ring-indigo-500/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
                                    }`}
                                  >
                                    {isColorOption ? (
                                      // Color swatch
                                      <>
                                        <div
                                          className="w-full h-full rounded-md"
                                          style={{
                                            backgroundColor:
                                              value.toLowerCase(),
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-black/10 rounded-md opacity-0 peer-checked:opacity-100 transition-opacity duration-200"></div>
                                        <span className="absolute -bottom-2 -right-2 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full opacity-0 peer-checked:opacity-100 transition-all duration-200 transform translate-y-1 peer-checked:translate-y-0 scale-0 peer-checked:scale-100">
                                          ✓
                                        </span>
                                        {/* Color name overlay on hover */}
                                        {/* <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                          <span className="text-white text-xs font-medium capitalize bg-black/50 px-2 py-1 rounded">
                                            {value}
                                          </span>
                                        </div> */}
                                      </>
                                    ) : (
                                      // Text-based option (size, material, etc.)
                                      <>
                                        <div
                                          className={`w-full h-full flex flex-col items-center justify-center p-2 transition-colors duration-200 ${
                                            isSelected
                                              ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                                              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                          }`}
                                        >
                                          {icon && (
                                            <div className="text-2xl mb-1">
                                              {icon}
                                            </div>
                                          )}
                                          <span className="text-sm font-semibold leading-none capitalize text-center">
                                            {value}
                                          </span>
                                        </div>
                                        {/* Selection indicator for non-color options */}
                                        <div
                                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 transition-all duration-200 ${
                                            isSelected
                                              ? "bg-indigo-500 opacity-100"
                                              : "bg-transparent opacity-0 group-hover:opacity-100"
                                          }`}
                                        >
                                          {isSelected && (
                                            <svg
                                              className="w-2 h-2 text-white mt-0.5 ml-0.5"
                                              fill="currentColor"
                                              viewBox="0 0 8 8"
                                            >
                                              <path d="M2.75 6.938L6.887 2.8l-.618-.618L2.75 5.702l-1.47-1.47-.618.618z" />
                                            </svg>
                                          )}
                                        </div>
                                      </>
                                    )}

                                    {/* Selection ring animation */}
                                    <div
                                      className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                                        isSelected
                                          ? "scale-110 opacity-50"
                                          : "scale-0 opacity-0"
                                      } bg-indigo-500 blur-sm`}
                                    ></div>
                                  </Label>

                                  {/* Option name below */}
                                  <span
                                    className={`block text-center text-xs font-medium mt-2 transition-colors duration-200 ${
                                      isSelected
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                                    } capitalize`}
                                  >
                                    {value}
                                  </span>
                                </motion.div>
                              );
                            })}
                          </RadioGroup>
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                {/* Quantity Selector - Enhanced */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                      Quantity
                    </Label>
                    {/* <div className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedVariant?.inventory?.quantity || 0} available
                    </div> */}
                  </div>

                  <div className="inline-flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="group relative "
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleQuantityDecrement}
                        disabled={quantity <= 1}
                        className="w-12 h-12 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                      </Button>
                    </motion.div>

                    <div className="flex-1 border">
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        className="w-full max-w-[5rem] mx-auto text-center text-xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-0 shadow-none focus:ring-2 focus:ring-indigo-500/50 rounded-lg px-0 py-4"
                        min="1"
                        max={selectedVariant?.inventory?.quantity || 1}
                        aria-label="Quantity"
                      />
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="group relative"
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleQuantityIncrement}
                        disabled={
                          quantity >=
                          (selectedVariant?.inventory?.quantity || 1)
                        }
                        className="w-12 h-12 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Action Buttons - Enhanced */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <motion.div className="flex-1 relative group">
                      <Button
                        onClick={handleAddToCart}
                        disabled={loading || !isAvailable}
                        size="lg"
                        className={`w-full relative overflow-hidden rounded-xl text-base lg:text-lg font-bold py-4 px-6 shadow-lg transition-all duration-300 ${
                          isAvailable
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-green-200/50 hover:shadow-green-300/60"
                            : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                        }`}
                        aria-label="Add to cart"
                      >
                        <div className="relative z-10 flex items-center justify-center gap-3">
                          <ShoppingCart className="h-5 w-5" />
                          <span>Add to Cart</span>
                          {!isAvailable && <X className="h-4 w-4 ml-auto" />}
                        </div>
                        <div className="absolute inset-0 bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-shrink-0"
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleWishlistToggle}
                        className={`w-14 h-14 rounded-xl border-2 transition-all duration-300 ${
                          isWishlisted
                            ? "border-red-300 dark:border-red-500 bg-red-50/50 dark:bg-red-900/20 text-red-500 shadow-lg shadow-red-200/30 hover:shadow-red-300/50"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                        }`}
                        aria-label={
                          isWishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        <Heart
                          className={`h-5 w-5 transition-all duration-300 ${
                            isWishlisted ? "fill-red-500" : ""
                          }`}
                        />
                      </Button>
                    </motion.div>
                  </div>

                  {/* Stock Status */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                      isAvailable
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                        : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {isAvailable ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        In Stock - Ready to ship
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Out of Stock
                      </>
                    )}
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Description and Tabs */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <Card className="border border-gray-200/60 dark:border-gray-700/60 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <CardContent className="p-6 lg:p-8 relative">
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white/50 to-emerald-50/30 dark:from-indigo-900/10 dark:via-gray-800/50 dark:to-emerald-900/10 opacity-80"></div>

              {/* Section Header */}
              <div className="relative mb-6 lg:mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-gray-100 dark:via-gray-200 dark:to-white bg-clip-text text-transparent tracking-tight">
                      About This Product
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        Curated Details
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expand/Collapse Toggle */}
                <motion.div
                  initial={false}
                  // animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-0 right-0 flex items-center gap-2 cursor-pointer group"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-200">
                    {isExpanded ? "Show Less" : "Read More"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-all duration-300 ${
                      isExpanded ? "rotate-180 " : "rotate-0"
                    } `}
                  />
                </motion.div>
              </div>

              {/* Enhanced Description Content */}
              <div
                className={`space-y-6 lg:space-y-8 transition-all duration-300 overflow-hidden ${
                  isExpanded ? "max-h-none" : "max-h-[200px] lg:max-h-[250px]"
                }`}
              >
                {/* Main Description - Enhanced Typography */}
                <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base lg:text-lg mb-6">
                    {isExpanded
                      ? product.description
                      : truncateDescription(product.description, 150)}
                  </p>

                  {/* Feature Highlights */}
                  {isExpanded && (
                    <div className="space-y-6">
                      {/* Key Features Section */}
                      {product.features && product.features.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                              Key Features
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {product.features
                              .slice(0, 4)
                              .map((feature, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 + index * 0.1 }}
                                  className="group flex items-start gap-3 p-4 bg-white/60 dark:bg-gray-800/40 rounded-xl border border-gray-100/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/60 hover:border-gray-200/60 dark:hover:border-gray-600/60 transition-all duration-300"
                                >
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200">
                                    <span className="text-white text-xs font-bold">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm lg:text-base leading-relaxed">
                                      {feature}
                                    </p>
                                  </div>
                                </motion.div>
                              ))}
                          </div>

                          {product.features.length > 4 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ delay: 0.5 }}
                              className="text-center pt-4"
                            >
                              <Button
                                variant="link"
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium p-0 h-auto"
                                onClick={() =>
                                  setShowAllFeatures(!showAllFeatures)
                                }
                              >
                                {showAllFeatures
                                  ? "Show Less Features"
                                  : `+${product.features.length - 4} More`}
                                <ChevronDown
                                  className={`h-3 w-3 ml-1 transition-transform duration-200 ${
                                    showAllFeatures ? "rotate-180" : ""
                                  }`}
                                />
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* Specifications Table */}
                      {product.specifications &&
                        Object.keys(product.specifications).length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                                Technical Specifications
                              </h3>
                            </div>

                            <div className="overflow-x-auto">
                              <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-100/40 dark:border-gray-700/40">
                                <table className="w-full">
                                  <tbody className="divide-y divide-gray-100/50 dark:divide-gray-700/50">
                                    {Object.entries(product.specifications).map(
                                      ([key, value], index) => (
                                        <motion.tr
                                          key={key}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{
                                            delay: 0.3 + index * 0.05,
                                          }}
                                          className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200"
                                        >
                                          <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                            {key
                                              .replace(/([A-Z])/g, " $1")
                                              .replace(/^./, (str) =>
                                                str.toUpperCase()
                                              )}
                                          </td>
                                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {Array.isArray(value)
                                              ? value.join(", ")
                                              : value}
                                          </td>
                                        </motion.tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Usage Tips */}
                      {isExpanded && (
                        <div className="space-y-4 pt-6 border-t border-gray-100/50 dark:border-gray-700/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Lightbulb className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                              Pro Tips
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              {
                                icon: "✨",
                                title: "Maintenance",
                                content:
                                  "Clean with mild soap and water. Avoid abrasive cleaners to maintain the finish.",
                              },
                              {
                                icon: "🔧",
                                title: "Best Use",
                                content:
                                  "Perfect for daily commutes, gym sessions, or weekend adventures.",
                              },
                              {
                                icon: "♻️",
                                title: "Sustainability",
                                content:
                                  "Made with 70% recycled materials. BPA-free and dishwasher safe.",
                              },
                              {
                                icon: "🏆",
                                title: "Warranty",
                                content:
                                  "Lifetime warranty against manufacturing defects. Register your product today.",
                              },
                            ].map((tip, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className="group flex items-start gap-3 p-4 bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 rounded-xl border border-gray-100/30 dark:border-gray-700/30 hover:shadow-md transition-all duration-300"
                              >
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-lg group-hover:scale-110 transition-transform duration-200">
                                  {tip.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm lg:text-base mb-2 leading-tight">
                                    {tip.title}
                                  </h4>
                                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {tip.content}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Call to Action */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="pt-6 border-t border-gray-100/50 dark:border-gray-700/50 mt-8"
                    >
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base mb-4 italic">
                          "Quality craftsmanship that stands the test of time."
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Quote className="h-4 w-4" />
                          <span>Customer Favorite</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Progress Indicator for Truncated Content */}
              {!isExpanded &&
                product.description &&
                product.description.length > 150 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-6 left-6 right-6 bg-gradient-to-t from-white/90 dark:from-gray-800/90 to-transparent h-12 pointer-events-none"
                  />
                )}
            </CardContent>
          </Card>
          <Tabs defaultValue="benefits" className="mt-6 sm:mt-8">
            <TabsList className="bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-wrap justify-start sm:justify-center overflow-x-auto p-1">
              <TabsTrigger
                value="benefits"
                className="data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-600 text-sm sm:text-base text-gray-900 dark:text-gray-100"
              >
                Benefits
              </TabsTrigger>
              <TabsTrigger
                value="usage"
                className="data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-600 text-sm sm:text-base text-gray-900 dark:text-gray-100"
              >
                Usage
              </TabsTrigger>
              <TabsTrigger
                value="faqs"
                className="data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-600 text-sm sm:text-base text-gray-900 dark:text-gray-100"
              >
                FAQs
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-600 text-sm sm:text-base text-gray-900 dark:text-gray-100"
              >
                Reviews
              </TabsTrigger>
            </TabsList>
            <TabsContent value="benefits">
              <Card className="border-gray-200 dark:border-gray-700 mt-4 shadow-sm bg-white/90 dark:bg-gray-800/90">
                <CardContent className="p-4 sm:p-6">
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    {product.benefits?.map((benefit, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {benefit}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="usage">
              <Card className="border-gray-200 dark:border-gray-700 mt-4 shadow-sm bg-white/90 dark:bg-gray-800/90">
                <CardContent className="p-4 sm:p-6">
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    {UsageList.map((usage, index) => {
                      return (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {usage}
                        </motion.li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="faqs">
              <Card className="border-gray-200 dark:border-gray-700 mt-4 shadow-sm bg-white/90 dark:bg-gray-800/90">
                <CardContent className="p-4 sm:p-6">
                  <Accordion type="single" collapsible>
                    {product.faqs?.map((faq, index) => (
                      <AccordionItem key={index} value={`faq-${index}`}>
                        <AccordionTrigger className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews">
              {/* <Card className="border-gray-200 dark:border-gray-700 mt-4 shadow-sm bg-white/90 dark:bg-gray-800/90"> */}
              {/* <CardContent className="p-4 sm:p-6"> */}

              <ReviewsTabContent
                productId={product._id}
                productName={product.name}
                userId={userId}
              />
              {/* </CardContent> */}
              {/* </Card> */}
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-10 lg:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
              You May Also Like
            </h2>
            <Carousel className="w-full relative">
              <CarouselContent className="-ml-2 sm:-ml-4">
                {relatedProducts.map((related) => (
                  <CarouselItem
                    key={related._id}
                    className="pl-2 sm:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <Card className="border-gray-200 dark:border-gray-700 shadow-sm bg-white/90 dark:bg-gray-800/90">
                      <CardContent className="p-3 sm:p-4">
                        <div className="relative w-full h-40 sm:h-48 rounded-md overflow-hidden">
                          <Image
                            src={
                              related.images?.find((img) => img.isPrimary)
                                ?.url ||
                              related.images?.[0]?.url ||
                              "/product_image.png"
                            }
                            alt={related.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h3 className="mt-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {related.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                          ₹
                          {Math.min(
                            ...(related.variants?.map((v) => v.price || 0) || [
                              0,
                            ])
                          )}
                        </p>
                        <Button
                          asChild
                          variant="outline"
                          className="mt-2 w-full border-gray-500 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm sm:text-base"
                        >
                          <Link
                            href={`/product-info/${related._id}`}
                            aria-label={`View ${related.name}`}
                          >
                            View Product
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {/* <CarouselPrevious className="bg-gray-200 dark:bg-gray-700" />
              <CarouselNext className="bg-gray-200 dark:bg-gray-700" /> */}
              <div
                className={`absolute left-1/2 -bottom-10 flex gap-2 ${
                  relatedProducts.length < 4 ? "" : "hidden"
                }`}
              >
                <CarouselPrevious className="h-8 w-8 sm:h-10 sm:w-10 bg-green-800 text-white  transition-colors duration-300" />
                <CarouselNext className="h-8 w-8 sm:h-10 sm:w-10 bg-green-800 text-white  transition-colors duration-300" />
              </div>
            </Carousel>
          </div>
        )}
      </motion.div>
    </div>
  );
}
