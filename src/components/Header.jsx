"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, Search, ShoppingCart, User, LogIn, X } from "lucide-react";
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
import {
  fetchCart,
  clearCart,
} from "@/store/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

// Optional: Add throttle helper
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Dummy nav items
const navItems = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/products" },
  { name: "Contact", path: "/contact" },
  { name: "Blog", path: "/blog" },
  { name: "About", path: "/about" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const lastScrollY = useRef(0);

  const cartStatus = useSelector((state) => state.cart.status);
  const cartError = useSelector((state) => state.cart.error);
  const totalCartItems = useSelector(
    (state) =>
      state.cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0
  );

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("user-token");
    setIsAuthenticated(!!token);
  }, []);

  // Fetch cart
  useEffect(() => {
    if (isAuthenticated && cartStatus === "idle") {
      dispatch(fetchCart());
    } else {
      const localCart = JSON.parse(localStorage.getItem("guest-cart") || "{}");
      if (localCart.cart?.items) {
        dispatch({
          type: "cart/fetchCart/fulfilled",
          payload: localCart.cart,
        });
      }
    }
  }, [dispatch, isAuthenticated, cartStatus]);

  // Handle cart error
  useEffect(() => {
    if (cartStatus === "failed" && cartError) {
      toast.error("Failed to load cart data. Please try again.");
    }
  }, [cartStatus, cartError]);

  // Handle scroll
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
    localStorage.removeItem("guest-cart");
    setIsAuthenticated(false);
    toast.success("Logged out successfully!");
    router.push("/login");
    dispatch(clearCart());
  };

  const isActive = useCallback((path) => pathname === path, [pathname]);

  return (
    <header
      className={`bg-white backdrop-blur-md border-b transition-all duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${scrolled ? "shadow-lg" : "shadow-sm"} fixed top-0 left-0 right-0 z-50`}
    >
      <div className="container mx-auto py-0  px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" aria-label="Homepage" className="flex items-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 sm:h-14 lg:h-22      w-auto"
              loading="lazy"
              decoding="async"
            />
          </Link>

          <div className="flex items-center md:hidden">
  <Button
    variant="ghost"
    className="p-2 rounded-md hover:bg-gray-100"
    onClick={() => setIsMenuOpen(!isMenuOpen)}
    aria-label="Toggle menu"
  >
    {isMenuOpen ? (
      <X className="h-5 w-5 text-gray-700" />
    ) : (
      <Menu className="h-5 w-5 text-gray-700" />
    )}
  </Button>
</div>

{/* Desktop Navigation */}
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


{/* Mobile Menu */}
{isMenuOpen && (
  <div className="md:hidden bg-white border-t shadow-sm">
    <nav className="flex flex-col space-y-2 py-4 px-6 text-gray-700 font-medium">
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          onClick={() => setIsMenuOpen(false)} // close menu when clicking a link
          className={`hover:text-forest transition-colors ${
            isActive(item.path) ? "text-forest" : ""
          }`}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  </div>
)}

          {/* Right Side Icons */}
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
                      Profile
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
                  className="p-2 rounded-md hover:bg-gray-100"
                  aria-label="Sign in"
                >
                  <User className="h-4 sm:h-5 w-4 sm:w-5 text-gray-600" />
                </Button>
              </Link>
            )}

            {/* Cart Icon */}
            <div className="relative text-xs sm:text-sm">
              <Link href="/cart">
                <Button
                  variant="outline"
                  className="relative text-xs sm:text-sm"
                  aria-label={`Cart with ${totalCartItems} items`}
                >
                  <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {totalCartItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 p-0 text-xs bg-green-500">
                      {totalCartItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
