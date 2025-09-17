"use client";

import { motion } from "framer-motion";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";


export default function CTA() {
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to subscribe");
      }

      toast.success("Subscribed to our newsletter! 🌱");
      setNewsletterEmail("");
    } catch (error) {
      toast.error(error.message || "Failed to subscribe. Please try again.");
    }
  };

  return (
    <div>
      <motion.section
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative py-20 text-center bg-gradient-to-r from-green-700 via-green-600 to-green-800 text-white rounded-t-3xl -mx-6 lg:-mx-0 lg:rounded-none lg:rounded-b-3xl"
      >
        <div className="absolute inset-0 opacity-5 bg-[url('/leaves-pattern.png')] bg-cover bg-center"></div>
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Join Our Eco-Community 🌱
            </h2>
            <p className="text-green-100 text-lg leading-relaxed">
              Stay inspired with weekly tips on sustainable living, fresh
              product updates, and exclusive eco-deals delivered straight to
              your inbox.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mt-6"
            >
              <Input
                type="email"
                placeholder="Enter your email for green vibes"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="rounded-full border-green-300/50 text-green-900 focus:ring-green-400 bg-white/90 placeholder-green-300 flex-1"
              />
              <Button
                type="submit"
                className="bg-white text-green-700 hover:bg-green-100 rounded-full px-8 py-3 font-semibold shadow-lg"
              >
                Subscribe Now
              </Button>
            </form>
            <p className="text-xs text-green-200 mt-2">
              No spam, ever. Unsubscribe anytime. 🌍
            </p>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
