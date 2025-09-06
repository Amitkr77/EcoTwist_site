"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  MapPin,
  CreditCard,
  Calendar,
  Eye,
  ShoppingBag,
  X,
  Phone,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Input } from "@/components/ui/input";

const OrdersPage = React.memo(() => {
  const { orders, isHydrated } = useCart(); // Hook 1: useContext
  const [searchTerm, setSearchTerm] = useState(""); // Hook 2: useState

  // Hook 3: useMemo for getStatusColor
  const getStatusColor = useMemo(
    () => (status) => {
      switch (status) {
        case "pending":
          return "bg-yellow-500";
        case "confirmed":
          return "bg-blue-500";
        case "shipped":
          return "bg-purple-500";
        case "delivered":
          return "bg-green-500";
        case "cancelled":
          return "bg-red-500";
        default:
          return "bg-gray-500";
      }
    },
    []
  );

  // Hook 4: useMemo for formatDate
  const formatDate = useMemo(
    () => (dateString) => {
      const date = new Date(dateString);
      return date.toString() !== "Invalid Date"
        ? date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "N/A";
    },
    []
  );

  // Hook 5: useMemo for filteredOrders
  const filteredOrders = useMemo(() => {
    return orders
      .filter(
        (order) =>
          typeof order === "object" && order !== null && "items" in order
      )
      .filter(
        (order) =>
          order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
  }, [orders, searchTerm]);

  // Hook 6: useMemo for totalSpent (moved before early returns)
  const totalSpent = useMemo(
    () =>
      filteredOrders
        .reduce((sum, order) => sum + order.totalAmount, 0)
        .toFixed(2),
    [filteredOrders]
  );

  // Early return for loading state
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full animate-pulse mb-4" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-6 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Early return for empty state
  if (filteredOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? "No orders match your search."
                : "Start shopping to see your orders here"}
            </p>
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm mt-20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500">
              {filteredOrders.length} order(s) found
            </p>
          </div>
          <Input
            type="text"
            placeholder="Search by order ID or product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {filteredOrders.map((order) => (
            <Card
              key={order._id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                      <Package className="w-5 h-5 text-blue-600" />
                      Order #{order.orderId}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Placed on {formatDate(order.orderDate)}
                    </p>
                  </div>
                  <Badge
                    className={`text-white ${getStatusColor(order.status)}`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Items ({order.items.length})
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                      >
                        {/* <Image
                          src="/placeholder.svg" // Fallback since JSON lacks image
                          alt={item.name}
                          width={40}
                          height={40}
                          className="object-cover rounded-lg"
                        /> */}

                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            ₹{item.price} × {item.quantity}
                          </p>
                          <Link href={`/products/${item.productId}`}>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-blue-500"
                            >
                              View Product
                            </Button>
                          </Link>
                        </div>
                        <p className="font-medium text-sm text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        Delivery Address
                      </p>
                      <p className="text-xs text-gray-600">
                        {order.deliveryAddress.fullName}
                        <br />
                        {order.deliveryAddress.street}
                        <br />
                        {order.deliveryAddress.city},{" "}
                        {order.deliveryAddress.postalCode &&
                          `, ${order.deliveryAddress.postalCode}`}
                        {order.deliveryAddress.country &&
                          `, ${order.deliveryAddress.country}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CreditCard className="w-4 h-4 mt-1 text-gray-500" />
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        Payment
                      </p>
                      <p className="text-xs text-gray-600">
                        {order.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : "Online Payment"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 mt-1 text-gray-500" />
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        Estimated Delivery
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDate(order.estimatedDelivery)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tracking Info (if shipped) */}
                {order.status === "shipped" && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <p>Tracking ID: {order.trackingId || "N/A"}</p>
                    <Link href={`/track/${order.id}`}>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-blue-500"
                      >
                        Track Package
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 bg-gray-50 flex justify-between items-center">
                <p className="text-lg font-semibold text-gray-900">
                  Total: ₹{order.totalAmount.toFixed(2)}
                </p>
                <div className="flex gap-2">
                  <Link href={`/orders/${order._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  {order.status === "pending" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center"
                      onClick={() => alert(`Cancel order ${order.orderId}?`)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel Order
                    </Button>
                  )}
                  {order.status === "delivered" && (
                    <Link href="/products">
                      <Button variant="outline" size="sm">
                        Reorder
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    onClick={() =>
                      alert(`Contact support for order ${order.orderId}`)
                    }
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Contact Support
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Summary Section */}
        <Card className="max-w-6xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-gray-600">
              Total Amount Spent:{" "}
              <span className="font-semibold text-gray-900">₹{totalSpent}</span>
            </p>
            <Link href="/products">
              <Button className="mt-4">Shop More</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

OrdersPage.displayName = "OrdersPage";

export default OrdersPage;
