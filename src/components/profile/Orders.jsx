"use client";
import React, { useState } from "react";
import { Card, CardTitle, CardHeader, CardContent } from "../ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Heart, Truck, Package, Eye } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

export default function Orders() {
  const { orders, getTotalItems } = useCart();
  const [orderSort, setOrderSort] = useState("date-desc");
  const [orderFilter, setOrderFilter] = useState("all");

  const handleAddToWishlist = (product) => {
    setUserProfile((prev) => ({
      ...prev,
      wishlist: [...prev.wishlist, { ...product, priceAlert: false }],
    }));
    toast.success("Added to wishlist!");
  };

  const getStatusColor = (status) =>
    ({
      pending: "bg-amber-100 text-amber-800 hover:bg-amber-200",
      confirmed: "bg-sky-100 text-sky-800 hover:bg-sky-200",
      shipped: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
      delivered: "bg-green-100 text-green-800 hover:bg-green-200",
      cancelled: "bg-rose-100 text-rose-800 hover:bg-rose-200",
    }[status] || "bg-gray-100 text-gray-800 hover:bg-gray-200");

  const filteredOrders = orders
    .filter((order) => orderFilter === "all" || order.status === orderFilter)
    .sort((a, b) => {
      if (orderSort === "date-desc")
        return new Date(b.orderDate) - new Date(a.orderDate);
      if (orderSort === "date-asc")
        return new Date(a.orderDate) - new Date(b.orderDate);
      if (orderSort === "amount-desc") return b.totalAmount - a.totalAmount;
      return a.totalAmount - b.totalAmount;
    });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-0 min-h-screen">
      <Card className="bg-white dark:bg-gray-800/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Order History
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={orderFilter} onValueChange={setOrderFilter}>
                <SelectTrigger className="w-full sm:w-[160px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={orderSort} onValueChange={setOrderSort}>
                <SelectTrigger className="w-full sm:w-[160px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                  <SelectValue placeholder="Newest First" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg">
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {filteredOrders.length > 0 ? (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Placed on {formatDate(order.orderDate)}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} font-medium px-3 py-1 rounded-full transition-colors duration-200`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="space-y-4 mb-6">
                    {order.items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-4 text-sm p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                      >
                        <img
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {item.product.name}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddToWishlist(item.product)}
                          className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Add to Wishlist
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                      Total: ₹{order.totalAmount.toFixed(2)}
                    </span>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200"
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Track Order
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-600 dark:text-gray-300 mb-4" />
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                No orders match your criteria
              </p>
              <Link href="/products">
                <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200">
                  Start Shopping
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}