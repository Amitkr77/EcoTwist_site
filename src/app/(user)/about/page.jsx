"use client"

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import CountUp from "react-countup";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-800 mt-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1569060368645-4ab30c8d8b0e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Eco-friendly creation from recycled materials"
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 py-24 flex flex-col justify-center items-center text-center text-white">
          <Badge className="bg-green-800/45 text-white mb-8 shadow-lg text-sm uppercase tracking-wider px-4 py-2">
            Our Story
          </Badge>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Crafting a{" "}
            <span className="text-green-800 bg-white/45 px-2">Sustainable Future</span>
          </h1>
          <p className="text-base sm:text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed text-white/90">
            At <strong>Ecotwist Innovations</strong>, we transform waste into
            beautiful, meaningful creations — designed with purpose, driven by
            sustainability.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-20 bg-[#f8f9f4]">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-[#1B4332] leading-tight">
              Purposefully Made. Thoughtfully Given.
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-700">
              We design meaningful corporate gifts using upcycled, biodegradable
              materials — not just to reduce waste, but to uplift artisan
              communities and reconnect business with nature.
            </p>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-700">
              Every product tells a story of craftsmanship, sustainability, and
              social good — helping companies gift with heart and purpose.
            </p>
            <div>
              <Link href="/products">
                <Button className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-6 py-3 rounded-md shadow-md transition duration-300">
                  Explore Our Products
                </Button>
              </Link>
            </div>
          </div>

          {/* Image */}
          <div>
            <img
              src="/about_image.png"
              alt="Eco-friendly products and artisans"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

  

      {/* Philosophy Section */}
      <section className="py-20 bg-[#f0f9f4]">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Our Philosophy
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
              We embrace the circular economy, infusing eco-innovation with
              artisanal heritage.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {[
              {
                icon: "♻️",
                title: "Circular Thinking",
                text: "We close the loop by turning waste into elegant, high-value gifts.",
              },
              {
                icon: "🎨",
                title: "Artisan Powered",
                text: "Our creations are handcrafted by skilled artisans, celebrating heritage.",
              },
              {
                icon: "🌍",
                title: "Eco Commitment",
                text: "We prioritize biodegradable materials and low-impact production.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-10 rounded-xl shadow-md hover:shadow-lg transition duration-300 text-center"
              >
                <div className="text-3xl md:text-4xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-lg sm:text-xl mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-base sm:text-lg">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Environmental Impact Section */}
      <section className="py-20 bg-[#f0f5f1] px-4 sm:px-6 font-body">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading text-[#1B4332] leading-tight mb-6">
            Our Environmental Impact
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Every piece we create is part of a bigger promise — to the earth, to
            communities, and to the future. Here's how we’re building change
            that lasts.
          </p>
        </div>

        <div className="mt-10 space-y-10 max-w-4xl mx-auto">
          {/* Item 1 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="text-3xl md:text-4xl text-[#2E7D32]">🌿</div>
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-heading text-gray-900 mb-2">
                Waste, Reimagined
              </h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Over <strong><CountUp end={12000} duration={5} separator="," /> kg</strong> of waste diverted from
                landfills, transformed into functional design with purpose.
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="text-3xl md:text-4xl text-[#2E7D32]">👐</div>
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-heading text-gray-900 mb-2">
                Communities Empowered
              </h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Supporting over <strong><CountUp end={100} duration={2} separator="," /> artisan families</strong> with
                dignified, consistent livelihoods rooted in craft and culture.
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="text-3xl md:text-4xl text-[#2E7D32]">📦</div>
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-heading text-gray-900 mb-2">
                Packaging That Leaves No Trace
              </h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Shipped in <strong><CountUp end={100} duration={2} separator="," />% plastic-free</strong> and biodegradable
                packaging — clean design, clean conscience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1B4332] font-semibold mb-6">
            Meet Our Team
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            A passionate group of designers, sustainability advocates, and
            community builders — united by purpose.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                name: "Richa Sinha",
                role: "Founder & CEO",
                initials: "RS",
              },
              {
                name: "Amit Kumar",
                role: "CTO",
                initials: "AK",
              },
              {
                name: "Aditya Kumar",
                role: "Social Media Manager",
                initials: "AK",
              },
            ].map((member, idx) => (
              <div key={idx} className="text-center space-y-2">
                <Avatar className="w-16 h-16 mx-auto mb-2">
                  <AvatarFallback className="bg-[#2E7D32] text-white font-medium">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg sm:text-xl font-medium text-gray-800">
                  {member.name}
                </h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-16 bg-[#f5f5f5] text-black text-center">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-6">
            Let’s Redefine Gifting
          </h2>
          <p className="text-base sm:text-lg max-w-xl mx-auto mb-8">
            Join us in promoting sustainable corporate gifting. Let’s make
            thoughtful impact together.
          </p>
          <Link href="/contact">
            <Button
              variant="outline"
              className="border-black text-black bg-white/10 px-6 py-3"
            >
              Get In Touch
            </Button>
          </Link>
        </div>
      </section> */}
    </div>
  );
}