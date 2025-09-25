"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Card, CardTitle, CardHeader, CardContent } from "../ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Heart, Truck, Package, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { addToWishlist } from "@/store/slices/userSlice";

export default function Orders() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { orders, status: ordersStatus } = useSelector((state) => state.orders);
  const {
    profile,
    wishlist = [], // Normalize wishlist to empty array
    status: userStatus,
    error: userError,
  } = useSelector((state) => state.user);
  const { items: cartItems } = useSelector((state) => state.cart);

  const [orderSort, setOrderSort] = useState("date-desc");
  const [orderFilter, setOrderFilter] = useState("all");

  useEffect(() => {
    if (userError) toast.error(userError);
  }, [userError]);

  const handleAddToWishlist = async (product) => {
    if (!profile?._id) {
      toast.error("Please log in to add items to your wishlist.");
      router.push("/login");
      return;
    }

    const productId = product._id || product.id;

    if (wishlist.some((item) => item.productId === productId)) {
      toast.info("This item is already in your wishlist.");
      return;
    }

    await dispatch(addToWishlist({ userId: profile._id, productId }));
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
    ?.filter((order) => orderFilter === "all" || order.status === orderFilter)
    .sort((a, b) => {
      const dateA = new Date(a.orderDate);
      const dateB = new Date(b.orderDate);

      switch (orderSort) {
        case "date-asc":
          return dateA - dateB;
        case "amount-desc":
          return b.totalAmount - a.totalAmount;
        case "amount-asc":
          return a.totalAmount - b.totalAmount;
        default:
          return dateB - dateA;
      }
    });

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (ordersStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <Card className="bg-white dark:bg-gray-800/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Order History
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={orderFilter} onValueChange={setOrderFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={orderSort} onValueChange={setOrderSort}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
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
          {filteredOrders?.length > 0 ? (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 bg-white/80 dark:bg-gray-800/80 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Order #{order._id}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Placed on {formatDate(order.orderDate)}
                      </p>
                    </div>
                    <Badge
                      className={`${getStatusColor(order.status)} px-3 py-1`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="space-y-4 mb-6">
                    {order.items?.map((item) => {
                      const product = {
                        ...item.productId,
                        image:
                          item.productId?.images?.[0]?.url ||
                          "/placeholder.svg",
                      };
                      const productId = product._id;
                      const isInWishlist = wishlist.some(
                        (w) => w.productId === productId
                      );

                      return (
                        <div
                          key={productId}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                        >
                          <img
                            src={product.image}
                            alt={item.name || "Product"}
                            className="w-16 h-16 object-cover rounded-md border"
                            onError={(e) =>
                              (e.currentTarget.src = "/placeholder.svg")
                            }
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToWishlist(product)}
                            disabled={userStatus === "loading" || isInWishlist}
                            className={
                              isInWishlist
                                ? "bg-gray-200 dark:bg-gray-600 cursor-not-allowed"
                                : ""
                            }
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="font-semibold text-lg">
                      Total: ₹{order.totalAmount.toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="cursor-not-allowed"
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Track Order
                      </Button>
                      <Link href={`/orders/${order._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-600 text-lg">
                No orders match your criteria
              </p>
              <Link href="/products">
                <Button className="mt-4">Start Shopping</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}