"use client";
import React, { useState } from "react";
import { CiMail } from "react-icons/ci";
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaPinterest, FaMapMarkerAlt  } from "react-icons/fa";import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen pt-20  ">
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
                    {/* <p className="text-slate-600">bulk@ecotwist.com</p> */}
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
                {/* <div className="flex justify-between">
                  <span className="text-slate-600">Saturday</span>
                  <span className="text-slate-800">10:00 AM - 4:00 PM</span>
                </div> */}
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
                    Company Name
                  </label>
                  <Input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your company name"
                  />
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

        FAQ Section
        <div className="mt-20 bg-white rounded-2xl p-10  border border-slate-200">
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-slate-900 mb-10 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Column 1 */}
            <div className="space-y-8">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-2">
                  <svg
                    className="w-5 h-5 text-indigo-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-14a6 6 0 11-.001 12.001A6 6 0 0110 4zm-.75 3.25a.75.75 0 011.5 0V9a.75.75 0 01-1.5 0V7.25zm.75 6.25a.875.875 0 100-1.75.875.875 0 000 1.75z" />
                  </svg>
                  What's the minimum order quantity for bulk orders?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Our minimum bulk order is <strong>50 pieces</strong> for most
                  products. Custom orders may vary.
                </p>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-2">
                  <svg
                    className="w-5 h-5 text-indigo-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 5a2 2 0 012-2h4.586A2 2 0 0110 3.586L11.414 5H16a2 2 0 012 2v3.528a5.49 5.49 0 00-2-.528V7h-4.586a2 2 0 01-1.414-.586L8.586 5H4v10h3.132c.137.708.378 1.374.708 2H4a2 2 0 01-2-2V5z" />
                  </svg>
                  Do you offer custom branding on products?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Absolutely! We offer eco-friendly branding options like{" "}
                  <em>laser engraving</em>, <em>natural dyes</em>, and{" "}
                  <em>recycled labels</em>.
                </p>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-2">
                  <svg
                    className="w-5 h-5 text-indigo-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6 2a1 1 0 00-1 1v2h10V3a1 1 0 00-1-1H6zM4 7v10a2 2 0 002 2h8a2 2 0 002-2V7H4zm6 2a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" />
                  </svg>
                  What's your typical dispatch timeline?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Standard orders: <strong>1–2 business days</strong>.
                  Bulk/custom orders: <strong>7–14 days</strong>.
                </p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-8">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-2">
                  <svg
                    className="w-5 h-5 text-indigo-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm9-3a1 1 0 10-2 0v1a1 1 0 002 0V7zm0 3a1 1 0 10-2 0v3a1 1 0 002 0v-3z" />
                  </svg>
                  Are your products certified eco-friendly?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Yes — all our products are <strong>eco-certified</strong> and
                  meet global sustainability standards.
                </p>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-2">
                  <svg
                    className="w-5 h-5 text-indigo-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M12 1a1 1 0 011 1v1h4a1 1 0 011 1v11.586a1 1 0 01-.293.707l-3.586 3.586a1 1 0 01-.707.293H4a1 1 0 01-1-1V4a1 1 0 011-1h4V2a1 1 0 011-1h3zm-1 3V2H9v2H5v12h10.586L17 15.586V4h-4z" />
                  </svg>
                  Do you ship internationally?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Currently, we ship within India.{" "}
                  <strong>International shipping</strong> is available for bulk
                  orders over ₹50,000.
                </p>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-2">
                  <svg
                    className="w-5 h-5 text-indigo-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                  </svg>
                  What's your return policy?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  We offer a <strong>07-day return policy</strong> on all
                  standard items. Custom/branded products are non-returnable
                  unless defective.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
