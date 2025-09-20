"use client";

import React from "react";
import { CiMail } from "react-icons/ci";
import { FaXTwitter } from "react-icons/fa6";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaPinterest,
} from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import CTA from "./CTA";
import { motion } from "framer-motion";

export default function Footer() {
  const footerSections = [
    {
      title: "Quick Links",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Contact Us", path: "/contact" },
        { name: "Shop", path: "/products" },
        { name: "Blog", path: "/blog" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Return Policy", path: "/return-policy" },
        { name: "Privacy Policy", path: "/privacy-policy" },
        { name: "Terms of Service", path: "/termsOfService" },
        { name: "FAQ", path: "/faq" },
        { name: "Shipping Policy", path: "/shipping-policy" },
      ],
    },
  ];

  const socialLinks = [
    {
      href: "https://www.facebook.com/ecotwiststores",
      icon: <FaFacebook className="h-5 w-5 sm:h-6 sm:w-6" />,
      label: "Facebook",
      color: "hover:text-blue-600",
    },
    {
      href: "https://www.instagram.com/ecotwiststores/",
      icon: <FaInstagram className="h-5 w-5 sm:h-6 sm:w-6" />,
      label: "Instagram",
      color: "hover:text-pink-500",
    },
    {
      href: "https://www.linkedin.com/company/ecotwiststores/",
      icon: <FaLinkedin className="h-5 w-5 sm:h-6 sm:w-6" />,
      label: "LinkedIn",
      color: "hover:text-blue-400",
    },
    {
      href: "http://x.com/ecotwiststores",
      icon: <FaXTwitter className="h-5 w-5 sm:h-6 sm:w-6" />,
      label: "Twitter",
      color: "hover:text-blue-400",
    },
    {
      href: "https://www.pinterest.com/ecotwiststores/",
      icon: <FaPinterest className="h-5 w-5 sm:h-6 sm:w-6" />,
      label: "Pinterest",
      color: "hover:text-red-500",
    },
    {
      href: "https://www.youtube.com/@ecotwiststores",
      icon: <FaYoutube className="h-5 w-5 sm:h-6 sm:w-6" />,
      label: "YouTube",
      color: "hover:text-red-500",
    },
    {
      href: "mailto:info@ecotwist.in",
      icon: <CiMail className="h-5 w-5 sm:h-6 sm:w-6" />,
      label: "Email",
      color: "hover:text-red-500",
    },
  ];
  return (
    <footer className="text-slate-600 relative overflow-hidden bg-white">
      <CTA />
      {/* Main Footer */}
      <div className="py-8 sm:py-12 md:py-16 bg-gradient-to-t from-green-50 to-white dark:from-green-900 dark:to-gray-900 relative z-10">
        <div className="max-w-full sm:max-w-3xl md:max-w-5xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 md:gap-12">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="col-span-2 sm:col-span-2 md:col-span-2 text-center sm:text-left"
            >
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
                <img
                  src="/logo.png"
                  alt="EcoTwist Logo"
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    EcoTwist
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Innovations Pvt. Ltd.
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-xs mx-auto sm:mx-0 leading-relaxed">
                Crafting premium corporate gifts from recycled materials for a
                sustainable future.
              </p>
              <div className="flex justify-center sm:justify-start gap-2 mt-4">
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-2 rounded-full text-gray-600 dark:text-gray-300 ${link.color} transition-colors duration-300`}
                    aria-label={`Visit our ${link.label}`}
                  >
                    {link.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links and Support */}
            {footerSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="col-span-1 text-center sm:text-left"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.path}
                        className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* Address  */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="col-span-2 sm:col-span-2 md:col-span-1 text-center sm:text-left"
            >
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
                Address
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <li>
                  <a
                    href="https://maps.google.com/?q=B-Hub+Maurya+Lok+Patna,+Bihar,+India+800001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    B-Hub, Maurya Lok, Patna, Bihar, India – 800001
                  </a>
                </li>
              </ul>

              <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 mb-2 sm:mb-4">
                Bulk/Custom Order
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center justify-center sm:justify-start gap-2 mt-4">
                  <CiMail className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <a
                    href="mailto:info@ecotwist.in"
                    className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    info@ecotwist.in
                  </a>
                </li>
                <li className="flex items-center justify-center sm:justify-start gap-2">
                  <FaPhoneAlt className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <a
                    href="tel:+917091323777"
                    className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    +91 709-132-3777
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 sm:mt-10 md:mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center"
          >
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              © 2025{" "}
              <Link
                href="/"
                className="font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
              >
                EcoTwist
              </Link>{" "}
              | All rights reserved. | Crafted with 🌿 for a sustainable future
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
