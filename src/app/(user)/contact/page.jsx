"use client";
import React, { useState } from "react";
import { CiMail } from "react-icons/ci";
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaPinterest, FaMapMarkerAlt  } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function page() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    inquiryType: "general",
  });
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate form submission
    toast({
      title: "Message Sent!",
      description:
        "Thank you for contacting us. We'll get back to you within 24 hours.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      company: "",
      message: "",
      inquiryType: "general",
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-forest text-white mb-4">Get in Touch</Badge>
          <h1 className="font-heading text-4xl font-bold text-slate-800 mb-4">
            Connect EcoTwist
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Have questions about our products or need a custom bulk order quote?
            We're here to help you make sustainable choices.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-heading text-xl font-semibold text-slate-800 mb-4">
                Contact Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CiMail className="h-5 w-5 text-forest mt-1" />
                  <div>
                    <p className="font-medium text-slate-800">Email</p>
                    <p className="text-slate-600">info@ecotwist.in</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="h-5 w-5 text-forest mt-1" />
                  <div>
                    <p className="font-medium text-slate-800">Address</p>
                    <p className="text-slate-600">
                      Mauryalok Complex
                      <br />
                      Patna , 800001
                      <br />
                      Bihar, India
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-1 sm:space-x-0.5 mt-4 sm:mt-6 justify-center md:justify-start">
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
                    <FaFacebook className="h-5 w-5 sm:h-6 sm:w-6 hover:text-teal-400 transition-all duration-300" />
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
                    <FaInstagram className="h-5 w-5 sm:h-6 sm:w-6 hover:text-pink-400 transition-all duration-300" />
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
                    <FaLinkedin className="h-5 w-5 sm:h-6 sm:w-6 hover:text-blue-600 transition-all duration-300" />
                  </Button>
                </a>

                <a
                  href="http://x.com/ecotwiststores"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-blue-400 rounded-full p-2 transition-all duration-300"
                  >
                    <FaXTwitter className="h-5 w-5 sm:h-6 sm:w-6 hover:text-blue-600 transition-all duration-300" />
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
                    <CiMail className="h-5 w-5 sm:h-6 sm:w-6 hover:text-red-400 transition-all duration-300" />
                  </Button>
                </a>

                <a
                  href="https://www.pinterest.com/ecotwiststores/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-red-500 rounded-full p-2 transition-all duration-300"
                  >
                    <FaPinterest className="h-5 w-5 sm:h-6 sm:w-6 hover:text-red-400 transition-all duration-300" />
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
                    <FaYoutube className="h-5 w-5 sm:h-6 sm:w-6 hover:text-red-400 transition-all duration-300" />
                  </Button>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-heading text-xl font-semibold text-slate-800 mb-4">
                Connect Hours
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Monday - Saturday</span>
                  <span className="text-slate-800">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Sunday</span>
                  <span className="text-slate-800">Closed</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-forest via-green-800 to-forest-700 text-white rounded-xl p-6 ">
              <h3 className="font-heading text-xl font-semibold mb-4">
                Quick Response Guarantee
              </h3>
              <p className="text-forest-100 mb-4">
                We respond to all inquiries within 24 hours during business
                days.
              </p>
              <p className="text-forest-100">
                For urgent bulk orders, call us directly for immediate
                assistance.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="font-heading text-2xl font-bold text-slate-800 mb-6">
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Inquiry Type
                  </label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="bulk">Bulk Order Quote</option>
                    <option value="custom">Custom Product Request</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="support">Customer Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Message *
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Tell us about your requirements, questions, or how we can help you..."
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full eco-button text-lg py-3"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
