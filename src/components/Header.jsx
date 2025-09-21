"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, ShoppingCart, User, X, Heart, LogOut,LogIn } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
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
import { fetchCart, clearCart } from "@/store/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { Separator } from "./ui/separator";

// Throttle helper
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

// Nav items
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

  // Check auth on mount
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

  // Scroll behavior
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
      } ${
        scrolled ? "shadow-lg" : "shadow-sm"
      } fixed top-0 left-0 right-0 z-50`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center">
            {/* Hamburger (Mobile) */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>

            {/* Logo */}
            <Link href="/" aria-label="Homepage" className="flex items-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-12 sm:h-14 w-auto"
                loading="lazy"
                decoding="async"
              />
            </Link>
          </div>
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 uppercase tracking-wide text-sm font-semibold text-gray-700">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`relative group hover:text-forest transition-colors ${
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

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <Sidebar />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-2 rounded-md hover:bg-gray-100 hidden sm:block"
                  >
                    <User className="h-5 w-5 text-gray-600" />
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
                  className="p-2 rounded-md hover:bg-gray-100 hidden sm:block"
                >
                  <User className="h-5 w-5 text-gray-600" />
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="outline" className="relative">
                <ShoppingCart className="w-4 h-4 mr-2" />
                {totalCartItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs bg-green-500">
                    {totalCartItems}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetContent
              side="left"
              className="w-64 sm:w-72 bg-white dark:bg-gray-900 p-0 md:hidden"
              aria-describedby="mobile-menu-description"
            >
              <SheetHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Menu
                  </SheetTitle>
                </div>
              </SheetHeader>

              <nav className="flex flex-col space-y-2 p-4">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      href={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block py-2 px-3 text-sm sm:text-base font-medium rounded-md transition-colors duration-300 ${
                        isActive(item.path)
                          ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30"
                          : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                <Separator className="my-2 bg-gray-200 dark:bg-gray-700" />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: navItems.length * 0.1 }}
                >
                  <h3 className="px-3 py-1 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    User
                  </h3>
                </motion.div>
                {isAuthenticated ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: (navItems.length + 1) * 0.1,
                      }}
                    >
                      <Link
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-2 py-2 px-3 text-sm sm:text-base font-medium rounded-md transition-colors duration-300 ${
                          isActive("/profile")
                            ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30"
                            : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                        }`}
                        aria-label="Go to Profile"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: (navItems.length + 2) * 0.1,
                      }}
                    >
                      <Link
                        href="/wishlist"
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-2 py-2 px-3 text-sm sm:text-base font-medium rounded-md transition-colors duration-300 ${
                          isActive("/wishlist")
                            ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30"
                            : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                        }`}
                        aria-label="Go to Wishlist"
                      >
                        <Heart className="h-4 w-4" />
                        Wishlist
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: (navItems.length + 3) * 0.1,
                      }}
                    >
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2 w-full text-left py-2 px-3 text-sm sm:text-base font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-300"
                        aria-label="Logout"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: (navItems.length + 1) * 0.1,
                    }}
                  >
                    <Button
                      asChild
                      className="w-full py-2 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium text-sm sm:text-base transition-all duration-300"
                    >
                      <Link
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-2"
                        aria-label="Go to Login"
                      >
                        <LogIn className="h-4 w-4" />
                        Login
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        )}
      </AnimatePresence>
    </header>
  );
}
