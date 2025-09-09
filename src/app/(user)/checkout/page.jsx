"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package, CreditCard, MapPin, Home } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Link from "next/link";


// Main Component
const CheckoutPage = () => {
  const router = useRouter();
  const { placeOrder, error } = useCart();
  const { toast } = useToast();

  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productDetailsMap, setProductDetailsMap] = useState({});

  // Step 1: Load checkout data from sessionStorage
  useEffect(() => {
    const dataStr = sessionStorage.getItem("checkoutData");
    if (!dataStr) {
      router.replace("/cart");
      return;
    }

    try {
      const parsedData = JSON.parse(dataStr);
      setCheckoutData(parsedData);
    } catch (error) {
      console.error("Invalid checkoutData in sessionStorage.");
      router.replace("/cart");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    }
  }, [error, toast]);

  // Step 2: Fetch up-to-date product info for each item
  useEffect(() => {
    const fetchProducts = async () => {
      if (!checkoutData || !checkoutData.cartItems?.length) return;

      const token = localStorage.getItem("user-token");
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      const fetchedProducts = {};

      await Promise.all(
        checkoutData.cartItems.map(async (item) => {
          try {
            const res = await axios.get(`/api/products/${item.productId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            // console.log("Fetched product:", item.productId, res.data);
            fetchedProducts[item.productId] = res.data.data;
          } catch (error) {
            console.error(`Failed to fetch product ${item.productId}`, error);
          }
        })
      );

      setProductDetailsMap(fetchedProducts);
    };

    fetchProducts();
  }, [checkoutData]);

  const handlePlaceOrder = () => {
    try {
      const orderId = placeOrder(
        checkoutData.deliveryAddress,
        checkoutData.paymentMethod
      );

      toast({
        title: "Order Placed Successfully!",
        description: `Your order ${orderId} has been confirmed.`,
        type: "success",
      });
      sessionStorage.removeItem("checkoutData");
      router.push("/orders");
    } catch (error) {
      console.error("Error while placing the order: ", error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading || !checkoutData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  }
  const { deliveryAddress, paymentMethod, cartItems, totalAmount } =
    checkoutData;

  // console.log(cartItems);

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      {/* <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-500">Review your order details</p>
        </div>
      </header> */}

      {/* Breadcrumb Navigation */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-teal-600 flex items-center">
            <Home className="h-4 w-4 inline-block mr-2" />
            Home
          </Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-teal-600">
            cart
          </Link>
          <span>/</span>
          <span className="text-teal-600">Checkout</span>
        </nav>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto grid gap-6 lg:grid-cols-3">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{deliveryAddress.fullName}</p>
                  <p className="text-gray-600">{deliveryAddress.street}</p>
                  <p className="text-gray-600">
                    {deliveryAddress.city}, {deliveryAddress.state}{" "}
                    {deliveryAddress.zipCode}
                  </p>
                  {deliveryAddress.phone && (
                    <p className="text-gray-600">
                      Phone: {deliveryAddress.phone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium">
                    {paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "Online Payment"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item, index) => {
                    const product = productDetailsMap[item.productId];

                    // if (!product) return null;
                    if (!product) {
                      return (
                        <div key={index} className="text-red-500">
                          Product {item.productId} not found
                        </div>
                      );
                    }

                    return (
                      <div key={index}>
                        <div className="flex items-center gap-4">
                          <img
                            src={product.images[0].url || "/placeholder.svg"}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-gray-500">
                              ${product.variants[0].price} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">
                            ₹
                            {(
                              product.variants[0].price * item.quantity
                            ).toFixed(2)}
                          </p>
                        </div>
                        {index < cartItems.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Summary */}
          <div className="">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex flex-col justify-evenly h-full">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="text-xs text-gray-600 space-y-1 mb-5">
                    <p>• Estimated delivery: 5-7 business days</p>
                    <p>• Free returns within 30 days</p>
                    <p>• Customer support available 24/7</p>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    className="w-full"
                    size="lg"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Place Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
