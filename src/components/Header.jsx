
"use client";

import { useState, useEffect, useCallback ,useRef} from "react";
import { Menu, Search, ShoppingCart, X, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { fetchCart } from "@/store/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

// Static navigation items
const navItems = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "About", path: "/about" },
  { name: "Blog", path: "/blog" },
  { name: "Contact", path: "/contact" },
];

// Simple throttle function
const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return (...args) => {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { cart, status: cartStatus, error: cartError } = useSelector((state) => state.cart);
  const lastScrollY = useRef(0);

  // Check authentication on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("user-token");
      setIsAuthenticated(!!token);
    }
  }, []);

  // Fetch cart data
  useEffect(() => {
    if (cartStatus === "idle") {
      dispatch(fetchCart());
    }
  }, [dispatch, cartStatus]);

  // Handle cart fetch errors
  useEffect(() => {
    if (cartError) {
      toast.error("Failed to load cart data. Please try again.");
    }
  }, [cartError]);

  // Handle scroll for header visibility and shadow
  useEffect(() => {
    const handleScroll = throttle(() => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      setHidden(currentScrollY > lastScrollY.current && currentScrollY > 100);
      lastScrollY.current = currentScrollY;
    }, 100);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user-token");
    setIsAuthenticated(false);
    toast.success("Logged out successfully!");
    router.push("/login");
  };

  const isActive = useCallback((path) => pathname === path, [pathname]);

  const totalCartItems =  cart?.totalQuantity || 0;

  return (
    <header
      className={`bg-white backdrop-blur-md border-b transition-all duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${scrolled ? "shadow-lg" : "shadow-sm"} fixed top-0 left-0 right-0 z-50`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center ">
          {/* Logo */}
          <Link href="/" aria-label="Homepage" className="flex items-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 sm:h-14 lg:h-16 w-auto"
              loading="lazy"
              decoding="async"
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
                aria-current={isActive(item.path) ? "page" : undefined}
              >
                {item.name}
                <span
                  className={`absolute left-0 bottom-[-6px] h-[2px] bg-gradient-to-r from-forest to-forest-600 transition-all duration-300 ${
                    isActive(item.path) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <Sidebar />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-2 rounded-md hover:bg-gray-100"
                    aria-label="User menu"
                  >
                    <User className="h-4 sm:h-5 w-4 sm:w-5 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="w-full">
                      Wishlist
                    </Link>
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
                <Button
                  variant="ghost"
                  className="p-2 rounded-md hover:bg-gray-100 hidden lg:block"
                  aria-label="Sign in"
                >
                  <User className="h-4 sm:h-5 w-4 sm:w-5 text-gray-600" />
                </Button>
              </Link>
            )}

            <div className="border bg-gray-300 h-8 sm:h-10" />

            {/* Cart */}
            <Link href="/cart">
              <Button
                variant="outline"
                className="relative text-xs sm:text-sm"
                aria-label={`Cart with ${totalCartItems} items`}
              >
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Cart
                {totalCartItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 p-0 text-xs bg-green-500">
                    {totalCartItems}
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
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? (
                <X className="h-5 sm:h-6 w-5 sm:w-6 text-gray-600" />
              ) : (
                <Menu className="h-5 sm:h-6 w-5 sm:w-6 text-gray-600" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        <nav
          id="mobile-menu"
          className={`md:hidden bg-blue-400/20 transition-all duration-300 overflow-hidden ${
            isMenuOpen ? "max-h-screen py-6" : "max-h-0 py-0"
          }`}
        >
          <div className="flex flex-col gap-4 px-4 sm:px-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-base sm:text-lg font-medium py-2 rounded-md transition-colors ${
                  isActive(item.path)
                    ? "bg-forest/10 text-forest"
                    : "text-gray-700 hover:text-forest hover:bg-gray-100"
                }`}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive(item.path) ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start py-2 px-3 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="h-4 sm:h-5 w-4 sm:w-5 text-gray-600 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}