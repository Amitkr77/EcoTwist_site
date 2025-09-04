"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, Search, ShoppingCart, X, User, LogIn } from "lucide-react";
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

export default function Header({ cartItemsCount = 0, onCartClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { getTotalItems } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check token on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  // Read from localStorage on mount
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const auth = localStorage.getItem("isAuthenticated") === "true";
  //     setIsAuthenticated(auth);
  //   }
  // }, []);

  // Scroll logic
  // useEffect(() => {
  //   const handleScroll = () => {
  //     const currentY = window.scrollY;
  //     setScrolled(currentY > 20);

  //     if (currentY > 100) {
  //       if (currentY > lastScrollY.current) {
  //         setHidden(true); // Scrolling down
  //         setIsMenuOpen(false);
  //       } else {
  //         setHidden(false); // Scrolling up
  //       }
  //     } else {
  //       setHidden(false); // Top of page
  //     }
  //     lastScrollY.current = currentY;
  //   };

  //   const debouncedScroll = debounce(handleScroll, 50);
  //   window.addEventListener("scroll", debouncedScroll);
  //   return () => window.removeEventListener("scroll", debouncedScroll);
  // }, []);

  const isActive = (path) => pathname === path;

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "About", path: "/about" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header
  className={`bg-white backdrop-blur-md border-b transition-all duration-300 ${
    hidden ? "-translate-y-full" : "translate-y-0"
  } ${scrolled ? "shadow-lg" : "shadow-sm"} fixed top-0 left-0 right-0 z-50`}
>
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center py-4">
      {/* Logo */}
      <Link href="/" aria-label="Homepage" className="flex items-center">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-12 sm:h-14 lg:h-16 w-auto hover:scale-105 transition-transform"
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
              >
                <User className="h-4 sm:h-5 w-4 sm:w-5 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="w-full">
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
            >
              <User className="h-4 sm:h-5 w-4 sm:w-5 text-gray-600" />
            </Button>
          </Link>
        )}

        <div className="border bg-gray-300 h-8 sm:h-10 "></div>

        {/* Cart */}
        <Link href="/cart">
          <Button variant="outline" className="relative text-xs sm:text-sm">
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Cart
            {getTotalItems() > 0 && (
              <Badge className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 p-0 text-xs bg-green-500">
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
        isMenuOpen ? "h-full py-6" : "max-h-0 py-0"
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
          >
            {item.name}
          </Link>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="justify-start py-2 px-3 hover:bg-gray-100"
          onClick={() => alert("Open search modal")}
        >
          <Search className="h-4 sm:h-5 w-4 sm:w-5 text-gray-600 mr-2" />
          Search Products
        </Button>
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
