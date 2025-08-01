"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

import {
  User,
  Package,
  ShoppingCart,
  Heart,
  Settings,
  MapPin,
  Bell,
  Eye,
  LogOut,
  Truck,
  Moon,
  Sun,
  Leaf,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const page = () => {
  const { orders, getTotalItems } = useCart();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "Amit kumar",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    addresses: [
      {
        id: 1,
        type: "Home",
        street: "123 Main St",
        city: "San Francisco",
        state: "CA",
        zipCode: "94105",
      },
    ],
    wishlist: [],
  });
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSort, setOrderSort] = useState("date-desc");
  const [newAddress, setNewAddress] = useState({
    type: "Home",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const getStatusColor = (status) =>
    ({
      pending: "bg-amber-100 text-amber-800",
      confirmed: "bg-sky-100 text-sky-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-gray-100 text-gray-800",
      cancelled: "bg-rose-100 text-rose-800",
    }[status] || "bg-gray-100 text-gray-800");

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleProfileUpdate = () => {
    if (!userProfile.name || !userProfile.email || !userProfile.phone) {
      toast.error("Please fill all required fields");
      return;
    }
    toast.success("Profile updated successfully!");
  };

  const handleAddAddress = () => {
    if (
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.zipCode
    ) {
      toast.error("Please fill all address fields");
      return;
    }
    setUserProfile((prev) => ({
      ...prev,
      addresses: [...prev.addresses, { id: Date.now(), ...newAddress }],
    }));
    setNewAddress({
      type: "Home",
      street: "",
      city: "",
      state: "",
      zipCode: "",
    });
    toast.success("New address added!");
  };

  const handleDeleteAddress = (id) => {
    setUserProfile((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((addr) => addr.id !== id),
    }));
    toast.success("Address deleted!");
  };

  const handleAddToWishlist = (product) => {
    setUserProfile((prev) => ({
      ...prev,
      wishlist: [...prev.wishlist, { ...product, priceAlert: false }],
    }));
    toast.success("Added to wishlist!");
  };

  const handleRemoveFromWishlist = (productId) => {
    setUserProfile((prev) => ({
      ...prev,
      wishlist: prev.wishlist.filter((item) => item.id !== productId),
    }));
    toast.success("Removed from wishlist!");
  };

  const togglePriceAlert = (productId) => {
    setUserProfile((prev) => ({
      ...prev,
      wishlist: prev.wishlist.map((item) =>
        item.id === productId ? { ...item, priceAlert: !item.priceAlert } : item
      ),
    }));
    toast.success("Price alert updated!");
  };

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

  const sidebarItems = [
    { icon: User, label: "Overview", value: "overview" },
    { icon: Package, label: "Orders", value: "orders" },
    { icon: Heart, label: "Wishlist", value: "wishlist" },
    { icon: MapPin, label: "Addresses", value: "addresses" },
    { icon: Settings, label: "Settings", value: "settings" },
    { icon: LogOut, label: "Logout", value: "logout" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 font-sans">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 transition-transform duration-300 ease-in-out shadow-lg`}
        >
          <div className="h-56 bg-black/40 m-4 rounded-md">
            <img
              src="./Avatar.png"
              alt=""
              className="object-contain object-center w-full h-full  p-4 "
            />
          </div>

          <div className="px-6 font-semibold text-lg ">
            <h1>{userProfile.name}</h1>
          </div>
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.value}
                className={`w-full flex items-center p-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  activeTab === item.value
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold"
                    : ""
                }`}
                onClick={() => {
                  setActiveTab(item.value);
                  if (item.value === "logout")
                    toast.success("Logged out successfully!");
                  setIsSidebarOpen(false);
                }}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <header className="bg-white dark:bg-gray-900 p-4 sticky top-0 z-40">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  className="lg:hidden text-gray-600 dark:text-gray-300"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <div className="md:block hidden">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Welcome, {userProfile.name}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Your nature-inspired shopping hub
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="border-gray-300 text-gray-600 dark:text-gray-300 md:flex hidden"
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </Button>
                <Link href="/products">
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-600 dark:text-gray-300  md:flex hidden"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Shop Now
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button className="bg-gray-600 text-white hover:bg-gray-700">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart ({getTotalItems()})
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto p-6 space-y-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      icon: Package,
                      title: "Total Orders",
                      value: orders.length,
                      subtext: "All time",
                    },
                    {
                      icon: Leaf,
                      title: "Total Spent",
                      value: `$${totalSpent.toFixed(2)}`,
                      subtext: "All time",
                    },
                    {
                      icon: ShoppingCart,
                      title: "Cart Items",
                      value: getTotalItems(),
                      subtext: "Ready to checkout",
                    },
                    {
                      icon: Heart,
                      title: "Wishlist",
                      value: userProfile.wishlist.length,
                      subtext: "Saved items",
                    },
                  ].map((stat, idx) => (
                    <Card
                      key={idx}
                      className="bg-white dark:bg-gray-800 border-gray-200 hover:shadow-lg transition-shadow"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                          <stat.icon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
                          {stat.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {stat.value}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {stat.subtext}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent Orders */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gray-900 dark:text-gray-100">
                        Recent Orders
                      </CardTitle>
                      <Link href="/orders">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-600 dark:text-gray-300"
                        >
                          View All
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.slice(0, 3).map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <Package className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  Order #{order.id}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {formatDate(order.orderDate)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() +
                                  order.status.slice(1)}
                              </Badge>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                ${order.totalAmount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 mx-auto text-gray-600 dark:text-gray-300 mb-4" />
                        <p className="text-gray-600 dark:text-gray-300">
                          No orders yet
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
            )}

            {activeTab === "orders" && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <CardTitle className="text-gray-900 dark:text-gray-100">
                      Order History
                    </CardTitle>
                    <div className="flex gap-4">
                      <Select
                        value={orderFilter}
                        onValueChange={setOrderFilter}
                      >
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
                          <SelectItem value="date-desc">
                            Newest First
                          </SelectItem>
                          <SelectItem value="date-asc">Oldest First</SelectItem>
                          <SelectItem value="amount-desc">
                            Highest Amount
                          </SelectItem>
                          <SelectItem value="amount-asc">
                            Lowest Amount
                          </SelectItem>
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
                                  onClick={() =>
                                    handleAddToWishlist(item.product)
                                  }
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
            )}

            {activeTab === "wishlist" && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">
                    My Wishlist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userProfile.wishlist.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {userProfile.wishlist.map((item) => (
                        <div
                          key={item.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
                        >
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-40 object-cover rounded-lg mb-4"
                          />
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            ${item.price}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="checkbox"
                              checked={item.priceAlert}
                              onChange={() => togglePriceAlert(item.id)}
                              className="w-4 h-4 text-gray-600 rounded"
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              Notify on price drop
                            </span>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              className="bg-gray-600 text-white hover:bg-gray-700"
                            >
                              Add to Cart
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveFromWishlist(item.id)}
                              className="border-gray-300 text-gray-600 dark:text-gray-300"
                            >
                              <Heart className="w-4 h-4 mr-2 fill-red-500" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 mx-auto text-gray-600 dark:text-gray-300 mb-4" />
                      <p className="text-gray-600 dark:text-gray-300">
                        Your wishlist is empty
                      </p>
                      <Link href="/products">
                        <Button className="mt-4 bg-gray-600 text-white hover:bg-gray-700">
                          Browse Products
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "addresses" && (
              <div className="space-y-6">
                <Card className="bg-white dark:bg-gray-800 border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">
                      Add New Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        Address Information
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Fill out the form below to add a new address.
                      </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="address-type"
                          className="text-gray-900 dark:text-gray-100"
                        >
                          Address Type
                        </Label>
                        <Select
                          value={newAddress.type}
                          onValueChange={(value) =>
                            setNewAddress((prev) => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-gray-400 rounded-md shadow-sm">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Home">Home</SelectItem>
                            <SelectItem value="Work">Work</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="street"
                          className="text-gray-900 dark:text-gray-100"
                        >
                          Street Address
                        </Label>
                        <Input
                          id="street"
                          value={newAddress.street}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              street: e.target.value,
                            }))
                          }
                          className="border-gray-300 focus:ring-2 focus:ring-gray-400 rounded-md shadow-sm"
                          placeholder="123 Main St"
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="city"
                          className="text-gray-900 dark:text-gray-100"
                        >
                          City
                        </Label>
                        <Input
                          id="city"
                          value={newAddress.city}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              city: e.target.value,
                            }))
                          }
                          className="border-gray-300 focus:ring-2 focus:ring-gray-400 rounded-md shadow-sm"
                          placeholder="City name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="state"
                          className="text-gray-900 dark:text-gray-100"
                        >
                          State
                        </Label>
                        <Input
                          id="state"
                          value={newAddress.state}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              state: e.target.value,
                            }))
                          }
                          className="border-gray-300 focus:ring-2 focus:ring-gray-400 rounded-md shadow-sm"
                          placeholder="State"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="zipCode"
                          className="text-gray-900 dark:text-gray-100"
                        >
                          Zip Code
                        </Label>
                        <Input
                          id="zipCode"
                          value={newAddress.zipCode}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              zipCode: e.target.value,
                            }))
                          }
                          className="border-gray-300 focus:ring-2 focus:ring-gray-400 rounded-md shadow-sm"
                          placeholder="12345"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={handleAddAddress}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md shadow-md"
                      >
                        Add Address
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-gray-800 border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">
                      Saved Addresses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userProfile.addresses.map((address) => (
                      <div
                        key={address.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-start justify-between"
                      >
                        <div className="flex items-start gap-4">
                          <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-300 mt-1" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {address.type}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {address.street}
                              <br />
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-600 dark:text-gray-300"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="border-gray-300 text-gray-600 dark:text-gray-300"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
                  {/* Account Info Card */}
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-gray-100 text-xl font-semibold">
                        Account Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <form className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="flex flex-col w-full sm:w-auto space-y-4">
                          <div className="flex space-x-4">
                            <div className="flex flex-col flex-1">
                              <label
                                htmlFor="firstName"
                                className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                First Name
                              </label>
                              <input
                                type="text"
                                id="firstName"
                                placeholder="First name"
                                className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                              />
                            </div>
                            <div className="flex flex-col flex-1">
                              <label
                                htmlFor="lastName"
                                className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                Last Name
                              </label>
                              <input
                                type="text"
                                id="lastName"
                                placeholder="Last name"
                                className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col">
                            <label
                              htmlFor="email"
                              className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Email
                            </label>
                            <input
                              type="email"
                              id="email"
                              placeholder="Enter your email"
                              className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                            />
                          </div>

                          <div className="flex flex-col">
                            <label
                              htmlFor="phone"
                              className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              placeholder="Enter your phone number"
                              className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                            />
                          </div>
                        </div>
                      </form>
                      <div className="">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          type="submit"
                        >
                          Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notifications Card */}
                  <Card className="flex-1 bg-white dark:bg-gray-800 border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-gray-100">
                        Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              Order Updates
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Get notified about order status changes
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-600 dark:text-gray-300"
                        >
                          Configure
                        </Button>
                      </div>
                      <Separator className="bg-gray-200 dark:bg-gray-700" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Leaf className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              Eco Preferences
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Manage your sustainability settings
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-600 dark:text-gray-300"
                        >
                          Manage
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {/* Account Settings Card */}
                <Card className="flex-1 bg-white dark:bg-gray-800 border-gray-200">
                  <CardHeader className="flex justify-between items-center">
                    <CardTitle className="text-gray-900 dark:text-gray-100">
                      Account Settings
                    </CardTitle>
                    <Button
                      variant="outline"
                      className="flex justify-between items-center border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                      onClick={() => setIsDarkMode(!isDarkMode)}
                    >
                      {/* Assuming you want a label/icon here? Add it if needed */}
                      Toggle Dark Mode
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      <Settings className="w-4 h-4" />
                      Privacy Settings
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      <User className="w-4 h-4" />
                      Change Password
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full flex items-center gap-2 bg-rose-600 hover:bg-rose-700"
                    >
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default page;
