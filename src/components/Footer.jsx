import React from "react";
import { Mail, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className=" text-slate-600 relative overflow-hidden">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-4  relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 place-items-center">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div>
                <img
                  src="/logo.png"
                  alt=""
                  className="w-20 h-20 mix-blend-color"
                />
              </div>
              <div>
                <h2 className="font-heading font-bold text-3xl text-black">
                  EcoTwist
                </h2>
                <p className="text-sm text-slate-600">Innovations Pvt. Ltd.</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed max-w-xs">
              Transforming waste into premium corporate gifts. Every purchase
              contributes to a sustainable future.
            </p>
            <div className="flex space-x-4 mt-6">
              <a
                href="https://www.facebook.com/ecotwiststore"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-teal-500 rounded-full p-2 transition-all duration-300"
                >
                  <Facebook className="h-6 w-6 hover:text-teal-400 transition-all duration-300" />
                </Button>
              </a>

              <a
                href="https://www.instagram.com/ecotwiststore/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-pink-500 rounded-full p-2 transition-all duration-300"
                >
                  <Instagram className="h-6 w-6 hover:text-pink-400 transition-all duration-300" />
                </Button>
              </a>

              <a
                href="https://www.linkedin.com/company/ecotwistinnovations/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-blue-400 rounded-full p-2 transition-all duration-300"
                >
                  <Linkedin className="h-6 w-6 hover:text-blue-600 transition-all duration-300"/>
                </Button>
              </a>

              <a
                href="mailto:Info@ecotwist.in"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-red-500 rounded-full p-2 transition-all duration-300"
                >
                  <Mail className="h-6 w-6 hover:text-red-400 transition-all duration-300" />
                </Button>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-heading font-semibold text-xl mb-4 text-slate-600">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Shop", path: "/shop" },
                { name: "About Us", path: "/about" },
                { name: "Blog", path: "/blog" },
                { name: "Contact", path: "/contact" },
                { name: "Wishlist", path: "/wishlist" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-slate-600 hover:text-teal-500 transition-all duration-300 text-sm hover:translate-x-2 transform block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h3 className="font-heading font-semibold text-xl mb-4 text-slate-600">
              Categories
            </h3>
            <ul className="space-y-3">
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
                    className="text-slate-600 hover:text-teal-500 transition-all duration-300 text-sm hover:translate-x-2 transform block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h3 className="font-heading font-semibold text-xl mb-4 text-slate-600">
              Support
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Return Policy", path: "/return-policy" },
                { name: "Shipping Info", path: "/shipping" },
                { name: "FAQ", path: "/faq" },
                { name: "Privacy Policy", path: "/privacy" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-slate-600 hover:text-teal-500 transition-all duration-300 text-sm hover:translate-x-2 transform block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-slate-700 text-center ">
          <p className="text-slate-600 text-sm">
            © 2025 EcoTwist Innovations Pvt. Ltd. All rights reserved. | Made
            with ❤️ for our planet
          </p>
        </div>
      </div>
    </footer>
  );
}
