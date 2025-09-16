"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Package,
  ShoppingCart,
  Heart,
  Settings,
  MapPin,
  Bell,
  LogOut,
  Moon,
  Sun,
  Leaf,
  Home,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Wishlist from "@/components/profile/Wishlist";
import Orders from "@/components/profile/Orders";
import Navbar from "@/components/profile/Navbar";
import {
  updateAccountInfo,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  clearUserData,
} from "@/store/slices/userSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { profile, status, error } = useSelector((state) => state.user);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { orders } = useSelector((state) => state.orders);
  const [activeTab, setActiveTab] = useState("overview");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [accountInfo, setAccountInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [newAddress, setNewAddress] = useState({
    type: "Home",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    isDefault: false,
  });

  useEffect(() => {
    // Sync local state with store profile when it loads
    if (profile) {
      setAccountInfo({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleLogout = () => {
    localStorage.removeItem("user-token");
    dispatch(clearUserData());
    toast.success("Logged out successfully!");
    router.push("/login");
  };

  const totalSpent = orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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

  const handleAddAddress = async () => {
    if (
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.zipCode ||
      !newAddress.country
    ) {
      toast.error("Please fill all address fields");
      return;
    }
    const userId = profile?._id;
    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }
    await dispatch(addAddress({ userId, address: newAddress }));
    setNewAddress({
      type: "Home",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      isDefault: false,
    });
  };

  const handleDeleteAddress = async (addressId) => {
    const userId = profile?._id;
    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }
    await dispatch(deleteAddress({ userId, addressId }));
  };

  const handleSetDefaultAddress = async (addressId) => {
    const userId = profile?._id;
    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }
    await dispatch(setDefaultAddress({ userId, addressId }));
  };

  const handleSaveAccountInfo = async () => {
    if (
      !accountInfo.fullName ||
      !accountInfo.email ||
      !accountInfo.phone
    ) {
      toast.error("Please fill all account fields");
      return;
    }
    const userId = profile?._id;
    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }
    await dispatch(updateAccountInfo({ userId, accountInfo }));
    setIsEditing(false);
  };

  const sidebarItems = [
    { icon: User, label: "Overview", value: "overview" },
    { icon: Package, label: "Orders", value: "orders" },
    { icon: Heart, label: "Wishlist", value: "wishlist" },
    { icon: MapPin, label: "Addresses", value: "addresses" },
    { icon: Settings, label: "Settings", value: "settings" },
    { icon: LogOut, label: "Logout", value: "logout", onClick: handleLogout },
  ];

  const data = {
    name: profile?.fullName || "User",
    location: profile?.addresses?.[0] 
      ? `${profile.addresses[0].city}, ${profile.addresses[0].country}` 
      : "No address",
    email: profile?.email || "N/A",
    wishlist: profile?.wishlist?.length || 0,
    totalSpent: totalSpent?.toFixed(2),
    totalOrders: orders?.length,
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
      </div>
    );
  }

  if (status === "failed" || !profile || Object.keys(profile).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Failed to load profile. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 font-sans relative">
      <header className="bg-white dark:bg-gray-900 p-4 sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between">
          <div className="md:block hidden">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Welcome, {profile.fullName}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your nature-inspired shopping hub
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="border-gray-300 text-gray-600 dark:text-gray-300 md:flex hidden"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Link href="/products">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-600 dark:text-gray-300 md:flex hidden"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Shop Now
              </Button>
            </Link>
            <Link href="/cart">
              <Button className="bg-gray-600 text-white hover:bg-gray-700">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart ({totalItems})
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="fixed bottom-5 right-5 z-50">
        <div className="flex flex-col items-center gap-4 bg-blue-500/20 p-4 rounded-full shadow-lg sm:gap-5">
          <Link href="/" passHref>
            <button
              className="text-blue-600 dark:text-gray-300 hover:text-blue-800 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200"
              aria-label="Go to Home"
              title="Home"
            >
              <Home className="w-5 h-5" aria-hidden="true" />
            </button>
          </Link>
          <div className="w-full border-t border-gray-500 dark:border-gray-600" />
          <button
            onClick={handleLogout}
            className="text-red-600 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarItems={sidebarItems}
          profileData={data}
        />
        <main className="container mx-auto space-y-6 px-8">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    icon: Package,
                    title: "Total Orders",
                    value: orders?.length,
                    subtext: "All time",
                  },
                  {
                    icon: Leaf,
                    title: "Total Spent",
                    value: `₹${totalSpent?.toFixed(2)}`,
                    subtext: "All time",
                  },
                  {
                    icon: ShoppingCart,
                    title: "Cart Items",
                    value: totalItems,
                    subtext: "Ready to checkout",
                  },
                  {
                    icon: Heart,
                    title: "Wishlist",
                    value: profile.wishlist?.length || 0,
                    subtext: "Saved items",
                  },
                ].map((stat, idx) => (
                  <Card
                    key={idx}
                    className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                        <stat.icon className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400 transition-colors duration-200" />
                        {stat.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {stat.value}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {stat.subtext}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Recent Orders
                    </CardTitle>
                    <Link href="/orders">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                      >
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {orders?.length > 0 ? (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                        >
                          <div className="flex items-center gap-4">
                            <Package className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">
                                Order #{order.id || order._id}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {formatDate(order.orderDate)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 sm:mt-0">
                            <Badge
                              className={`${getStatusColor(
                                order.status
                              )} font-medium px-3 py-1 rounded-full transition-colors duration-200`}
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </Badge>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              ₹{order.totalAmount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 mx-auto text-gray-600 dark:text-gray-300 mb-4" />
                      <p className="text-lg text-gray-600 dark:text-gray-300">
                        No orders yet
                      </p>
                      <Link href="/products">
                        <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors duration-200">
                          Start Shopping
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "orders" && <Orders />}

          {activeTab === "wishlist" && <Wishlist />}

          {activeTab === "addresses" && (
            <div className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
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
                        <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg">
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
                        className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                        className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                        className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                        className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        placeholder="12345"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="country"
                      className="text-gray-900 dark:text-gray-100"
                    >
                      Country
                    </Label>
                    <Select
                      value={newAddress.country}
                      onValueChange={(value) =>
                        setNewAddress((prev) => ({ ...prev, country: value }))
                      }
                    >
                      <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg">
                        <SelectItem value="USA">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="default-address"
                      checked={newAddress.isDefault}
                      onCheckedChange={(checked) =>
                        setNewAddress((prev) => ({ ...prev, isDefault: checked }))
                      }
                    />
                    <Label
                      htmlFor="default-address"
                      className="text-gray-900 dark:text-gray-100"
                    >
                      Set as default address
                    </Label>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleAddAddress}
                      disabled={status === "loading"}
                      className={`bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition-colors duration-200 ${
                        status === "loading" ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {status === "loading" ? "Adding..." : "Add Address"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Saved Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.addresses?.length > 0 ? (
                    profile.addresses.map((address) => (
                      <div
                        key={address._id || address.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col sm:flex-row items-start justify-between gap-4 bg-white/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <MapPin className="w-6 h-6 text-blue-500 dark:text-blue-400 mt-1" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900 dark:text-gray-100">
                                {address.type}
                              </p>
                              {address.isDefault && (
                                <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {address.street}
                              <br />
                              {address.city}, {address.state} {address.zipCode}
                              <br />
                              {address.country}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 sm:mt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                            title="Edit address"
                            disabled
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAddress(address._id || address.id)}
                            className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                            title="Delete address"
                            disabled={status === "loading"}
                          >
                            Delete
                          </Button>
                          {!address.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefaultAddress(address._id || address.id)}
                              className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors duration-200"
                              title="Set as default address"
                              disabled={status === "loading"}
                            >
                              Set Default
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-16 h-16 mx-auto text-gray-600 dark:text-gray-300 mb-4" />
                      <p className="text-lg text-gray-600 dark:text-gray-300">
                        No saved addresses
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
                <Card className="flex-1 bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Account Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form className="flex flex-col space-y-4">
                      <div className="flex flex-col space-y-4">
                        <div className="flex flex-col">
                          <label
                            htmlFor="fullName"
                            className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="fullName"
                            placeholder="Full name"
                            value={accountInfo.fullName}
                            onChange={(e) =>
                              setAccountInfo((prev) => ({
                                ...prev,
                                fullName: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                            className={`rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 transition-all duration-200 ${
                              !isEditing
                                ? "bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed"
                                : ""
                            }`}
                          />
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
                            value={accountInfo.email}
                            onChange={(e) =>
                              setAccountInfo((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                            className={`rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 transition-all duration-200 ${
                              !isEditing
                                ? "bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed"
                                : ""
                            }`}
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
                            value={accountInfo.phone}
                            onChange={(e) =>
                              setAccountInfo((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                            className={`rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 transition-all duration-200 ${
                              !isEditing
                                ? "bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed"
                                : ""
                            }`}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        {isEditing ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEditing(false)}
                              className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                              disabled={status === "loading"}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveAccountInfo}
                              className={`bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 ${
                                status === "loading" ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              disabled={status === "loading"}
                            >
                              {status === "loading" ? "Saving..." : "Save"}
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card className="flex-1 bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <Bell className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            Order Updates
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Get notified about order status changes
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                        disabled
                      >
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="flex-1 bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                    disabled
                  >
                    <Settings className="w-4 h-4" />
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;