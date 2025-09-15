"use client";

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useCallback } from "react";
import {
  fetchCart,
  updateCart,
  removeFromCart,
  clearCart,
  resetError,
} from "@/store/slices/cartSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, ShoppingBag, ArrowLeft, Tag, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import { fetchProducts } from "@/store/slices/productSlices";

export default function CartPage() {
  const dispatch = useDispatch();
  const { items, totalPrice, totalQuantity, status, error } = useSelector((state) => state.cart || {});
  const { byId: productsById, allIds, status: productStatus } = useSelector((state) => state.products || {});
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isClearing, setIsClearing] = useState(false);
  const [showSummary, setShowSummary] = useState(true);

  // Fetch cart and products
  useEffect(() => {
    const userId = localStorage.getItem("user-id");
    if (userId && status === "idle") {
      dispatch(fetchCart());
    }
    if (productStatus === "idle") {
      dispatch(fetchProducts());
    }
    return () => {
      dispatch(resetError());
    };
  }, [dispatch, status, productStatus]);

  // Handle errors
  useEffect(() => {
    if (status === "failed" && error) {
      toast.error(error);
      console.error("Cart error:", error);
    }
  }, [status, error]);

  // Debounced update for quantity
  const debouncedUpdateCart = useCallback(
    debounce((item, newQuantity) => {
      if (newQuantity >= 0) {
        if (newQuantity === 0) {
          dispatch(removeFromCart({ productId: item.productId, variantSku: item.variantSku }))
            .unwrap()
            .then(() => toast.info(`${item.name} removed from cart`))
            .catch((err) => toast.error(err || "Failed to remove from cart"));
        } else {
          dispatch(
            updateCart({
              productId: item.productId,
              variantSku: item.variantSku,
              quantity: newQuantity,
            })
          )
            .unwrap()
            .then(() => toast.success(`Updated quantity for ${item.name}`))
            .catch((err) => toast.error(err || "Failed to update cart"));
        }
      }
    }, 500),
    [dispatch]
  );

  // Apply promo code (mock logic)
  const handleApplyPromo = () => {
    const validCodes = {
      save10: { discount: 10 },
      freeship: { discount: 0, freeShipping: true },
    };
    const code = promoCode.toLowerCase();
    if (validCodes[code]) {
      const promo = validCodes[code];
      setDiscount(promo.discount ? totalPrice * (promo.discount / 100) : 0);
      toast.success(
        promo.freeShipping
          ? "Free shipping applied!"
          : `${promo.discount}% discount applied!`
      );
    } else {
      setDiscount(0);
      toast.error("Invalid promo code.");
    }
  };

  // Calculate final total
  const shipping = discount > 0 && promoCode.toLowerCase() === "freeship" ? 0 : 50; // Mock shipping cost
  const finalTotal = (totalPrice - discount + shipping).toFixed(2);

  // Handle clear cart
  const handleClearCart = () => {
    setIsClearing(true);
    dispatch(clearCart())
      .unwrap()
      .then(() => toast.success("Cart cleared successfully"))
      .catch((err) => toast.error(err || "Failed to clear cart"))
      .finally(() => setIsClearing(false));
  };

  // Suggested products from productSlice
  const suggestedProducts = allIds
    .filter((id) => !items.some((item) => item.productId === id))
    .slice(0, 3)
    .map((id) => productsById[id])
    .filter((product) => product && product.images?.length > 0);

  // Loading state
  if (status === "loading" || productStatus === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex justify-center items-center pt-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 dark:text-green-400 mx-auto" />
          <span className="mt-2 text-gray-600 dark:text-gray-400">Loading your cart...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (status === "failed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900 dark:to-pink-900 pt-20 text-center">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Error Loading Cart
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button
            onClick={() => dispatch(fetchCart())}
            className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white"
            aria-label="Retry loading cart"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty cart with suggestions
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 pt-20 p-4 md:p-6 text-center">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start adding some eco-friendly items to your cart!
          </p>
          <Link
            href="/products"
            className="inline-block bg-green-600 dark:bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600"
          >
            Continue Shopping
          </Link>
          {/* Suggested Products */}
          {suggestedProducts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">You Might Like</h3>
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
                      <Image
                        src={product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || "/product_image.png"}
                        alt={product.name}
                        width={150}
                        height={150}
                        className="object-cover rounded-md mx-auto"
                      />
                      <h4 className="text-sm font-medium mt-2 text-gray-900 dark:text-gray-100">{product.name}</h4>
                      <p className="text-green-600 dark:text-green-400 font-semibold">
                        ₹{Math.min(...(product.variants?.map((v) => v.price || 0) || [0])).toFixed(2)}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-2 w-full border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() =>
                          dispatch(
                            addToCart({
                              userId: localStorage.getItem("user-id"),
                              productId: product._id,
                              variantSku: product.variants?.[0]?.sku,
                              quantity: 1,
                            })
                          )
                            .unwrap()
                            .then(() => toast.success(`${product.name} added to cart`))
                            .catch((err) => toast.error(err || "Failed to add to cart"))
                        }
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 pt-20 p-4 md:p-6">
      <div className="flex items-center mb-6">
        <Link href="/products" className="mr-4 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
          <ArrowLeft className="w-6 h-6" aria-label="Back to products" />
        </Link>
        <h2 className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-gray-100">
          Shopping Cart ({totalQuantity} items)
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={`${item.productId}-${item.variantSku}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-gray-200 dark:border-gray-700"
              >
                {/* Product Image and Details */}
                <div className="flex items-start gap-4 w-full md:w-auto">
                  {item.images && item.images[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-gray-400 dark:text-gray-300" />
                    </div>
                  )}
                  <div>
                    <Link
                      href={`/products/${item.productId}`}
                      className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-400"
                    >
                      {item.name}
                    </Link>
                    {item.variantName && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Variant: {item.variantName}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.description.substring(0, 100)}...
                      </p>
                    )}
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Quantity and Actions */}
                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => debouncedUpdateCart(item, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => debouncedUpdateCart(item, parseInt(e.target.value) || 1)}
                      className="w-16 text-center border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                      min={0}
                      aria-label={`Quantity of ${item.name}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => debouncedUpdateCart(item, item.quantity + 1)}
                      className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </Button>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Remove Item?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                          Are you sure you want to remove {item.name} from your cart?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="text-gray-600 dark:text-gray-300">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            dispatch(removeFromCart({ productId: item.productId, variantSku: item.variantSku }))
                              .unwrap()
                              .then(() => toast.info(`${item.name} removed from cart`))
                              .catch((err) => toast.error(err || "Failed to remove from cart"))
                          }
                          className="bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Clear Cart Button */}
          {items.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="mt-4 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600"
                  disabled={isClearing}
                  aria-label="Clear cart"
                >
                  {isClearing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Clear Cart
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Clear Cart?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                    Are you sure you want to remove all items from your cart?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-gray-600 dark:text-gray-300">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearCart}
                    className="bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600"
                  >
                    Clear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24 h-fit border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="lg:hidden w-full flex justify-between items-center mb-4"
            aria-label={showSummary ? "Hide order summary" : "Show order summary"}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Order Summary</h3>
            {showSummary ? (
              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
          <AnimatePresence>
            {showSummary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Subtotal ({totalQuantity} items)</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Shipping Estimate</span>
                    <span>₹{shipping.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <hr className="my-2 border-gray-200 dark:border-gray-600" />
                  <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100">
                    <span>Total</span>
                    <span>₹{finalTotal}</span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code (e.g., SAVE10)"
                      className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                      aria-label="Promo code"
                    />
                    <Button
                      onClick={handleApplyPromo}
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                      aria-label="Apply promo code"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                <Link href="/checkout">
                  <Button
                    className="w-full mt-6 bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 flex items-center justify-center text-white"
                    aria-label="Proceed to checkout"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Proceed to Checkout
                  </Button>
                </Link>

                {/* Cart Tips */}
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                  <h4 className="font-semibold mb-2">Cart Tips</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Use promo code &quot;SAVE10&quot; for 10% off.</li>
                    <li>Free shipping with code &quot;FREESHIP&quot;.</li>
                    <li>Checkout within 30 minutes to reserve items.</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-lg lg:hidden flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
        <div>
          <span className="font-bold text-gray-900 dark:text-gray-100">Total: ₹{finalTotal}</span>
          {discount > 0 && (
            <span className="text-green-600 dark:text-green-400 ml-2">(-₹{discount.toFixed(2)})</span>
          )}
        </div>
        <Link href="/checkout">
          <Button
            className="bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 flex items-center text-white"
            aria-label="Checkout"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Checkout
          </Button>
        </Link>
      </div>

      {/* Suggested Products */}
      {suggestedProducts.length > 0 && (
        <div className="mt-8 max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">You Might Also Like</h3>
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
                  <Image
                    src={product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || "/product_image.png"}
                    alt={product.name}
                    width={150}
                    height={150}
                    className="object-cover rounded-md mx-auto"
                  />
                  <h4 className="text-sm font-medium mt-2 text-gray-900 dark:text-gray-100">{product.name}</h4>
                  <p className="text-green-600 dark:text-green-400 font-semibold">
                    ₹{Math.min(...(product.variants?.map((v) => v.price || 0) || [0])).toFixed(2)}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2 w-full border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() =>
                      dispatch(
                        addToCart({
                          userId: localStorage.getItem("user-id"),
                          productId: product._id,
                          variantSku: product.variants?.[0]?.sku,
                          quantity: 1,
                        })
                      )
                        .unwrap()
                        .then(() => toast.success(`${product.name} added to cart`))
                        .catch((err) => toast.error(err || "Failed to add to cart"))
                    }
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
  );
}