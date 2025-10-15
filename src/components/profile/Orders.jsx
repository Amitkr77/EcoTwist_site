"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, MapPin, FileText, RotateCcw, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; // Assuming shadcn utils for className merging

export default function Orders({ orders, isLoading }) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleCancelOrder = (orderId) => {
    console.log(`Cancel order: ${orderId}`);
    // Add actual cancel logic here
  };

  return (
    <Card className="border-none shadow-none bg-transparent max-w-5xl mx-auto">
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-36 sm:h-48 rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex justify-center items-center flex-col gap-6 p-10 sm:p-16 bg-gradient-to-br from-gray-50 to-gray-200 rounded-3xl shadow-lg text-center">
            <Package size={56} className="text-gray-400 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              No Orders Yet
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-md">
              Discover our exclusive collection and place your first order today!
            </p>
            <Button
              onClick={handleGoHome}
              className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
            >
              Explore Now
            </Button>
          </div>
        ) : (
          <div className="h-[calc(100vh-180px)] pr-4">
            <div className="space-y-8">
              {orders.map((order) => (
                <Card
                  key={order.orderId}
                  className="overflow-hidden border border-gray-200 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 bg-white"
                >
                  <CardHeader className="p-5 sm:p-7 bg-gradient-to-r from-gray-50 to-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <CardTitle className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                        Order #{order.orderId}
                      </CardTitle>
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
                          "text-sm font-semibold px-4 py-1.5 rounded-full",
                          order.status === "pending" && "bg-yellow-100 text-yellow-800",
                          order.status === "confirmed" && "bg-green-100 text-green-800",
                          order.status === "shipped" && "bg-blue-100 text-blue-800",
                          order.status === "delivered" && "bg-green-400 text-green-800",
                          order.status === "cancelled" && "bg-red-100 text-red-800"
                        )}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 font-medium tracking-wide">
                      {order.formattedDate} • {order.totalItems} {order.totalItems === 1 ? "item" : "items"}
                    </p>
                  </CardHeader>
                  <CardContent className="p-5 sm:p-6">
                    <Accordion type="single" collapsible className="w-full mb-6">
                      <AccordionItem value="items" className="border-b-0">
                        <AccordionTrigger className="text-lg sm:text-xl font-semibold text-gray-800 py-3 ">
                          <div className="flex items-center gap-2">
                            <Package size={20} /> Order Items
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
                          <div className="space-y-5">
                            {order.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5 last:border-b-0 last:pb-0"
                              >
                                <div className="flex items-center space-x-4">
                                  <img
                                    src={item.productId.images[0]?.url || "/placeholder.jpg"}
                                    alt={item.name}
                                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shadow-sm border border-gray-100"
                                  />
                                  <div>
                                    <Link
                                      href={`/product-info/${item.productId.slug}--${item.productId.id}`}
                                      className="text-lg sm:text-xl font-medium text-gray-900 hover:text-primary transition-colors duration-200"
                                    >
                                      {item.name}
                                    </Link>
                                    <p className="text-sm text-gray-600 mt-1">
                                      Quantity: {item.quantity}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-gray-900 mt-2 sm:mt-0">
                                  ₹{item.price.toLocaleString("en-IN")}
                                </p>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="address" className="border-b-0">
                        <AccordionTrigger className="text-lg sm:text-xl font-semibold text-gray-800 hover:text-primary py-3">
                          <div className="flex items-center gap-2">
                            <MapPin size={20} /> Delivery Address
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
                          <div className="text-sm sm:text-base text-gray-700 space-y-1.5 bg-gray-50 p-4 rounded-xl">
                            <p className="font-semibold">{order.deliveryAddress.fullName}</p>
                            <p>{order.deliveryAddress.street}, {order.deliveryAddress.city}</p>
                            <p>
                              {order.deliveryAddress.state} {order.deliveryAddress.postalCode}, {order.deliveryAddress.country}
                            </p>
                            <p>Phone: {order.deliveryAddress.phone}</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    <div className="flex justify-between items-center font-bold text-xl sm:text-2xl text-gray-900 mt-6">
                      <span>Total</span>
                      <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <Separator className="my-6 bg-gray-200" />
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/api/orders/invoice/pdf/${order?.invoice?.invoiceId}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm font-semibold flex items-center gap-2 border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <FileText size={18} /> View Invoice
                        </Button>
                      </Link>
                      {order.status !== "cancelled" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm font-semibold flex items-center gap-2 border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Truck size={18} /> Track Order
                        </Button>
                      )}
                      {order.status !== "cancelled" && (
                        <Button
                          onClick={() => handleCancelOrder(order.orderId)}
                          variant="destructive"
                          size="sm"
                          className="text-sm font-semibold flex items-center gap-2 rounded-lg transition-colors"
                        >
                          <XCircle size={18} /> Cancel Order
                        </Button>
                      )}
                      {order.status === "delivered" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm font-semibold flex items-center gap-2 border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <RotateCcw size={18} /> Reorder
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}