"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  User,
  Package,
  Heart,
  Settings,
  MapPin,
  LogOut,
  HeartIcon,
  PackageIcon,
  MapPinCheck,
  MailIcon,
  BadgeCheck,
} from "lucide-react";

// 

function Navbar({ activeTab, setActiveTab, sidebarItems }) {
  // const [activeTab, setActiveTab] = useState("overview");

  const [userProfile] = useState({
    name: "Amit kumar",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    role: "Developer",
    earnings: "$4,500",
    projects: "80",
    successRate: "60%",
  });

  // const sidebarItems = [
  //   { icon: User, label: "Overview", value: "overview" },
  //   { icon: Package, label: "Orders", value: "orders" },
  //   { icon: Heart, label: "Wishlist", value: "wishlist" },
  //   { icon: MapPin, label: "Addresses", value: "addresses" },
  //   { icon: Settings, label: "Settings", value: "settings" },
  //   { icon: LogOut, label: "Logout", value: "logout" },
  // ];

  return (
    <div className="p-6">
      {/* Profile Header Card */}
      <div className="bg-white shadow-md rounded-xl p-6 flex items-start justify-between">
        {/* Left: Avatar + Info */}
        <div className="flex items-start gap-4">
          <img
            src="./Avatar.png"
            alt="Avatar"
            className="object-contain object-center w-50 h-50 p-4 border-2"
          />
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {userProfile.name}
              <BadgeCheck />
            </h2>

            <div className="flex items-center">
              <span className="text-gray-400 pr-12 flex gap-1.5">
                <MapPinCheck /> {userProfile.location}
              </span>
              <span className="text-gray-400 pr-4 flex gap-1.5">
                <MailIcon /> {userProfile.email}
              </span>
            </div>

            {/* Earnings + Projects (Moved Below) */}
            <div className="flex gap-6 mt-4">
              <div className="bg-white shadow-sm rounded-lg p-4 flex-1 text-center">
                <p className="text-green-500 font-semibold">
                  {userProfile.earnings}
                </p>
                <p className="text-gray-500 text-sm">
                  Earnings <HeartIcon />
                </p>
              </div>
              <div className="bg-white shadow-sm rounded-lg p-4 flex-1 text-center">
                <p className="text-red-500 font-semibold">
                  {userProfile.projects} <PackageIcon />
                </p>
                <p className="text-gray-500 text-sm">Projects</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Buttons (if any in future) */}
      </div>

      {/* Stats Section */}

      {/* Tabs Section */}
      <nav className="flex gap-6 mt-6 border-b">
        {sidebarItems.map((item) => (
          <button
            key={item.value}
            className={`flex items-center gap-2 pb-2 ${
              activeTab === item.value
                ? "border-b-2 border-blue-500 text-blue-500 font-semibold"
                : "text-gray-600 hover:text-blue-500"
            }`}
            onClick={() => {
              setActiveTab(item.value);
              if (item.value === "logout")
                toast.success("Logged out successfully!");
            }}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Navbar;
