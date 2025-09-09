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
  Home,
  FileText,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Input } from "@/components/ui/input";
// import { useToast } from "@/components/ui/use-toast"; // Assuming shadcn/ui toast is used
import axios from "axios";
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
} from "@/components/ui/alert-dialog"; // Add AlertDialog for confirmations
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // For sorting

const OrdersPage = React.memo(() => {
  const { orders, isHydrated } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-desc"); // New state for sorting
  // const { toast } = useToast();

  // Regular function for getStatusColor (no need for useMemo as it's static)
  const getStatusColor = (status) => {
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
  };

  // Regular function for formatDate (no need for useMemo as it's static)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (date.toString() === "Invalid Date") {
      console.warn(`Invalid date provided: ${dateString}`);
      return "N/A";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // useMemo for filtered and sorted orders
  const filteredOrders = useMemo(() => {
    let filtered = orders
      .filter(
        (order) =>
          typeof order === "object" &&
          "items" in order &&
          "orderId" in order &&
          "totalAmount" in order &&
          Array.isArray(order.items)
      )
      .filter(
        (order) =>
          order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );

    // Sort the orders based on sortBy
    if (sortBy === "date-desc") {
      filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    } else if (sortBy === "date-asc") {
      filtered.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
    } else if (sortBy === "amount-desc") {
      filtered.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (sortBy === "amount-asc") {
      filtered.sort((a, b) => a.totalAmount - b.totalAmount);
    } else if (sortBy === "status") {
      filtered.sort((a, b) => a.status.localeCompare(b.status));
    }

    return filtered;
  }, [orders, searchTerm, sortBy]);

  // useMemo for totalSpent
  const totalSpent = useMemo(
    () =>
      filteredOrders
        .reduce((sum, order) => sum + order.totalAmount, 0)
        .toFixed(2),
    [filteredOrders]
  );

  // Handle order cancellation with confirmation
  const handleCancelOrder = async (orderId) => {
    try {
      await axios.post(
        `/api/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("user-token")}`,
          },
        }
      );
      // toast({
      //   title: "Order Cancelled",
      //   description: `Order ${orderId} has been cancelled.`,
      // });
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "Failed to cancel order.",
      //   variant: "destructive",
      // });
    }
  };

  // Handle invoice generation and download/view
  const handleInvoice = async (order) => {
    try {
      const res = await axios.post(
        "/api/orders/invoice/create",
        {
          orderId: order._id, // Use _id as per the function comment
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("user-token")}`,
          },
        }
      );

      const invoiceNumber = res.data?.invoiceNumber;

      // if (!invoiceNumber) {
      //   toast({
      //     title: "Error",
      //     description: "Failed to generate invoice.",
      //     variant: "destructive",
      //   });
      //   return;
      // }

      // Open the PDF in a new tab
      window.open(`/api/orders/invoice/pdf/${invoiceNumber}`, "_blank");
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast({
        title: "Error",
        description: "Error generating invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

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
      <div className="max-w-6xl mx-auto px-4 py-4 mt-16">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-teal-600 flex items-center">
            <Home className="h-4 w-4 inline-block mr-2" />
            Home
          </Link>
          <span>/</span>
          <span className="text-teal-600">Orders</span> {/* Fixed breadcrumb */}
        </nav>
      </div>

      <div className="p-6">
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm max-w-6xl mx-auto mb-10 rounded-3xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                My Orders
              </h1>
              <p className="text-sm text-gray-500">
                {filteredOrders.length} order(s) found
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Input
                type="text"
                placeholder="Search by order ID or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64"
              />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                  <SelectItem value="amount-desc">
                    Amount (High to Low)
                  </SelectItem>
                  <SelectItem value="amount-asc">
                    Amount (Low to High)
                  </SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>
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
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            ₹{item.price} × {item.quantity}
                          </p>
                          <Link href={`/product-info/${item.productId}`}>
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
                        {order.deliveryAddress.phone && (
                          <>
                            {order.deliveryAddress.phone}
                            <br />
                          </>
                        )}
                        {order.deliveryAddress.street}
                        <br />
                        {order.deliveryAddress.city},{" "}
                        {order.deliveryAddress.state}
                        {order.deliveryAddress.postalCode
                          ? `, ${order.deliveryAddress.postalCode}`
                          : ""}
                        {order.deliveryAddress.country
                          ? `, ${order.deliveryAddress.country}`
                          : ""}
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
                    <Link href={`/track/${order._id}`}>
                      {" "}
                      {/* Use _id for consistency */}
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
              <CardFooter className="p-4 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-lg font-semibold text-gray-900">
                  Total: ₹{order.totalAmount.toFixed(2)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {/* <Link href={`/orders/${order._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </Link> */}

                  {/* Invoice Button with fixed handler */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    onClick={() => handleInvoice(order)}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Invoice
                  </Button>

                  {order.status === "pending" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel Order
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel order #
                            {order.orderId}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>No</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleCancelOrder(order.orderId)}
                          >
                            Yes, Cancel
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
                      toast({
                        title: "Contact Support",
                        description: `For order ${order.orderId}, please reach out via email or chat.`,
                      })
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
