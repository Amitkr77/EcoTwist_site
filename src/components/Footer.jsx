import React from "react";
import { Mail, Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="text-slate-600 relative overflow-hidden bg-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 lg:gap-12 md:place-items-start items-start place-items-center">
          {/* Company Info */}
          <div className="col-span-2 space-y-2  flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-3 sm:space-x-4 justify-center md:justify-start">
              <div>
                <img
                  src="/logo.png"
                  alt="EcoTwist Logo"
                  className="w-16 h-16 sm:w-20 sm:h-20 mix-blend-color"
                />
              </div>
              <div className="text-center md:text-left">
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-black">
                  EcoTwist
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Innovations Pvt. Ltd.
                </p>
              </div>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xs text-center md:text-left">
              Transforming waste into premium corporate gifts. Every purchase
              contributes to a sustainable future.
            </p>
            <div className="flex space-x-3 sm:space-x-4 mt-4 sm:mt-6 justify-center md:justify-start">
              <a
                href="https://www.facebook.com/ecotwiststores"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-teal-500 rounded-full p-2 transition-all duration-300"
                >
                  <Facebook className="h-5 w-5 sm:h-6 sm:w-6 hover:text-teal-400 transition-all duration-300" />
                </Button>
              </a>

              <a
                href="https://www.instagram.com/ecotwiststores/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-pink-500 rounded-full p-2 transition-all duration-300"
                >
                  <Instagram className="h-5 w-5 sm:h-6 sm:w-6 hover:text-pink-400 transition-all duration-300" />
                </Button>
              </a>

              <a
                href="https://www.linkedin.com/company/ecotwiststores/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-blue-400 rounded-full p-2 transition-all duration-300"
                >
                  <Linkedin className="h-5 w-5 sm:h-6 sm:w-6 hover:text-blue-600 transition-all duration-300" />
                </Button>
              </a>

              <a
                href="mailto:info@ecotwist.in"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-red-500 rounded-full p-2 transition-all duration-300"
                >
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 hover:text-red-400 transition-all duration-300" />
                </Button>
              </a>


              <a
                href="https://www.youtube.com/@ecotwiststores"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-red-500 rounded-full p-2 transition-all duration-300"
                >
                  <Youtube className="h-5 w-5 sm:h-6 sm:w-6 hover:text-red-400 transition-all duration-300" />
                </Button>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="font-heading font-semibold text-lg sm:text-xl mb-3 sm:mb-4 text-slate-600">
              Quick Links
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {[
                // { name: "Shop", path: "/shop" },
                { name: "About Us", path: "/about" },
                { name: "Blog", path: "/blog" },
                { name: "Contact", path: "/contact" },
                // { name: "Wishlist", path: "/wishlist" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-slate-600 hover:text-teal-500 transition-all duration-300 text-xs sm:text-sm hover:translate-x-2 transform block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories - Hidden on smaller screens */}
          <div className="space-y-4 sm:space-y-6 hidden md:block">
            <h3 className="font-heading font-semibold text-lg sm:text-xl mb-3 sm:mb-4 text-slate-600">
              Categories
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {[
                "Bamboo Products",
                "Jute Items",
                "Recycled Plastic",
                "Upcycled Textiles",
                "Corporate Gifts",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/shop"
                    className="text-slate-600 hover:text-teal-500 transition-all duration-300 text-xs sm:text-sm hover:translate-x-2 transform block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4 sm:space-y-6 ">
            <h3 className="font-heading font-semibold text-lg sm:text-xl mb-3 sm:mb-4 text-slate-600">
              Support
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { name: "Return and Refund Policy", path: "/return-policy" },
                { name: "Privacy Policy", path: "/privacy-policy" },
                { name: "Terms of service", path: "/term-services" },
                { name: "FAQ", path: "/faq" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-slate-600 hover:text-teal-500 transition-all duration-300 text-xs sm:text-sm hover:translate-x-2 transform block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 sm:mt-8 lg:mt-12 pt-6 sm:pt-8 border-t border-slate-700 text-center">
          <p className="text-slate-600 text-xs sm:text-sm">
            © 2025 EcoTwist Innovations Pvt. Ltd. All rights reserved. | Made
            with ❤️ for our planet
          </p>
        </div>
      </div>
    </footer>
  );
}
