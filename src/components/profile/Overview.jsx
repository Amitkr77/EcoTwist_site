import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter
import {
  Heart,
  Package,
  ShoppingCart,
  Calendar,
  ShoppingBag,
  IndianRupee,
} from "lucide-react";

export default function Overview({
  profile,
  orders,
  isLoading,
  userInfo,
  cartItemsCount,
  wishlistItems,
  setActiveTab, 
}) {
  const router = useRouter(); 
  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <Card className="border-none shadow-none bg-transparent max-w-5xl mx-auto">
      <CardContent className="p-0 sm:p-4">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 sm:h-10 w-56 sm:w-72 rounded-xl bg-gray-100" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-10 sm:h-12 rounded-lg bg-gray-100"
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Personal Information
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl shadow-sm">
              <div>
                <Label className="text-sm font-semibold text-gray-700 tracking-wide">
                  Full Name
                </Label>
                <p className="mt-1.5 text-base sm:text-lg text-gray-900 font-medium">
                  {userInfo.fullName}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 tracking-wide">
                  Email Address
                </Label>
                <p className="mt-1.5 text-base sm:text-lg text-gray-900 font-medium">
                  {userInfo.email}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 tracking-wide">
                  Phone Number
                </Label>
                <p className="mt-1.5 text-base sm:text-lg text-gray-900 font-medium">
                  {userInfo.phone}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 tracking-wide">
                  Joined On
                </Label>
                <p className="mt-1.5 text-base sm:text-lg text-gray-900 font-medium">
                  {new Date(profile?.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </>
        )}
        <Separator className="my-8 bg-gray-200" />
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Customer Insights
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-24 sm:h-28 rounded-xl bg-gray-100"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card
                className="bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => setActiveTab("wishlist")}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <Heart size={24} className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Wishlist Items
                      </p>
                      <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                        {wishlistItems.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Link href="/cart">
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 cursor-pointer rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <ShoppingBag size={24} className="text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Cart Items
                        </p>
                        <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                          {cartItemsCount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Card
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 cursor-pointer rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => setActiveTab("orders")}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <Package size={24} className="text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Total Orders
                      </p>
                      <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                        {profile.totalOrders || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <IndianRupee size={24} className="text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Total Spent
                      </p>
                      <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                        ₹{(profile.totalSpent || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        <Separator className="my-8 bg-gray-200" />
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Recent Orders
          </h2>
          {isLoading ? (
            <Skeleton className="h-28 sm:h-36 rounded-xl bg-gray-100" />
          ) : orders.length === 0 ? (
            <div className="flex justify-center items-center flex-col gap-4 p-8 sm:p-12 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-md">
              <Package size={48} className="text-green-600 animate-pulse" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                No Orders Yet
              </h1>
              <p className="text-sm sm:text-base text-gray-600 text-center">
                Start shopping to see your orders here!
              </p>
              <Button
                onClick={handleGoHome}
                className="text-base font-semibold bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="h-[300px] pr-4">
              <div className="space-y-5">
                {orders.slice(0, 3).map((order) => (
                  <Card
                    key={order.orderId}
                    className="overflow-hidden border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
                        <p className="text-base sm:text-lg font-semibold text-gray-900">
                          Order #{order.orderId}
                        </p>
                        <Badge
                          variant={
                            order.status === "pending"
                              ? "secondary"
                              : order.status === "shipped"
                              ? "default"
                              : order.status === "delivered"
                              ? "success"
                              : "destructive"
                          }
                          className={cn(
                            "text-sm font-medium px-3 py-1 rounded-full",
                            order.status === "pending" &&
                              "bg-yellow-100 text-yellow-800",
                            order.status === "shipped" &&
                              "bg-blue-100 text-blue-800",
                            order.status === "delivered" &&
                              "bg-green-100 text-green-800",
                            order.status === "cancelled" &&
                              "bg-red-100 text-red-800"
                          )}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center mt-2">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        {order.formattedDate}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center mt-1.5">
                        <ShoppingCart className="w-4 h-4 mr-2 text-gray-500" />
                        {order.totalItems}{" "}
                        {order.totalItems === 1 ? "item" : "items"}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 flex items-center mt-3">
                        <IndianRupee className="w-4 h-4 mr-2 text-gray-900" />
                        {order.totalAmount.toLocaleString("en-IN")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="link"
                  onClick={() => setActiveTab("orders")}
                  className="text-base font-semibold text-primary hover:text-primary/80"
                >
                  View All Orders
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}