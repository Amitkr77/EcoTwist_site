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
import {
  Loader2,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Tag,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify"; // Ensure react-toastify is installed: npm install react-toastify
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"; // For collapsible sections

function CartPage() {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isClearing, setIsClearing] = useState(false);
  const [showSummary, setShowSummary] = useState(true); // For collapsible mobile summary

  useEffect(() => {
    dispatch(fetchCart());
    return () => {
      dispatch(resetError()); // Clear errors on unmount
    };
  }, [dispatch]);

  // Debounced update for quantity
  const debouncedUpdateCart = useCallback(
    debounce((item, newQuantity) => {
      if (newQuantity >= 0) {
        if (newQuantity === 0) {
          dispatch(
            removeFromCart({ productId: item.productId, variantSku: item.variantSku })
          ).then(() => toast.info(`${item.name} removed from cart`));
        } else {
          dispatch(
            updateCart({
              productId: item.productId,
              variantSku: item.variantSku,
              quantity: newQuantity,
            })
          ).then(() => toast.success(`Updated quantity for ${item.name}`));
        }
      }
    }, 500),
    [dispatch]
  );

  function debounce(func, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  }

  // Apply promo code (mock logic)
  const handleApplyPromo = () => {
    const validCodes = {
      save10: { discount: 10 },
      freeship: { discount: 0, freeShipping: true },
    };
    const code = promoCode.toLowerCase();
    if (validCodes[code]) {
      const promo = validCodes[code];
      setDiscount(promo.discount ? cart.totalPrice * (promo.discount / 100) : 0);
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
  const shipping = 0.0; // Mock shipping cost
  const finalTotal = (cart.totalPrice - discount + shipping).toFixed(2);

  // Handle clear cart
  const handleClearCart = () => {
    setIsClearing(true);
    dispatch(clearCart())
      .unwrap()
      .then(() => toast.success("Cart cleared successfully"))
      .catch(() => toast.error("Failed to clear cart"))
      .finally(() => setIsClearing(false));
  };

  // Suggested products (mock data)
  const suggestedProducts = [
    {
      id: "689cd18b13218b9091c2c1fa",
      name: "Solstice Stainless Steel Tumbler",
      price: 1,
      image: "/products/tumbler/tumbler_1.png"
    },
    {
      id: "689cd324ca6d7017b035cbb8",
      name: "EcoHaul Organic Cotton Tote Bag",
      price: 19.99,
      image: "/products/tote/tote_1.png"
    },
    {
      id: "689cd324ca6d7017b035cbba",
      name: "EcoScribe Biodegradable Pen",
      price: 1,
      image: "/products/pen/pen_1.png"
    },
    // {
    //   id: "68becec163000a40753bb997",
    //   name: "ZeroWaste Stainless Steel Lunch Box",
    //   price: 1,
    //   image: "https://plus.unsplash.com/premium_photo-1661438553846-cdd78379e11b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGx1bmNoJTIwYm94fGVufDB8fDB8fHww"
    // }
  ];


  // Loading state
  if (cart.status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <span className="ml-2 text-gray-600">Loading your cart...</span>
        </div>
      </div>
    );
  }

  // Error state
  // if (cart.status === "failed") {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 text-center">
  //       <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
  //         <h2 className="text-2xl font-bold text-red-600 mb-4">
  //           Error Loading Cart
  //         </h2>
  //         <p className="text-gray-600 mb-6">{cart.error}</p>
  //         <Button
  //           onClick={() => dispatch(fetchCart())}
  //           className="bg-blue-600 hover:bg-blue-700 text-white"
  //         >
  //           Retry
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // }

  // Empty cart with suggestions
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 text-center">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">
            Start adding some items to your cart!
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
          {/* Suggested Products */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">You Might Like</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {suggestedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 p-4 rounded-lg shadow-sm"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={150}
                    height={150}
                    className="object-cover rounded-md mx-auto"
                  />
                  <h4 className="text-sm font-medium mt-2">{product.name}</h4>
                  <p className="text-blue-600 font-semibold">₹{product.price.toFixed(2)}</p>
                  <Button
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() =>
                      dispatch(
                        addToCart({
                          productId: product.id,
                          name: product.name,
                          price: product.price,
                          images: [product.image],
                          quantity: 1,
                        })
                      ).then(() => toast.success(`${product.name} added to cart`))
                    }
                  >
                    Add to Cart
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-20 p-4 md:p-6 ">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4 text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-2xl md:text-3xl font-medium">
          Shopping Cart ({cart.totalQuantity} items)
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cart.items.map((item) => (
              <motion.div
                key={`${item.productId}-${item.variantSku}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-gray-200"
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
                    <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <Link
                      href={`/product-info/${item.productId}`}
                      className="text-lg font-semibold hover:text-blue-600"
                    >
                      {item.name}
                    </Link>
                    {item.variantName && (
                      <p className="text-sm text-gray-600">
                        Variant: {item.variantName}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description.substring(0, 100)}...
                      </p>
                    )}
                    <p className="text-blue-600 font-medium">
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
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        debouncedUpdateCart(item, parseInt(e.target.value) || 1)
                      }
                      className="w-16 text-center"
                      min={0}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => debouncedUpdateCart(item, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <p className="font-medium">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Item?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {item.name} from your
                          cart?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            dispatch(
                              removeFromCart({
                                productId: item.productId,
                                variantSku: item.variantSku,
                              })
                            ).then(() => toast.info(`${item.name} removed from cart`))
                          }
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
          {cart.items.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="mt-4"
                  disabled={isClearing}
                >
                  {isClearing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Clear Cart
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Cart?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove all items from your cart?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearCart}>
                    Clear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6 sticky top-4 h-fit">
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="lg:hidden w-full flex justify-between items-center mb-4"
          >
            <h3 className="text-xl font-bold">Order Summary</h3>
            {showSummary ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>
          {showSummary && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.totalQuantity} items)</span>
                  <span>₹{cart.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Estimate</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code (e.g., SAVE10)"
                    className="flex-1"
                  />
                  <Button onClick={handleApplyPromo} variant="outline">
                    Apply
                  </Button>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full mt-6 bg-green-600 hover:bg-green-700 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                </Button>
              </Link>

              {/* Cart Tips */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm">
                <h4 className="font-semibold mb-2">Cart Tips</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Use promo code "SAVE10" for 10% off.</li>
                  <li>Free shipping with code "FREESHIP".</li>
                  <li>Checkout within 30 minutes to reserve items.</li>
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg lg:hidden flex justify-between items-center border-t">
        <div>
          <span className="font-bold">Total: ₹{finalTotal}</span>
          {discount > 0 && (
            <span className="text-green-600 ml-2">(-₹{discount.toFixed(2)})</span>
          )}
        </div>
        <Link href="/new-checkout">
          <Button className="bg-green-600 hover:bg-green-700 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Checkout
          </Button>
        </Link>
      </div>

      {/* Suggested Products */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">You Might Also Like</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {suggestedProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 p-4 rounded-lg shadow-sm"
            >
              <Image
                src={product.image}
                alt={product.name}
                width={150}
                height={150}
                className="object-cover rounded-md mx-auto"
              />
              <h4 className="text-sm font-medium mt-2">{product.name}</h4>
              <p className="text-blue-600 font-semibold">₹{product.price.toFixed(2)}</p>
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() =>
                  dispatch(
                    addToCart({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      images: [product.image],
                      quantity: 1,
                    })
                  ).then(() => toast.success(`${product.name} added to cart`))
                }
              >
                Add to Cart
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CartPage;