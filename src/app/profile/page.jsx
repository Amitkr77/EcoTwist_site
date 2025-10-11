"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

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
import Setting from "@/components/profile/Setting";
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
  LogOut,
  Home,
  EllipsisIcon,
  Leaf,
  Eye,
  Trash2,
  Share2,
} from "lucide-react";
import {
  fetchUserProfile,
  fetchWishlist,
  updateAccountInfo,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  removeFromWishlist,
  clearUserData,
} from "@/store/slices/userSlice";
import { useRouter } from "next/navigation";
import AddressSection from "@/components/profile/Address";
import Orders from "@/components/profile/Orders";
import Overview from "@/components/profile/Overview";
import Wishlist from "@/components/profile/Wishlist";

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
  const [activeTab, setActiveTab] = useState("overview");
  const { profile, wishlist, status, error } = useSelector(
    (state) => state.user
  );
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

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

  // 1. Fetch profile on mount
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // 2. Fetch wishlist when profile is ready
  useEffect(() => {
    if (profile?._id) {
      dispatch(fetchWishlist(profile._id));
    }
  }, [profile?._id, dispatch]);

  // 3. Set local user info
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

  // 4. Optional: Refresh wishlist on tab change
  useEffect(() => {
    if (activeTab === "wishlist" && profile?._id) {
      dispatch(fetchWishlist(profile._id));
    }
  }, [activeTab, profile?._id, dispatch]);

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

  // const handleRemoveWishlistItem = (productId) => {
  //   dispatch(removeFromWishlist(productId))
  //     .unwrap()
  //     .then(() => toast.success("Item removed from wishlist"))
  //     .catch((err) =>
  //       toast.error(err || "Failed to remove item from wishlist")
  //     );
  // };

  const handleRemoveWishlistItem = async (productId) => {
    try {
      // Dispatch the action to remove from wishlist
      await dispatch(removeFromWishlist(productId)).unwrap();

      // Show success toast
      toast.success("Item removed from wishlist");
      console.log("Product removed from wishlist");
    } catch (error) {
      // Show error toast
      toast.error(error.message || "Failed to remove item from wishlist");
      console.error("Failed to remove from wishlist:", error);
    }
  };

  const handleLogout = async () => {
    dispatch(clearUserData());

    await fetch("/api/user/auth/logout", { method: "POST" });

    toast.success("Logged out successfully");
    router.push("/login");
  };

  const handleGoHome = () => {
    router.push("/");
  };

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
        <aside className="hidden sm:flex w-64 lg:w-72 bg-white p-4 sm:p-6 border-r border-gray-200  shadow-sm  flex-col h-full flex-shrink-0">
          {/* Header Section */}
          <div className="flex-shrink-0 mb-6 sm:mb-8  ">
            <div className="flex items-center">
              {isLoading ? (
                <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
              ) : (
                <div className="relative">
                  <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-2 ring-gray-100">
                    <AvatarImage
                      src={profile?.profilePicture}
                      alt="User Avatar"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                      {userInfo.fullName?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -bottom-1 -right-1 rounded-full h-7 w-7 p-0 bg-white border-2 border-gray-200 shadow-md hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                    onClick={() => {
                      alert("Edit profile picture");
                    }}
                  >
                    <Edit className="h-3 w-3 text-gray-600" />
                    <span className="sr-only">Edit profile picture</span>
                  </Button>
                </div>
              )}
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                {isLoading ? (
                  <>
                    <Skeleton className="h-5 w-28 sm:h-6 sm:w-32 mb-1" />
                    <Skeleton className="h-4 w-40 sm:w-48 mb-2" />
                  </>
                ) : (
                  <>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                      {userInfo.fullName}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 truncate mt-1">
                      {userInfo.email}
                    </p>
                    <div className="flex items-center mt-2">
                      <Leaf className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        Eco Member
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 flex flex-col overflow-hidden ">
            <Separator className="my-3 sm:my-4 bg-gray-200" />
            <nav className="flex-1 overflow-y-auto px-1">
              <ul className="space-y-1 sm:space-y-1.5">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`group w-full flex items-center px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg text-left transition-all duration-200 text-sm sm:text-base font-medium relative overflow-hidden ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-3 border-blue-500 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-l-2 hover:border-gray-200"
                      }`}
                      aria-current={activeTab === tab.id ? "page" : undefined}
                    >
                      <tab.icon
                        className={`w-4 h-4 sm:w-5 sm:h-5 mr-3 flex-shrink-0 transition-colors duration-200 ${
                          activeTab === tab.id
                            ? "text-blue-600"
                            : "group-hover:text-gray-700"
                        }`}
                      />
                      <span className="truncate">{tab.label}</span>
                      {activeTab === tab.id && (
                        <div className="absolute right-0 top-0 h-full w-1 bg-blue-500" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Footer Section - Pinned to Bottom */}
          <div className="flex-shrink-0 mt-auto pt-4 sm:pt-6 ">
            <Separator className="my-3 sm:my-4 bg-gray-200" />
            <div className="flex flex-col  space-y-2">
              <Button
                variant="ghost"
                onClick={handleGoHome}
                className="justify-start h-11 sm:h-12 text-sm sm:text-base hover:bg-green-50 transition-all duration-200 border border-gray-100 hover:border-gray-200 rounded-xl"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-3 flex-shrink-0" />
                <span className="flex-1 text-left">Home</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="justify-start h-11 sm:h-12 text-sm sm:text-base hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-gray-100 hover:border-red-200 rounded-xl"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-3 flex-shrink-0" />
                    <span className="flex-1 text-left">Log Out</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600">
                      Log Out?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to log out? You will need to sign in
                      again to access your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700"
                    >
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
              <Overview
                userInfo={userInfo}
                profile={profile}
                orders={orders}
                isLoading={isLoading}
                wishlistItems={wishlistItems}
                cartItemsCount={cartItemsCount}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "orders" && (
              <Orders orders={orders} isLoading={isLoading} />
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
                                        handleRemoveWishlistItem(
                                          item.productId._id || item.productId
                                        )
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
              <AddressSection
                addresses={addresses}
                isLoading={false}
                user={userInfo}
              />
            )}

            {activeTab === "settings" && (
              <Setting data={userInfo} profileData={profile} />
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
