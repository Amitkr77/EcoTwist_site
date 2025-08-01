"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import RazorpayPayment from "@/components/RazorpayPayment";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";


const CartPage = React.memo(() => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    getTotalItems,
    placeOrder,
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

  // Memoize total price and items to prevent recalculations
  const totalPrice = useMemo(() => getTotalPrice(), [getTotalPrice]);
  const totalItems = useMemo(() => getTotalItems(), [getTotalItems]);

  // Debounced address change handler
  const handleAddressChange = useCallback((field, value) => {
    setDeliveryAddress((prev) => ({ ...prev, [field]: value }));
  }, []);

  const isAddressValid = useMemo(
    () => deliveryAddress.fullName && deliveryAddress.street && deliveryAddress.city,
    [deliveryAddress.fullName, deliveryAddress.street, deliveryAddress.city]
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
      toast({
        title: "Payment Failed",
        description: error?.description || "Please try again later.",
        variant: "destructive",
      });
    },
    [toast]
  );

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
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 mt-20">
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
      </header>

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items & Address */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Cart Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {cartItems.map((item, index) => (
                  <div key={item.product.id} className="p-4">
                    <div className="flex items-center gap-4 py-2">
                      {/* <img
                        src={item.product.image || "/placeholder.svg"}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      /> */}
                      <Image src={item.product.image} alt={item.product.name} className=" object-cover rounded-lg" height={16} width={16} />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">${item.product.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {index < cartItems.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid gap-4 p-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      value={deliveryAddress.fullName}
                      onChange={(e) => handleAddressChange("fullName", e.target.value)}
                      placeholder="Enter full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={deliveryAddress.phone}
                      onChange={(e) => handleAddressChange("phone", e.target.value)}
                      placeholder="Enter phone number"
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="street" className="text-sm font-medium">
                      Street Address *
                    </Label>
                    <Input
                      id="street"
                      value={deliveryAddress.street}
                      onChange={(e) => handleAddressChange("street", e.target.value)}
                      placeholder="Enter street address"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={deliveryAddress.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      placeholder="Enter city"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm font-medium">
                      State
                    </Label>
                    <Input
                      id="state"
                      value={deliveryAddress.state}
                      onChange={(e) => handleAddressChange("state", e.target.value)}
                      placeholder="Enter state"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="text-sm font-medium">
                      ZIP Code
                    </Label>
                    <Input
                      id="zipCode"
                      value={deliveryAddress.zipCode}
                      onChange={(e) => handleAddressChange("zipCode", e.target.value)}
                      placeholder="Enter ZIP code"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 space-y-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="text-gray-700">
                        Cash on Delivery
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="text-gray-700">
                        Online Payment (Razorpay)
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="space-y-2">
                    {paymentMethod === "online" ? (
                      <RazorpayPayment
                        amount={totalPrice}
                        onSuccess={handleRazorpaySuccess}
                        onError={handleRazorpayError}
                        deliveryAddress={deliveryAddress}
                        disabled={!isAddressValid || isLoading}
                        className="w-full"
                      />
                    ) : (
                      <Button
                        onClick={handleCheckout}
                        disabled={!isAddressValid || isLoading}
                        className="w-full"
                      >
                        {isLoading ? "Processing..." : "Proceed to Checkout"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
});

CartPage.displayName = "CartPage";

export default CartPage;