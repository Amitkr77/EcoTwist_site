"use client";

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useCallback, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import {
  fetchCart,
  updateCart,
  removeFromCart,
  clearCart,
  resetError,
  addToCart,
  setGuestCartFlag,
  refreshCartItems,
} from "@/store/slices/cartSlice";
import { fetchProducts } from "@/store/slices/productSlices";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Tag,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import debounce from "lodash/debounce";

export default function CartPage() {
  const dispatch = useDispatch();
  const {
    items = [],
    totalPrice = 0,
    totalQuantity = 0,
    status,
    error,
    isGuestCart = false,
  } = useSelector((state) => state.cart || {});
  const {
    byId: productsById = {},
    allIds = [],
    status: productStatus,
  } = useSelector((state) => state.products || {});
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isClearing, setIsClearing] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check authentication status
  const checkAuthStatus = useCallback(() => {
    const token = localStorage.getItem("user-token");
    const isGuest = !token;
    dispatch(setGuestCartFlag(isGuest));
    console.log("Auth check - Is guest:", isGuest);
    return isGuest;
  }, [dispatch]);

  // Fetch cart and products only once on mount
  useEffect(() => {
    const isGuest = checkAuthStatus();

    const loadProducts = async () => {
      try {
        const result = await dispatch(fetchProducts());
        if (fetchProducts.fulfilled.match(result)) {
          console.log("✅ Products loaded successfully");
          console.log("Products count:", Object.keys(productsById).length);

          setTimeout(() => {
            console.log("🔄 Now fetching cart...");
            dispatch(fetchCart());
          }, 100);
        }
      } catch (error) {
        console.error("❌ Failed to load products:", error);
      } finally {
        setInitialLoad(false);
      }
    };

    loadProducts();

    return () => {
      dispatch(resetError());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, checkAuthStatus]);

  // Handle errors - don't show error toast on initial load for "fetch cart" errors
  useEffect(() => {
    if (status === "failed" && error && !initialLoad) {
      // Only show toast for non-fetch errors or user actions
      if (!error.includes("Failed to fetch cart") || !isGuestCart) {
        toast.error(error);
      }
      console.error("🚨 Cart error:", error);
    } else if (status === "succeeded") {
      console.log("✅ Cart operation successful");
    }
  }, [status, error, initialLoad, isGuestCart]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user-token" && e.newValue) {
        console.log("Token set - Merging guest cart");
        dispatch(mergeGuestCart());
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [dispatch]);

  // Debounced update for quantity
  const debouncedUpdateCart = useCallback(
    (item, newQuantity) => {
      const updateFn = (item, newQuantity) => {
        if (newQuantity >= 0) {
          if (newQuantity === 0) {
            dispatch(
              removeFromCart({
                productId: item.productId,
                variantSku: item.variantSku,
              })
            )
              .unwrap()
              .then(() => {
                toast.info(`${item.name} removed from cart`);
                console.log("✅ Item removed successfully");
              })
              .catch((err) => {
                toast.error(err || "Failed to remove from cart");
                console.error("❌ Remove failed:", err);
              });
          } else {
            dispatch(
              updateCart({
                productId: item.productId,
                variantSku: item.variantSku,
                quantity: newQuantity,
              })
            )
              .unwrap()
              .then(() => {
                toast.success(`Updated quantity for ${item.name}`);
                console.log("✅ Quantity updated successfully");
              })
              .catch((err) => {
                toast.error(err || "Failed to update cart");
                console.error("❌ Update failed:", err);
              });
          }
        }
      };
      const debouncedFn = debounce(updateFn, 500);
      debouncedFn(item, newQuantity);
    },
    [dispatch]
  );

  // Apply promo code (mock logic)
  const handleApplyPromo = () => {
    const validCodes = {
      save10: { discount: 10 },
      freeship: { discount: 0, freeShipping: true },
    };
    const code = promoCode.toLowerCase().trim();
    if (validCodes[code]) {
      const promo = validCodes[code];
      const newDiscount = promo.discount
        ? totalPrice * (promo.discount / 100)
        : 0;
      setDiscount(newDiscount);
      toast.success(
        promo.freeShipping
          ? "Free shipping applied! 🎉"
          : `${promo.discount}% discount applied! Save ₹${newDiscount.toFixed(
              2
            )}`
      );
    } else {
      setDiscount(0);
      toast.error("Invalid promo code. Try SAVE10 or FREESHIP");
    }
  };

  // Calculate final total
  const shipping = totalPrice >= 499 ? 0 : 69;
  const finalTotal = Math.max(0, totalPrice - discount + shipping).toFixed(2);

  // Handle clear cart
  const handleClearCart = () => {
    setIsClearing(true);
    dispatch(clearCart())
      .unwrap()
      .then(() => {
        toast.success("Cart cleared successfully");
        console.log("✅ Cart cleared");
      })
      .catch((err) => {
        toast.error(err || "Failed to clear cart");
        console.error("❌ Clear cart failed:", err);
      })
      .finally(() => setIsClearing(false));
  };

  // Get product details for cart item if missing
  const getProductDetails = useCallback(
    (item) => {
      console.log("🔍 Checking item for enrichment:", item);

      // Extract productId as a string from item.productId._id
      const productId = item.productId?._id || item.productId;
      if (!productId || typeof productId !== "string") {
        console.warn("⚠️ Invalid productId for cart item:", item);
        return {
          ...item,
          productId: "unknown", // Fallback to avoid breaking the UI
          name: item.name || "Product not found",
          price: typeof item.price === "number" ? item.price : 0,
          images: Array.isArray(item.images)
            ? item.images
            : ["/product_image.png"],
          description: item.description || "",
          variantName: item.variantName || "",
          quantity: item.quantity || 1,
        };
      }

      // If item already has all necessary fields, return as is
      if (
        item.name &&
        typeof item.price === "number" &&
        item.price >= 0 &&
        Array.isArray(item.images) &&
        item.images.length > 0
      ) {
        console.log("✅ Item already enriched:", item.name);
        return { ...item, productId, quantity: item.quantity || 1 };
      }

      const product = productsById[productId];

      if (!product) {
        console.warn("⚠️ Product not found for cart item:", productId);
        return {
          ...item,
          productId,
          name: item.name || "Product not found",
          price: typeof item.price === "number" ? item.price : 0,
          images: Array.isArray(item.images)
            ? item.images
            : ["/product_image.png"],
          description: item.description || "",
          variantName: item.variantName || "",
          quantity: item.quantity || 1,
        };
      }

      const variant = product.variants?.find((v) => v.sku === item.variantSku);
      const firstImage = product.images?.[0]?.url || "/product_image.png";

      const enrichedItem = {
        ...item,
        productId, // Store the string ID
        name: product.name || "Unnamed Product",
        description: product.description || "",
        images: Array.isArray(product.images)
          ? product.images.map((img) => img.url)
          : [firstImage],
        price:
          typeof variant?.price === "number"
            ? variant.price
            : typeof product.variants?.[0]?.price === "number"
            ? product.variants[0].price
            : 0,
        variantName: variant?.name || variant?.sku || "",
        stock: product.stock || 999,
        quantity: item.quantity || 1,
      };

      console.log(
        "✅ Enriched item:",
        enrichedItem.name,
        "Price:",
        enrichedItem.price
      );
      return enrichedItem;
    },
    [productsById]
  );

  // Enhanced items with product details
  const enhancedItems = useMemo(() => {
    console.log("🔄 Recomputing enhanced items, raw items:", items.length);
    const enriched = items.map((item) => getProductDetails(item));
    console.log("✅ Enhanced items computed:", enriched.length);
    return enriched;
  }, [items, getProductDetails]);

  // Manually refresh cart items if needed (for guest cart sync)
  useEffect(() => {
    if (isGuestCart && enhancedItems.length > 0 && items.length > 0) {
      // Ensure all items are properly enriched
      const needsRefresh = items.some(
        (item) =>
          !item.name ||
          typeof item.price !== "number" ||
          !Array.isArray(item.images)
      );

      if (needsRefresh) {
        console.log("🔄 Manually refreshing guest cart items");
        dispatch(refreshCartItems({ items: enhancedItems }));
      }
    }
  }, [isGuestCart, enhancedItems, items, dispatch]);

  // Suggested products
  const suggestedProducts = useMemo(() => {
    return allIds
      .filter((id) => !enhancedItems.some((item) => item.productId === id))
      .slice(0, 4)
      .map((id) => productsById[id])
      .filter((product) => product && product.images?.length > 0);
  }, [allIds, enhancedItems, productsById]);

  // Show loading state only during initial load or when no items but loading
  const isLoading =
    initialLoad || (status === "loading" && productStatus !== "succeeded");

  if (isLoading && enhancedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex justify-center items-center pt-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 dark:text-green-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {initialLoad ? "Loading your cart..." : "Updating cart..."}
          </p>
        </div>
      </div>
    );
  }

  // Only show error state for critical errors after initial load
  if (
    status === "failed" &&
    !initialLoad &&
    error &&
    !error.includes("Failed to fetch cart")
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900 dark:to-pink-900 pt-20 text-center">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="space-x-2">
            <Button
              onClick={() => {
                setInitialLoad(true);
                dispatch(fetchProducts()).then(() => dispatch(fetchCart()));
              }}
              className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white"
              aria-label="Retry loading cart"
            >
              Retry
            </Button>
            <Link href="/products">
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-600"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart with suggestions
  if (enhancedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 pt-20 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6 mt-16">
            <Link
              href="/products"
              className="mr-4 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
            >
              <ArrowLeft className="w-6 h-6" aria-label="Back to products" />
            </Link>
            <h2 className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-gray-100">
              Your Cart
            </h2>
          </div>

          {/* Empty State */}
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Your Cart is Empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isGuestCart
                  ? "Looks like you haven't added anything to your cart yet. Start shopping!"
                  : "You have no items in your cart. Start shopping!"}
              </p>
              <Link
                href="/products"
                className="inline-block bg-green-600 dark:bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 font-medium"
              >
                Continue Shopping
              </Link>

              {isGuestCart && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  <Link
                    href="/login"
                    className="text-green-600 hover:underline font-medium"
                  >
                    Sign in
                  </Link>{" "}
                  to save your cart and get personalized recommendations
                </p>
              )}
            </div>

            {/* Suggested Products */}
            {suggestedProducts.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">
                  You Might Like These
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {suggestedProducts.map((product) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                      >
                        <Link
                          href={`/product-info/${product._id}`}
                          className="block"
                        >
                          <Image
                            src={
                              product.images?.find((img) => img.isPrimary)
                                ?.url ||
                              product.images?.[0]?.url ||
                              "/product_image.png"
                            }
                            alt={product.name}
                            width={150}
                            height={150}
                            className="object-cover rounded-md w-full h-32 mb-3"
                          />
                        </Link>
                        <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-green-600 dark:text-green-400 font-semibold mb-3">
                          ₹
                          {Math.min(
                            ...(product.variants?.map((v) => v.price || 0) || [
                              0,
                            ])
                          ).toFixed(2)}
                        </p>
                        <Button
                          variant="outline"
                          className="w-full border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log(
                              "🛒 Adding suggested product to cart:",
                              product._id
                            );
                            dispatch(
                              addToCart({
                                productId: product._id,
                                variantSku: product.variants?.[0]?.sku,
                                quantity: 1,
                              })
                            )
                              .unwrap()
                              .then((result) => {
                                console.log(
                                  "✅ Suggested product added:",
                                  result
                                );
                                toast.success(`${product.name} added to cart!`);
                                // For guest users, manually refresh to ensure enrichment
                                if (isGuestCart) {
                                  setTimeout(() => {
                                    dispatch(fetchCart());
                                  }, 100);
                                }
                              })
                              .catch((err) => {
                                console.error(
                                  "❌ Failed to add suggested product:",
                                  err
                                );
                                toast.error(err || "Failed to add to cart");
                              });
                          }}
                          aria-label={`Add ${product.name} to cart`}
                        >
                          Add to Cart
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 pt-20 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link
          href="/products"
          className="mr-4 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
        >
          <ArrowLeft className="w-6 h-6" aria-label="Back to products" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-gray-100">
            Shopping Cart ({totalQuantity}{" "}
            {totalQuantity === 1 ? "item" : "items"})
          </h2>
          {isGuestCart && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Guest cart •{" "}
              <Link href="/login" className="text-green-600 hover:underline">
                Sign in to save
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {status === "loading" && enhancedItems.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 dark:text-green-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Updating your cart...
              </p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {enhancedItems.map((item, index) => {
              // Ensure productId is a valid string
              if (!item.productId || typeof item.productId !== "string") {
                console.warn(
                  `Invalid productId for item: ${JSON.stringify(item)}`
                );
                return null; // Skip rendering this item
              }

              return (
                <motion.div
                  key={`${item.productId}-${item.variantSku}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  layout
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md p-4 border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/50 dark:hover:border-gray-600/50 transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Product Image and Details */}
                    <div className="flex items-start gap-4 w-full lg:w-auto flex-1">
                      <Link
                        href={`/product-info/${item.productId}`}
                        className="relative  flex-shrink-0"
                      >
                        {Array.isArray(item.images) && item.images[0] ? (
                          <Image
                            src={item.images[0]}
                            alt={item.name || "Product"}
                            width={80}
                            height={80}
                            className="object-cover rounded-md hover:opacity-80 transition-opacity duration-200 h-full"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-400 dark:text-gray-300" />
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product-info/${item.productId}`}
                          className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-400 line-clamp-1 transition-colors"
                        >
                          {item.name || "Product"}
                        </Link>

                        {item.variantName && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.variantName}
                          </p>
                        )}

                        {item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <p className="text-green-600 dark:text-green-400 font-medium mt-2">
                          ₹{Number(item.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls and Actions */}
                    <div className="flex items-center justify-between w-full lg:w-auto gap-4 lg:gap-6">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            debouncedUpdateCart(
                              item,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          disabled={status === "loading" || item.quantity <= 1}
                          className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 h-10 w-10 p-0 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <span className="sr-only sm:not-sr-only">-</span>
                        </Button>

                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQty = Math.max(
                              1,
                              parseInt(e.target.value) || 1
                            );
                            if (newQty !== item.quantity) {
                              debouncedUpdateCart(item, newQty);
                            }
                          }}
                          className="w-16 h-10 text-center border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:ring-green-500 focus:border-green-500"
                          min={1}
                          max={item.stock || 99}
                          disabled={status === "loading"}
                          aria-label={`Quantity of ${item.name}`}
                        />

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            debouncedUpdateCart(item, item.quantity + 1)
                          }
                          disabled={status === "loading"}
                          className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 h-10 w-10 p-0 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <span className="sr-only sm:not-sr-only">+</span>
                        </Button>
                      </div>

                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-base whitespace-nowrap min-w-[80px] text-right">
                        ₹{(Number(item.price || 0) * item.quantity).toFixed(2)}
                      </p>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 h-10 w-10 p-2"
                            disabled={status === "loading"}
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
                              Remove Item?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                              Are you sure you want to remove{" "}
                              <strong>{item.name}</strong> from your cart? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="text-gray-600 dark:text-gray-300">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                dispatch(
                                  removeFromCart({
                                    productId: item.productId, // Use string productId
                                    variantSku: item.variantSku,
                                  })
                                )
                                  .unwrap()
                                  .then(() => {
                                    toast.info(
                                      `${item.name} removed from cart`
                                    );
                                    console.log("✅ Item removed from UI");
                                  })
                                  .catch((err) => {
                                    toast.error(
                                      err || "Failed to remove from cart"
                                    );
                                    console.error(
                                      "❌ Remove from UI failed:",
                                      err
                                    );
                                  });
                              }}
                              className="bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Clear Cart Button */}
          {enhancedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 w-full lg:w-auto px-6 py-2"
                    disabled={isClearing || status === "loading"}
                    aria-label="Clear cart"
                  >
                    {isClearing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Clearing Cart...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Cart ({enhancedItems.length} items)
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
                      Clear Entire Cart?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                      This will remove all {enhancedItems.length} items from
                      your cart. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="text-gray-600 dark:text-gray-300">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearCart}
                      className="bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600"
                    >
                      Clear All Items
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24 h-fit border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="lg:hidden w-full flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700"
              aria-label={
                showSummary ? "Hide order summary" : "Show order summary"
              }
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Order Summary
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform ${
                  showSummary ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {showSummary && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-700 dark:text-gray-300">
                        Subtotal ({totalQuantity} items)
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        ₹{totalPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between py-2">
                      <span className="text-gray-700 dark:text-gray-300">
                        Shipping Estimate
                      </span>
                      <span>
                        {shipping === 0 ? (
                          <>
                            <span className="line-through text-gray-500 mr-1">
                              ₹69
                            </span>
                            <span className="text-green-600">FREE</span>
                          </>
                        ) : (
                          `₹${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between py-2 text-green-600 dark:text-green-400">
                        <span>Discount Applied</span>
                        <span className="font-semibold">
                          -₹{discount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          Total
                        </span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ₹{finalTotal}
                        </span>
                      </div>
                    </div>
                  </div>

                 

                  {/* Checkout Button */}
                  <Link href="/checkout">
                    <button
                      className={`
        w-full max-w-md mx-auto 
        bg-gradient-to-r from-green-600 to-green-500 
        dark:from-green-500 dark:to-green-400 
        hover:from-green-700 hover:to-green-600 
        dark:hover:from-green-600 dark:hover:to-green-500 
        text-white py-3 px-4 rounded-lg 
        flex items-center justify-center 
        text-base sm:text-lg font-semibold 
        shadow-lg hover:shadow-xl 
        transition-all duration-300 ease-in-out 
        focus:outline-none focus:ring-4 focus:ring-green-300 
        dark:focus:ring-green-700 
        disabled:bg-gray-400 disabled:cursor-not-allowed 
        disabled:shadow-none disabled:hover:from-gray-400 disabled:hover:to-gray-400
      `}
                      disabled={status === "loading" || totalQuantity === 0}
                      aria-label={`Proceed to checkout for ₹${finalTotal}`}
                      aria-disabled={
                        status === "loading" || totalQuantity === 0
                      }
                    >
                      <CheckCircle
                        className="w-5 h-5 mr-2 sm:w-6 sm:h-6"
                        aria-hidden="true"
                      />
                      <span className="truncate">
                        Proceed to Checkout - ₹{finalTotal}
                      </span>
                    </button>
                  </Link>

                  {/* Tips */}
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Tag className="w-4 h-4 flex-shrink-0" />
                      Quick Tips
                    </h4>
                    <ul className="space-y-1 text-gray-700 dark:text-gray-300 list-disc pl-4">
                      <li>
                        Items in your cart aren&apos;t reserved checkout soon to
                        avoid stocks out.
                      </li>
                      <li>Enjoy free shipping on all orders over ₹499.</li>
                      {isGuestCart && (
                        <li>
                          <Link
                            href="/login"
                            className="text-green-600 hover:underline"
                          >
                            Sign in
                          </Link>{" "}
                          to save your cart and unlock exclusive offers
                        </li>
                      )}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      {!initialLoad && enhancedItems.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-2xl lg:hidden border-t border-gray-200 dark:border-gray-700 z-50"
        >
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Total
                </span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400 ml-2">
                  ₹{finalTotal}
                </span>
              </div>
              {discount > 0 && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  {promoCode.toUpperCase()} applied (-₹{discount.toFixed(2)})
                </span>
              )}
            </div>

            <Link href="/checkout">
              <Button
                className="bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 flex items-center text-white ml-4 px-6 py-3 shadow-lg"
                disabled={status === "loading"}
                aria-label="Checkout"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Checkout
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Suggested Products */}
      {suggestedProducts.length > 0 && (
        <div className="mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h3
              className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 sm:mb-8 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              You Might Also Like
            </motion.h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              <AnimatePresence mode="popLayout">
                {suggestedProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{
                      opacity: 0,
                      y: 20,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -20,
                      scale: 0.95,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                    }}
                    layout
                    whileHover={{ y: -4 }}
                    className="
                      bg-white dark:bg-gray-800 
                      rounded-xl overflow-hidden shadow-sm hover:shadow-lg 
                      transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50
                      hover:border-green-300/50 dark:hover:border-green-600/50
                      group cursor-pointer
                    "
                    onClick={() => {
                      // Direct navigation to product page
                      window.location.href = `/product-info/${product._id}`;
                    }}
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden h-48">
                      <Image
                        src={
                          product.images?.find((img) => img.isPrimary)?.url ||
                          product.images?.[0]?.url ||
                          "/product_image.png"
                        }
                        alt={product.name || "Product"}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="
                          object-cover w-full h-full
                          transition-all duration-300 group-hover:scale-105
                        "
                        priority={index < 2}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div className="space-y-1">
                        <h4
                          className="
                            text-sm font-medium text-gray-900 dark:text-gray-100 
                            leading-tight line-clamp-2
                            group-hover:text-gray-800 dark:group-hover:text-gray-200
                            transition-colors duration-200
                          "
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {product.name || "Unnamed Product"}
                        </h4>

                        <div className="flex items-center justify-between pt-1">
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                            ₹
                            {Math.min(
                              ...(product.variants?.map(
                                (v) => v.price || 0
                              ) || [0])
                            ).toFixed(2)}
                          </p>

                          {product.variants && product.variants.length > 1 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {product.variants.length} variants
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          if (isAdding) return;

                          setIsAdding(true);
                          setShowSuccess(false);

                          try {
                            console.log(
                              "🛒 Quick add from suggested products:",
                              product._id
                            );
                            const result = await dispatch(
                              addToCart({
                                productId: product._id,
                                variantSku: product.variants?.[0]?.sku,
                                quantity: 1,
                              })
                            ).unwrap();

                            console.log("✅ Quick add successful:", result);
                            toast.success(`${product.name} added to cart!`);

                            if (isGuestCart) {
                              setTimeout(() => dispatch(fetchCart()), 100);
                            }

                            setShowSuccess(true);
                            setTimeout(() => {
                              setShowSuccess(false);
                              setIsAdding(false);
                            }, 2000);
                          } catch (err) {
                            console.error("❌ Quick add failed:", err);
                            toast.error(
                              err?.message || "Failed to add to cart"
                            );
                            setIsAdding(false);
                          }
                        }}
                        className={`
                          w-full py-2.5 px-3 rounded-lg text-sm font-medium
                          border-2 ${
                            showSuccess
                              ? "border-green-600/30"
                              : "border-green-500/20"
                          } 
                          ${
                            showSuccess
                              ? "bg-green-100"
                              : isAdding
                              ? "bg-green-100/50"
                              : "bg-green-50"
                          } 
                          ${
                            showSuccess
                              ? "text-green-700"
                              : isAdding
                              ? "text-green-600"
                              : "text-green-700"
                          }
                          ${
                            isAdding || showSuccess
                              ? "cursor-not-allowed"
                              : "hover:bg-green-100 hover:border-green-500/40"
                          }
                          dark:border-green-400/30 
                          dark:${
                            showSuccess
                              ? "bg-green-900/40"
                              : isAdding
                              ? "bg-green-900/30"
                              : "bg-green-900/20"
                          } 
                          dark:text-green-300 dark:hover:bg-green-900/40
                          transition-all duration-200 flex items-center justify-center gap-2
                          focus:ring-2 focus:ring-green-500/30 focus:outline-none
                          group-hover:border-green-500/50
                          ${
                            isAdding || showSuccess ? "pointer-events-none" : ""
                          }
                        `}
                        disabled={isAdding || showSuccess}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        {showSuccess ? (
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Added!</span>
                          </span>
                        ) : isAdding ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Adding...</span>
                          </span>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
