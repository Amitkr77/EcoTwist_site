import React,{useState} from "react";
import { Card, CardTitle, CardHeader, CardContent } from "../ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem ,SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Heart, Truck ,Package} from "lucide-react";
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
      pending: "bg-amber-100 text-amber-800",
      confirmed: "bg-sky-100 text-sky-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-gray-100 text-gray-800",
      cancelled: "bg-rose-100 text-rose-800",
    }[status] || "bg-gray-100 text-gray-800");

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
  return (
    <div>
      <Card className="bg-white dark:bg-gray-800 border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Order History
            </CardTitle>
            <div className="flex gap-4">
              <Select value={orderFilter} onValueChange={setOrderFilter}>
                <SelectTrigger className="w-[140px] border-gray-300">
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
                <SelectTrigger className="w-[140px] border-gray-300">
                  <SelectValue placeholder="Newest First" />
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
        <CardContent>
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Placed on {formatDate(order.orderDate)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="space-y-4 mb-4">
                    {order.items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-4 text-sm"
                      >
                        <img
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {item.product.name}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddToWishlist(item.product)}
                          className="border-gray-300 text-gray-600 dark:text-gray-300"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Add to Wishlist
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Total: ${order.totalAmount.toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-600 dark:text-gray-300"
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Track Order
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-600 dark:text-gray-300"
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
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-gray-600 dark:text-gray-300 mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                No orders match your criteria
              </p>
              <Link href="/products">
                <Button className="mt-4 bg-gray-600 text-white hover:bg-gray-700">
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
