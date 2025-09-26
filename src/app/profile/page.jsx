"use client";

import React, { useState, useEffect, use } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { addToCart } from "@/store/slices/cartSlice";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  MapPin,
  Heart,
  Settings,
  Package,
  User,
  Edit,
  Save,
  X,
  Trash2,
  Plus,
  CreditCard,
  Star,
  LogOut,
  Home,
  ShoppingCart,
  Calendar,
  MoreVert,
  EllipsisIcon,
  Share2,
  View,
  Eye,
} from "lucide-react";
import { IndianRupee } from "lucide-react";
import {
  fetchUserProfile,
  updateAccountInfo,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  removeFromWishlist,
  clearUserData,
} from "@/store/slices/userSlice";
import { useRouter } from "next/navigation";
import Orders from "@/components/profile/Orders";
import Link from "next/link";

// Define the CSS for hiding the scrollbar
const hideScrollbarStyles = `
    .hide-scrollbar {
      overflow-y: auto;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE and Edge */
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none; /* Chrome, Safari, and other WebKit browsers */
    }
  `;

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { profile, wishlist, status, error } = useSelector(
    (state) => state.user
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isCancelled, setIscancelled] = useState(false);
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleAddToCart = async (item) => {
    setLoading(true);
    try {
      // Validate item data
      if (!item?.productId?._id || !item?.productId?.variants?.length) {
        throw new Error("Invalid product or variant data");
      }

      const payload = {
        productId: item.productId._id, // Use _id from productId
        variantSku: item.productId.variants[0].sku, // Use first variant's SKU
        quantity: 1,
      };

      await dispatch(addToCart(payload)).unwrap();
      toast.success(`${item.name} added to cart!`);
    } catch (error) {
      console.error("Failed to add item to cart", error);
      toast.error(error.message || "Failed to add item to cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchUserProfile())
        .unwrap()
        .catch((err) => {
          toast.error(err || "Failed to fetch profile");
        });
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (profile) {
      setUserInfo({
        fullName:
          profile.fullName || `${profile.firstName} ${profile.lastName}`,
        email: profile.email,
        phone: profile.phone,
      });
    }
  }, [profile]);

  const validateAddress = () => {
    const errors = {};
    if (!newAddress.fullName) errors.fullName = "Full name is required";
    if (!newAddress.phone) errors.phone = "Phone number is required";
    if (!newAddress.street) errors.street = "Street is required";
    if (!newAddress.city) errors.city = "City is required";
    if (!newAddress.state) errors.state = "State is required";
    if (!newAddress.postalCode) errors.postalCode = "Postal code is required";
    if (!newAddress.country) errors.country = "Country is required";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditProfileToggle = () => {
    setIsEditingProfile(!isEditingProfile);
  };

  const handleProfileInputChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    dispatch(updateAccountInfo(userInfo))
      .unwrap()
      .then(() => {
        toast.success("Profile updated successfully");
        setIsEditingProfile(false);
      })
      .catch((err) => toast.error(err || "Failed to update profile"));
  };

  const handleAddAddress = () => {
    if (validateAddress()) {
      dispatch(addAddress(newAddress))
        .unwrap()
        .then(() => {
          toast.success("Address added successfully");
          setNewAddress({
            fullName: "",
            phone: "",
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            isDefault: false,
          });
          setIsAddingAddress(false);
        })
        .catch((err) => toast.error(err || "Failed to add address"));
    }
  };

  const handleDeleteAddress = (id) => {
    dispatch(deleteAddress(id))
      .unwrap()
      .then(() => toast.success("Address deleted successfully"))
      .catch((err) => toast.error(err || "Failed to delete address"));
  };

  const handleSetDefaultAddress = (id) => {
    dispatch(setDefaultAddress(id))
      .unwrap()
      .then(() => toast.success("Default address set successfully"))
      .catch((err) => toast.error(err || "Failed to set default address"));
  };

 
  const handleRemoveWishlistItem = (productId) => {
    dispatch(removeFromWishlist(productId))
      .unwrap()
      .then(() => toast.success("Item removed from wishlist"))
      .catch((err) =>
        toast.error(err || "Failed to remove item from wishlist")
      );
  };

  const handleLogout = async() => {
    dispatch(clearUserData());

    await fetch("/api/user/auth/logout", { method: "POST" });
    
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const getMembershipLevel = (totalSpent) => {
    if (totalSpent > 10000) return "Platinum";
    if (totalSpent > 5000) return "Gold";
    if (totalSpent > 1000) return "Silver";
    return "Bronze";
  };

  const membership = getMembershipLevel(profile?.totalSpent || 0);
  const addresses = profile?.address || [];
  const orders = profile?.orders || [];
  const cartItemsCount = profile?.cart?.items?.length || 0;
  const wishlistItems = wishlist || [];
  const isLoading = status === "loading";

  return (
    <div className="min-h-screen bg-green-700 flex items-center justify-center p-0 sm:p-4">
      <style jsx>{hideScrollbarStyles}</style>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full max-w-[1400px] h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] bg-white rounded-2xl sm:rounded-3xl shadow-xl flex flex-col sm:flex-row overflow-hidden">
        {/* Mobile Top Navigation Bar */}
        <div className="sm:hidden fixed top-0 left-0 right-0 bg-white z-20 border-b border-gray-200 p-4 flex items-center justify-between">
          {isLoading ? (
            <div className="flex items-center">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="ml-3">
                <Skeleton className="h-5 w-28 mb-2" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <Avatar className="w-10 h-10">
                <AvatarImage src={profile?.profilePicture} alt="User Avatar" />
                <AvatarFallback>
                  {userInfo.fullName?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <h2 className="text-base font-semibold">{userInfo.fullName}</h2>
                <p className="text-xs text-gray-500">{userInfo.email}</p>
                {/* <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-400 mr-1" />
                    <span className="text-xs font-medium">
                      {membership} Member
                    </span>
                  </div> */}
              </div>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisIcon className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleGoHome}>
                <Home className="w-4 h-4 mr-2" /> Home
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <LogOut className="w-4 h-4 mr-2" /> Log Out
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Log Out?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to log out?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>
                      Log Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden sm:block w-64 lg:w-72 bg-gray-50 p-4 sm:p-6 border-r border-gray-200 flex-shrink-0 ">
          <div className="flex items-center mb-6 sm:mb-8">
            {isLoading ? (
              <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
            ) : (
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                <AvatarImage src={profile?.profilePicture} alt="User Avatar" />
                <AvatarFallback>
                  {userInfo.fullName?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="ml-3 sm:ml-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-5 w-28 sm:h-6 sm:w-32 mb-2" />
                  <Skeleton className="h-4 w-40 sm:w-48" />
                </>
              ) : (
                <>
                  <h2 className="text-lg sm:text-xl font-semibold">
                    {userInfo.fullName}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {userInfo.email}
                  </p>
                  <div className="flex items-center mt-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 mr-1" />
                    <span className="text-xs sm:text-sm font-medium">
                      {membership} Member
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="">
            <Separator className="my-3 sm:my-4" />
            <ul className="space-y-2 sm:space-y-3">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center p-2 sm:p-3 rounded-lg sm:rounded-xl text-left transition-colors text-sm sm:text-base font-medium ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    aria-current={activeTab === tab.id ? "page" : undefined}
                  >
                    <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
            <Separator className="my-3 sm:my-4" />
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                onClick={handleGoHome}
                className="justify-start text-sm sm:text-base"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> Home
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-sm sm:text-base"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />{" "}
                    Log Out
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Log Out?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to log out?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>
                      Log Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto hide-scrollbar sm:pt-6 pt-16 pb-16 sm:pb-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="max-w-full sm:max-w-5xl mx-auto max-h-[calc(100vh-80px)] sm:max-h-[calc(100vh-100px)] hide-scrollbar">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 sticky top-0 bg-white z-10 py-4 sm:py-6">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>

            {/* Existing Tabs Content (Unchanged) */}
            {activeTab === "overview" && (
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
                      <div className="grid grid-cols-1 gap-4 sm:gap-6">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-8 sm:h-10" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold">
                          Personal Information
                        </h2>
                        {/* {!isEditingProfile ? (
                          <Button
                            variant="outline"
                            onClick={handleEditProfileToggle}
                            className="mt-2 sm:mt-0"
                          >
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </Button>
                        ) : (
                          <div className="flex space-x-2 mt-2 sm:mt-0">
                            <Button
                              variant="outline"
                              onClick={handleEditProfileToggle}
                            >
                              <X className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                            <Button onClick={handleSaveProfile}>
                              <Save className="w-4 h-4 mr-2" /> Save
                            </Button>
                          </div>
                        )} */}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Full Name
                          </Label>
                          {/* {isEditingProfile ? (
                            <Input
                              name="fullName"
                              value={userInfo.fullName}
                              onChange={handleProfileInputChange}
                              className="mt-1 text-sm sm:text-base"
                              aria-label="Full Name"
                            />
                          ) : ( */}
                            <p className="mt-1 text-gray-600 text-sm sm:text-base">
                              {userInfo.fullName}
                            </p>
                          {/* )} */}
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Email Address
                          </Label>
                          {/* {isEditingProfile ? (
                            <Input
                              name="email"
                              value={userInfo.email}
                              onChange={handleProfileInputChange}
                              className="mt-1 text-sm sm:text-base"
                              aria-label="Email Address"
                            />
                          ) : ( */}
                            <p className="mt-1 text-gray-600 text-sm sm:text-base">
                              {userInfo.email}
                            </p>
                          {/* )} */}
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Phone Number
                          </Label>
                          {/* {isEditingProfile ? (
                            <Input
                              name="phone"
                              value={userInfo.phone}
                              onChange={handleProfileInputChange}
                              className="mt-1 text-sm sm:text-base"
                              aria-label="Phone Number"
                            />
                          ) : ( */}
                            <p className="mt-1 text-gray-600 text-sm sm:text-base">
                              {userInfo.phone}
                            </p>
                          {/* )} */}
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Joined On
                          </Label>
                          <p className="mt-1 text-gray-600 text-sm sm:text-base">
                            {new Date(profile?.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  <Separator className="my-6 sm:my-8" />
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-4">
                      Customer Details
                    </h2>
                    {isLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-20 sm:h-24" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 cursor-pointer">
                        <Card
                          className="bg-blue-50"
                          onClick={() => setActiveTab("wishlist")}
                        >
                          <CardContent className="p-3 sm:p-4">
                            <p className="text-xs sm:text-sm text-gray-600">
                              Wishlist Items
                            </p>
                            <p className="text-xl sm:text-2xl font-bold">
                              {wishlistItems.length}
                            </p>
                          </CardContent>
                        </Card>

                        <Link href="/cart">
                          <Card className="bg-purple-50">
                            <CardContent className="p-3 sm:p-4">
                              <p className="text-xs sm:text-sm text-gray-600">
                                Cart Items
                              </p>
                              <p className="text-xl sm:text-2xl font-bold">
                                {cartItemsCount}
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                        <Card
                          className="bg-yellow-50"
                          onClick={() => setActiveTab("orders")}
                        >
                          <CardContent className="p-3 sm:p-4">
                            <p className="text-xs sm:text-sm text-gray-600">
                              Total Orders
                            </p>
                            <p className="text-xl sm:text-2xl font-bold">
                              {profile.totalOrders || 0}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="bg-red-50">
                          <CardContent className="p-3 sm:p-4">
                            <p className="text-xs sm:text-sm text-gray-600">
                              Total Spent
                            </p>
                            <p className="text-xl sm:text-2xl font-bold">
                              ₹{profile.totalSpent || 0}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                  <Separator className="my-6 sm:my-8" />
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-4">
                      Recent Orders
                    </h2>
                    {isLoading ? (
                      <Skeleton className="h-24 sm:h-32" />
                    ) : orders.length === 0 ? (
                      <div className="flex justify-center items-center flex-col gap-2 p-6 sm:p-10 text-green-700 bg-green-100/50 rounded-lg sm:rounded-xl">
                        <Package size={32} className="sm:h-10 sm:w-10" />
                        <h1 className="text-base sm:text-lg">No orders yet</h1>
                        <Button
                          onClick={handleGoHome}
                          className="text-sm sm:text-base"
                        >
                          Start Shopping
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.slice(0, 3).map((order) => (
                          <Card key={order.orderId} className="overflow-hidden">
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                                <p className="font-semibold text-sm sm:text-base">
                                  {order.orderId}
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
                                  className="mt-2 sm:mt-0"
                                >
                                  {order.status.charAt(0).toUpperCase() +
                                    order.status.slice(1)}
                                </Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{" "}
                                {order.formattedDate}
                              </p>
                              <p className="text-xs sm:text-sm flex items-center mt-1">
                                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{" "}
                                {order.totalItems} items
                              </p>
                              <p className="text-base sm:text-lg font-bold flex items-center mt-2">
                                <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{" "}
                                {order.totalAmount}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                        <Button
                          variant="link"
                          onClick={() => setActiveTab("orders")}
                          className="text-sm sm:text-base"
                        >
                          View All Orders
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "orders" && (
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="space-y-4 sm:space-y-6">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24 sm:h-32" />
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="flex justify-center items-center flex-col gap-2 p-6 sm:p-10 bg-gray-100 rounded-lg sm:rounded-xl">
                      <Package size={32} className="sm:h-10 sm:w-10" />
                      <h1 className="text-base sm:text-lg">No orders yet</h1>
                      <Button
                        onClick={handleGoHome}
                        className="text-sm sm:text-base"
                      >
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      {orders.map((order) => (
                        <Card key={order.orderId} className="overflow-hidden">
                          <CardHeader className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                              <CardTitle className="text-base sm:text-lg">
                                {order.orderId}
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
                                className="mt-2 sm:mt-0"
                              >
                                {order.status.charAt(0).toUpperCase() +
                                  order.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {order.formattedDate} • {order.totalItems} items
                            </p>
                          </CardHeader>
                          <CardContent className="p-3 sm:p-4">
                            <div className="space-y-2 mb-4">
                              {order.items.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center"
                                >
                                  <div className="flex items-center space-x-2">
                                    <img
                                      src={
                                        item.productId.images[0]?.url ||
                                        "/placeholder.jpg"
                                      }
                                      alt={item.name}
                                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                                    />
                                    <div>
                                      <p className="font-medium text-sm sm:text-base">
                                        {item.name}
                                      </p>
                                      <p className="text-xs sm:text-sm text-gray-500">
                                        Qty: {item.quantity}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="mt-2 sm:mt-0 text-sm sm:text-base">
                                    ₹{item.price}
                                  </p>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between font-bold text-sm sm:text-base">
                              <span>Total</span>
                              <span>₹{order.totalAmount}</span>
                            </div>
                            <Separator className="my-3 sm:my-4" />
                            <div className="text-xs sm:text-sm">
                              <p className="font-medium mb-2">
                                Delivery Address
                              </p>
                              <p>{order.deliveryAddress.fullName}</p>
                              <p>
                                {order.deliveryAddress.street},{" "}
                                {order.deliveryAddress.city}
                              </p>
                              <p>
                                {order.deliveryAddress.state}{" "}
                                {order.deliveryAddress.postalCode},{" "}
                                {order.deliveryAddress.country}
                              </p>
                              <p>Phone: {order.deliveryAddress.phone}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                              <Button variant="outline" size="sm">
                                View Invoice
                              </Button>
                              {order.status !== "cancelled" && (
                                <Button variant="outline" size="sm">
                                  Track Order
                                </Button>
                              )}
                              {order.status !== "cancelled" && (
                                <Button
                                  onClick={() =>
                                    handleCancelorder(order.orderId)
                                  }
                                  variant="destructive"
                                  size="sm"
                                >
                                  Cancel Order
                                </Button>
                              )}

                              {order.status === "delivered" && (
                                <Button variant="outline" size="sm">
                                  Reorder
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "wishlist" && (
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-48 sm:h-64" />
                      ))}
                    </div>
                  ) : wishlistItems.length === 0 ? (
                    <div className="flex justify-center items-center flex-col gap-2 p-6 sm:p-10 bg-gray-100 rounded-lg sm:rounded-xl">
                      <Heart size={32} className="sm:h-10 sm:w-10" />
                      <h1 className="text-base sm:text-lg">
                        Your wishlist is empty
                      </h1>
                      <Button
                        onClick={handleGoHome}
                        className="text-sm sm:text-base"
                      >
                        Browse Products
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {wishlistItems.map((item, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardContent className="p-3 sm:p-4">
                            <Link
                              href={`/product-info/${item.productId.slug}--${item.productId._id}`}
                            >
                              <img
                                src={item.imageUrl || "/placeholder.jpg"}
                                alt={item.name}
                                className="w-full h-40 sm:h-48 object-cover rounded-lg mb-3 sm:mb-4"
                              />
                            </Link>
                            <p className="font-semibold text-base sm:text-lg mb-1">
                              {item.name}
                            </p>
                            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                              ₹{item.price}
                            </p>
                            <div className="flex gap-2 ">
                              {/* <Button
                                onClick={handleAddToCart}
                                disabled={loading}
                                className="flex-1 text-sm sm:text-base"
                              >
                                Add to Cart
                              </Button> */}
                              <Link
                                href={`/product-info/${item.productId.slug}--${item.productId._id}`}
                                className="w-full gap-2 flex items-center px-4 py-2  bg-green-700 hover:bg-green-400 hover:text-green-800 text-white rounded-4xl text-sm sm:text-base text-center"
                              >
                                <Eye className="w-4 h-4" />
                                view
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <Trash2 className="w-4 h-4 " />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Remove Item?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove{" "}
                                      {item.name} from your wishlist?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleRemoveWishlistItem(item.productId)
                                      }
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="mt-4 sm:mt-6 text-sm sm:text-base"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Wishlist
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === "addresses" && (
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="space-y-4 sm:space-y-6">
                      {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-20 sm:h-24" />
                      ))}
                    </div>
                  ) : addresses.length === 0 && !isAddingAddress ? (
                    <div className="flex justify-center items-center flex-col gap-2 p-6 sm:p-10 bg-gray-100 rounded-lg sm:rounded-xl">
                      <MapPin size={32} className="sm:h-10 sm:w-10" />
                      <h1 className="text-base sm:text-lg">
                        No addresses saved
                      </h1>
                      <Button
                        onClick={() => setIsAddingAddress(true)}
                        className="text-sm sm:text-base"
                      >
                        Add Address
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      {addresses.map((addr) => (
                        <Card
                          key={addr._id || addr.id}
                          className="relative overflow-hidden"
                        >
                          <CardContent className="p-3 sm:p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start">
                              <div>
                                <div className="flex items-center mb-2">
                                  <p className="font-semibold text-base sm:text-lg mr-2">
                                    {addr.fullName}
                                  </p>
                                  {addr.isDefault && <Badge>Default</Badge>}
                                </div>
                                <p className="text-gray-600 text-sm sm:text-base">
                                  {addr.street}, {addr.city}, {addr.state}{" "}
                                  {addr.postalCode}, {addr.country}
                                </p>
                                <p className="text-gray-600 text-sm sm:text-base">
                                  Phone: {addr.phone}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                                {!addr.isDefault && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleSetDefaultAddress(
                                        addr._id || addr.id
                                      )
                                    }
                                  >
                                    Set Default
                                  </Button>
                                )}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Address?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this
                                        address?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteAddress(
                                            addr._id || addr.id
                                          )
                                        }
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  {!isAddingAddress ? (
                    <Button
                      className="mt-4 sm:mt-6 text-sm sm:text-base"
                      onClick={() => setIsAddingAddress(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add New Address
                    </Button>
                  ) : (
                    <Card className="mt-4 sm:mt-6">
                      <CardHeader>
                        <CardTitle className="text-base sm:text-lg">
                          Add New Address
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm">Full Name</Label>
                            <Input
                              value={newAddress.fullName}
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  fullName: e.target.value,
                                })
                              }
                              className="mt-1 text-sm sm:text-base"
                              aria-label="Full Name"
                            />
                            {addressErrors.fullName && (
                              <p className="text-xs sm:text-sm text-red-500 mt-1">
                                {addressErrors.fullName}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm">Phone</Label>
                            <Input
                              value={newAddress.phone}
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  phone: e.target.value,
                                })
                              }
                              className="mt-1 text-sm sm:text-base"
                              aria-label="Phone"
                            />
                            {addressErrors.phone && (
                              <p className="text-xs sm:text-sm text-red-500 mt-1">
                                {addressErrors.phone}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm">Street</Label>
                            <Input
                              value={newAddress.street}
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  street: e.target.value,
                                })
                              }
                              className="mt-1 text-sm sm:text-base"
                              aria-label="Street"
                            />
                            {addressErrors.street && (
                              <p className="text-xs sm:text-sm text-red-500 mt-1">
                                {addressErrors.street}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm">City</Label>
                            <Input
                              value={newAddress.city}
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  city: e.target.value,
                                })
                              }
                              className="mt-1 text-sm sm:text-base"
                              aria-label="City"
                            />
                            {addressErrors.city && (
                              <p className="text-xs sm:text-sm text-red-500 mt-1">
                                {addressErrors.city}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm">State</Label>
                            <Input
                              value={newAddress.state}
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  state: e.target.value,
                                })
                              }
                              className="mt-1 text-sm sm:text-base"
                              aria-label="State"
                            />
                            {addressErrors.state && (
                              <p className="text-xs sm:text-sm text-red-500 mt-1">
                                {addressErrors.state}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm">Postal Code</Label>
                            <Input
                              value={newAddress.postalCode}
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  postalCode: e.target.value,
                                })
                              }
                              className="mt-1 text-sm sm:text-base"
                              aria-label="Postal Code"
                            />
                            {addressErrors.postalCode && (
                              <p className="text-xs sm:text-sm text-red-500 mt-1">
                                {addressErrors.postalCode}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm">Country</Label>
                            <Input
                              value={newAddress.country}
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  country: e.target.value,
                                })
                              }
                              className="mt-1 text-sm sm:text-base"
                              aria-label="Country"
                            />
                            {addressErrors.country && (
                              <p className="text-xs sm:text-sm text-red-500 mt-1">
                                {addressErrors.country}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="isDefault"
                              checked={newAddress.isDefault}
                              onCheckedChange={(checked) =>
                                setNewAddress({
                                  ...newAddress,
                                  isDefault: checked,
                                })
                              }
                            />
                            <Label htmlFor="isDefault" className="text-sm">
                              Set as Default
                            </Label>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={handleAddAddress}
                              className="text-sm sm:text-base"
                            >
                              Save Address
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setIsAddingAddress(false)}
                              className="text-sm sm:text-base"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "settings" && (
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <Tabs defaultValue="preferences" className="w-full">
                    <TabsList className="mb-4 sm:mb-6 flex-wrap">
                      <TabsTrigger
                        value="preferences"
                        className="text-sm sm:text-base"
                      >
                        Preferences
                      </TabsTrigger>
                      <TabsTrigger
                        value="account"
                        className="text-sm sm:text-base"
                      >
                        Account
                      </TabsTrigger>
                      {/* <TabsTrigger
                        value="payments"
                        className="text-sm sm:text-base"
                      >
                        Payments
                      </TabsTrigger> */}
                    </TabsList>
                    <TabsContent value="preferences">
                      <div className="space-y-4 sm:space-y-6">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 text-sm sm:text-base">
                            Email Notifications
                          </span>
                          <Switch />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 text-sm sm:text-base">
                            SMS Notifications
                          </span>
                          <Switch />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 text-sm sm:text-base">
                            Push Notifications
                          </span>
                          <Switch />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="account">
                      <div className="space-y-4 sm:space-y-6">
                        <>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl font-semibold">
                              Account Information
                            </h2>
                            {!isEditingProfile ? (
                              <Button
                                variant="outline"
                                onClick={handleEditProfileToggle}
                                className="mt-2 sm:mt-0"
                              >
                                <Edit className="w-4 h-4 mr-2" /> Update
                              </Button>
                            ) : (
                              <div className="flex space-x-2 mt-2 sm:mt-0">
                                <Button
                                  variant="outline"
                                  onClick={handleEditProfileToggle}
                                >
                                  <X className="w-4 h-4 mr-2" /> Cancel
                                </Button>
                                <Button onClick={handleSaveProfile}>
                                  <Save className="w-4 h-4 mr-2" /> Save
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Full Name
                              </Label>
                              {isEditingProfile ? (
                                <Input
                                  name="fullName"
                                  value={userInfo.fullName}
                                  onChange={handleProfileInputChange}
                                  className="mt-1 text-sm sm:text-base"
                                  aria-label="Full Name"
                                />
                              ) : (
                                <p className="mt-1 text-gray-600 text-sm sm:text-base">
                                  {userInfo.fullName}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Email Address
                              </Label>
                              {isEditingProfile ? (
                                <Input
                                  name="email"
                                  value={userInfo.email}
                                  onChange={handleProfileInputChange}
                                  className="mt-1 text-sm sm:text-base"
                                  aria-label="Email Address"
                                />
                              ) : (
                                <p className="mt-1 text-gray-600 text-sm sm:text-base">
                                  {userInfo.email}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Phone Number
                              </Label>
                              {isEditingProfile ? (
                                <Input
                                  name="phone"
                                  value={userInfo.phone}
                                  onChange={handleProfileInputChange}
                                  className="mt-1 text-sm sm:text-base"
                                  aria-label="Phone Number"
                                />
                              ) : (
                                <p className="mt-1 text-gray-600 text-sm sm:text-base">
                                  {userInfo.phone}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Joined On
                              </Label>
                              <p className="mt-1 text-gray-600 text-sm sm:text-base">
                                {new Date(
                                  profile?.createdAt
                                ).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        </>
                        <Button
                          variant="primary"
                          className="w-full justify-start text-sm sm:text-base cursor-pointer"
                        >
                          <Edit className="w-4 h-4 mr-2" /> Change Password
                        </Button>
                        <Button
                          variant="primary"
                          className="w-full justify-start text-sm sm:text-base cursor-pointer"
                        >
                          <User className="w-4 h-4 mr-2" /> Update Email
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              className="w-1/5 justify-start text-sm sm:text-base"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Account?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. Are you sure?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  toast.success("Account deletion requested");
                                }}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TabsContent>
                    {/* <TabsContent value="payments">
                      <div className="space-y-4 sm:space-y-6">
                        <h3 className="text-base sm:text-lg font-semibold">
                          Saved Payment Methods
                        </h3>
                        <Card>
                          <CardContent className="flex items-center p-3 sm:p-4">
                            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 mr-3 sm:mr-4" />
                            <div>
                              <p className="font-medium text-sm sm:text-base">
                                Visa **** 1234
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">
                                Expires 12/2026
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-auto text-sm sm:text-base"
                            >
                              Remove
                            </Button>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="flex items-center p-3 sm:p-4">
                            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 mr-3 sm:mr-4" />
                            <div>
                              <p className="font-medium text-sm sm:text-base">
                                Mastercard **** 5678
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">
                                Expires 05/2025
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-auto text-sm sm:text-base"
                            >
                              Remove
                            </Button>
                          </CardContent>
                        </Card>
                        <Button className="w-full text-sm sm:text-base">
                          <Plus className="w-4 h-4 mr-2" /> Add Payment Method
                        </Button>
                      </div>
                    </TabsContent> */}
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t rounded-t-4xl border-gray-200 flex justify-around items-center p-2 z-20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center p-2 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              } rounded-lg`}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              <tab.icon className="w-5 h-5 mb-1" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
