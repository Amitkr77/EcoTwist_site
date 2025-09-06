"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Heart,
  Package,
  MapPin,
  Mail,
  ShoppingCart,
  LogOut,
  Menu,
  Home,
} from "lucide-react";
import Link from "next/link";

const Navbar = React.memo(({ activeTab, setActiveTab, sidebarItems }) => {
  const [userProfile] = useState({
    name: "Amit Kumar",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    totalOrders: 25,
    totalSpent: 4500,
    wishlistItems: 12,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter out logout from sidebarItems as it's now a separate button
  const navItems = sidebarItems.filter((item) => item.value !== "logout");

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 sm:p-8 mb-6 transition-all duration-300 hover:shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            <img
              src="./Avatar.png"
              alt="User Avatar"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md transition-transform duration-300 group-hover:scale-105"
              onError={(e) => (e.target.src = "https://via.placeholder.com/150")} // Fallback image
            />
            <div className="absolute inset-0 rounded-full bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold flex items-center justify-center sm:justify-start gap-2 text-gray-800 dark:text-gray-100">
                  {userProfile.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Customer
                </p>
              </div>
              
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-3">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                {userProfile.location}
              </span>
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                {userProfile.email}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                <p className="text-blue-600 dark:text-blue-400 font-semibold text-lg flex items-center justify-center gap-1">
                  {userProfile.totalOrders}
                  <Package className="w-4 h-4" />
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Total Orders
                </p>
              </div>
              <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                <p className="text-green-600 dark:text-green-400 font-semibold text-lg">
                  ₹{userProfile.totalSpent.toLocaleString()}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Total Spent
                </p>
              </div>
              <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-300 hidden sm:block">
                <p className="text-red-600 dark:text-red-400 font-semibold text-lg flex items-center justify-center gap-1">
                  {userProfile.wishlistItems}
                  <Heart className="w-4 h-4" />
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Wishlist Items
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <nav className="flex items-center border-b border-gray-200 dark:border-gray-700">
        <button
          className="sm:hidden text-gray-600 dark:text-gray-300 mr-4"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div
          className={`flex-1 flex overflow-x-auto scrollbar-hide ${
            isMobileMenuOpen ? "flex" : "hidden sm:flex"
          }`}
        >
          {navItems.map((item) => (
            <button
              key={item.value}
              className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 text-sm font-medium transition-all duration-300 flex-shrink-0 min-w-fit ${
                activeTab === item.value
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30"
                  : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
              }`}
              onClick={() => {
                setActiveTab(item.value);
                setIsMobileMenuOpen(false); // Close mobile menu on tab select
              }}
              aria-label={`Navigate to ${item.label}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
});

export default Navbar;