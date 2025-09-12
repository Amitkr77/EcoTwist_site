"use client";

import { useState, useEffect } from "react";
import { 
  Menu, Search, ShoppingCart, X, User, LogIn, MessageCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { useCart } from "@/contexts/CartContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Header({ cartItemsCount = 0 }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const pathname = usePathname();
  const { getTotalItems } = useCart();

  // Check token on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("user-token");
      setIsAuthenticated(!!token);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user-token");
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  const isActive = (path) => pathname === path;

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "About", path: "/about" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
  ];

  // WhatsApp number
  const phoneNumber = "+917091323777"; 

  // Predefined questions
  const questions = [
    "I want to know about your products",
    "I need help with my order",
    "Do you offer discounts?",
    
  ];

  // Send selected question to WhatsApp
  const handleQuestionClick = (q) => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(q)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      {/* ---------------- HEADER ---------------- */}
      <header className="bg-white backdrop-blur-md border-b shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center ">
            {/* Logo */}
            <Link href="/" aria-label="Homepage" className="flex items-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-12 sm:h-14 lg:h-18 w-auto"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 uppercase tracking-wide text-sm font-semibold text-gray-700">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative hover:text-forest transition-colors ${
                    isActive(item.path) ? "text-forest" : ""
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <Sidebar />

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-2 rounded-md hover:bg-gray-100">
                      <User className="h-5 w-5 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="w-full">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist" className="w-full">Wishlist</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" className="hidden lg:block p-2 hover:bg-gray-100">
                    <User className="h-5 w-5 text-gray-600" />
                  </Button>
                </Link>
              )}

              <div className="border bg-gray-300 h-8 sm:h-10" />

              {/* Cart */}
              <Link href="/cart">
                <Button variant="outline" className="relative text-xs sm:text-sm">
                  <ShoppingCart className="w-4 h-4 mr-1 sm:mr-2" />
                  Cart
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs bg-green-500">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2"
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Nav */}
          {isMenuOpen && (
            <nav className="md:hidden bg-blue-400/20 py-6">
              <div className="flex flex-col gap-4 px-4 sm:px-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`text-lg font-medium py-2 rounded-md ${
                      isActive(item.path)
                        ? "bg-forest/10 text-forest"
                        : "text-gray-700 hover:text-forest hover:bg-gray-100"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* FLOATING WHATSAPP CHATBOT  */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Floating Button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </button>

        {/* Chatbot Popup */}
        {chatOpen && (
          <div className="absolute bottom-16 right-0 w-72 bg-white rounded-lg shadow-xl border p-4">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              Hi! How can we help you?
            </h3>
            <div className="flex flex-col gap-2">
              {questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuestionClick(q)}
                  className="text-left text-sm px-3 py-2 rounded-md border hover:bg-green-50 hover:border-green-400 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
