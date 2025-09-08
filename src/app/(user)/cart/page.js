"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, Home, ShoppingBag } from "lucide-react";

import { CartItems } from "@/components/cart/CartItems";
import { DeliveryAddressForm } from "@/components/cart/DeliveryAddressForm";
import { OrderSummary } from "@/components/cart/OrderSummary";
import PaymentSection from "@/components/cart/PaymentSection";
import axios from "axios";

const CartPage = () => {
  // Declare all hooks at the top, unconditionally
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    getTotalItems,
    placeOrder,
    user,
  } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState([]);
  const [productData, setProductData] = useState([]);
  const totalPrice = useMemo(() => getTotalPrice(), [getTotalPrice]);
  const totalItems = useMemo(() => getTotalItems(), [getTotalItems]);
  const isAddressValid = useMemo(
    () =>
      deliveryAddress.fullName.trim() &&
      deliveryAddress.street.trim() &&
      deliveryAddress.city.trim() &&
      deliveryAddress.zipCode.trim() &&
      deliveryAddress.phone.trim(),
    [deliveryAddress]
  );

  // Handle authentication check after hooks
  const userId = user?.id || user;

  // useEffect(() => {
  //   if (!userId) {
  //     toast({
  //       title: "Error",
  //       description: "Please log in to continue.",
  //       variant: "destructive",
  //     });
  //     router.push("/login");
  //   }
  // }, [userId, router, toast]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("user-token");
      if (!token || !userId) return;

      try {
        const response = await axios.get(`/api/user/services/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data.user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data.",
          variant: "destructive",
        });
      }
    };

    fetchUser();
  }, [userId, toast]);

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("user-token");
      if (!token || !userId || cartItems.length === 0) return;

      try {
        const productPromises = cartItems.map((item) =>
          axios.get(`/api/products/${item.productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );
        const responses = await Promise.all(productPromises);
        const products = responses.map((res) => res.data.data);
        setProductData(products);
      } catch (error) {
        console.error("Failed to fetch product data:", error);
        toast({
          title: "Error",
          description: "Failed to load product details.",
          variant: "destructive",
        });
      }
    };
    fetchProducts();
  }, [cartItems, userId, toast]);

  useEffect(() => {
    if (userData?.address) {
      setDeliveryAddress({
        fullName: userData.fullName || "",
        phone: userData.phone || "",
        street: userData.address[0].street || "",
        city: userData.address[0].city || "",
        state: userData.address[0].state || "",
        zipCode: userData.address[0].postalCode || "",
      });
    }
  }, [userData]);

  const handleAddressChange = useCallback(
    (field, value) => {
      setDeliveryAddress((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleCheckout = useCallback(async () => {
    if (!isAddressValid) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required delivery address fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "checkoutData",
          JSON.stringify({
            deliveryAddress,
            paymentMethod,
            cartItems,
            totalAmount: totalPrice,
          })
        );
      }
      router.push("/checkout");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to proceed with checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAddressValid, deliveryAddress, paymentMethod, cartItems, totalPrice, router, toast]);

  const handleRazorpaySuccess = useCallback(
    (paymentId) => {
      if (!paymentId) {
        toast({
          title: "Error",
          description: "Invalid payment ID.",
          variant: "destructive",
        });
        return;
      }
      if (!isAddressValid) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required delivery address fields.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      try {
        const orderId = placeOrder(deliveryAddress, "online");
        toast({
          title: "Payment Successful!",
          description: `Order ${orderId} has been placed successfully. Payment ID: ${paymentId}`,
        });
        router.push("/orders");
      } catch (error) {
        toast({
          title: "Payment Error",
          description: error?.message || "Failed to process payment.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isAddressValid, deliveryAddress, placeOrder, router, toast]
  );

  const handleRazorpayError = useCallback(
    (error) => {
      console.log(error);
      toast({
        title: "Payment Failed",
        description: error?.description || "Please try again later.",
        variant: "destructive",
      });
    },
    [toast]
  );

  // Render loading state for product details
  if (!userId) {
    return null; // Render nothing while redirecting
  }

  if (!productData.length && cartItems.length) {
    return <div>Loading product details...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Add some products to get started</p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 mt-20">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Shopping Cart</h1>
            <p className="text-sm text-gray-500">{totalItems} items</p>
          </div>
        </div>
      </header> */}

       {/* Breadcrumb Navigation */}
      <div className="max-w-6xl mx-auto px-4 py-4 mt-16">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-teal-600 flex items-center">
            <Home className="h-4 w-4 inline-block mr-2" />
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-teal-600">
            Products
          </Link>
          <span>/</span>
          <span className="text-teal-600">Cart</span>
        </nav>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Cart Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <CartItems
                  items={cartItems}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                />
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DeliveryAddressForm
                  address={deliveryAddress}
                  onChange={handleAddressChange}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Section */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <OrderSummary total={totalPrice} />
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <PaymentSection
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  handleCheckout={handleCheckout}
                  handleRazorpaySuccess={handleRazorpaySuccess}
                  handleRazorpayError={handleRazorpayError}
                  totalPrice={totalPrice}
                  deliveryAddress={deliveryAddress}
                  isAddressValid={isAddressValid}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;