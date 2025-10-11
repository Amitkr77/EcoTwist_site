"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Suspense } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Clock,
  Headphones,
  Send,
  MessageCircle,
  Star,
  Leaf,
  Loader2,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaPinterestP,
  FaYoutube,
} from "react-icons/fa";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long"),
  email: z.string().email("Invalid email address"),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(100, "Subject is too long"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message is too long"),
  inquiryType: z.enum(["general", "bulk", "custom", "partnership", "support"]),
});

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Eco-Entrepreneur",
    content:
      "Ecotwist's sustainable products and responsive support made our event a hit. Highly recommend!",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "Corporate Buyer",
    content:
      "The custom branding options were fantastic. Quick response and eco-friendly packaging!",
    rating: 4,
  },
  {
    name: "Tousif Akram",
    role: "Biz Flyer",
    content:
      "Partnering with Ecotwist was seamless. Their commitment to sustainability is inspiring.",
    rating: 5,
  },
  {
    name: "Ashutosh Kumar",
    role: "TenderDesk",
    content:
      "The product quality is excellent! I received a quick response from the team, and the eco-friendly packaging truly reflects their commitment to sustainability. Highly satisfied with both the service and the products!",
    rating: 5,
  },
];

const faqs = [
  {
    question: "What are the benefits of bulk ordering with EcoTwist?",
    answer:
      "Bulk orders come with discounts, custom branding options, and priority shipping. Contact us for a quote tailored to your needs.",
  },
  {
    question: "How eco-friendly are your products?",
    answer:
      "All products are made from sustainable, biodegradable materials with certifications available upon request.",
  },
  {
    question: "Can I request a custom product design?",
    answer:
      "Yes, we offer custom designs for orders above 100 units, including material and color customization.",
  },
  {
    question: "What is your response time for inquiries?",
    answer:
      "We guarantee a response within 24 hours on business days. Urgent queries can be handled via phone.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we offer worldwide shipping with multiple options, including express delivery for urgent orders.",
  },
];

export default function ContactPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const whatsappNumber = "917091323777";
  const whatsappLink = `https://wa.me/${whatsappNumber}`;
  const whatsappCall = `tel:+${whatsappNumber}`;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      inquiryType: "general",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to send message");
      }

      toast.success(
        "Your message has been sent! We'll respond within 24 hours."
      );
      form.reset();
    } catch (error) {
      toast.error(error.message || "Failed to send message. Please try again.");
      console.error("Contact form submission error:", error);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const result = await response.json();
      console.log(result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to subscribe");
      }

      toast.success(
        "Subscribed to our newsletter! Check your inbox for eco-tips."
      );
      setNewsletterEmail("");
    } catch (error) {
      toast.error(error.message || "Failed to subscribe. Please try again.");
      console.error("Newsletter subscription error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section with Animated Background */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative min-h-[70vh] flex items-center justify-center py-16 lg:py-32 px-6 overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 dark:from-green-800 dark:via-emerald-800 dark:to-teal-900 text-white"
      >
        {/* Subtle Eco Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>

        {/* Dark Overlay for Depth */}
        <div className="absolute inset-0 bg-black/25"></div>

        {/* Enhanced Animated Elements */}
        <motion.div
          className="absolute top-20 left-10 w-24 h-24 bg-white/15 rounded-full backdrop-blur-sm border border-white/20"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-32 h-32 bg-white/20 rounded-full backdrop-blur-sm border border-white/30"
          animate={{
            y: [0, 30, 0],
            rotate: [0, -180, -360],
            scale: [1, 0.95, 1],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-8 w-16 h-16 bg-emerald-200/25 rounded-full backdrop-blur-sm"
          animate={{ x: [-15, 15, -15], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-10 w-20 h-20 bg-teal-100/20 rounded-full backdrop-blur-sm"
          animate={{
            x: [10, -10, 10],
            y: [0, -10, 0],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center max-w-4xl">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-4 sm:mb-6 tracking-tight">
              Connect with{" "}
              <span className="bg-gradient-to-r from-white/90 to-emerald-100/90 bg-clip-text text-transparent px-2 sm:px-3 py-1 rounded-md shadow-lg">
                Ecotwist
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed text-white/95 font-light">
              Join us in creating a sustainable future. Reach out for inquiries,
              partnerships, or eco-friendly inspiration.
            </p>
          </motion.div>

          {/* Enhanced CTA with Social Links */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center mt-8"
          >
            <Button
              asChild
              className="group relative inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium text-base sm:text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:bg-white/20 hover:border-white/30 transform hover:scale-105 active:scale-95"
            >
              <a href="#contact-form" className="relative z-10">
                <span>Get in Touch</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
                <svg
                  className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
            </Button>

            {/* Social Links */}
            <div className="flex space-x-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-all duration-300"
                aria-label="Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-all duration-300"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.988 11.988 11.988s11.988-5.368 11.988-11.988C24.005 5.367 18.638 0 12.017 0zm0 18.958c-4.273 0-7.746-3.473-7.746-7.971s3.473-7.97 7.746-7.97 7.746 3.472 7.746 7.97-3.473 7.972-7.746 7.972zm0-13.925c-2.626 0-4.758 2.132-4.758 4.758s2.132 4.758 4.758 4.758 4.758-2.132 4.758-4.758-2.132-4.758-4.758-4.758zm9.588-2.203a1.29 1.29 1.29 0 1 1-1.29-1.29c0-.71.58-1.29 1.29-1.29s1.29.58 1.29 1.29c0 .71-.58 1.29-1.29 1.29z" />
                </svg>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <motion.div
            id="contact-form"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white dark:bg-gray-800 border-none shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 p-6">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Send className="mr-2 h-6 w-6 text-green-600 dark:text-green-400" />
                  Send Us a Message
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-200">
                              Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your full name"
                                {...field}
                                className="border-gray-200 dark:border-gray-700 focus:ring-green-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-200">
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="your@email.com"
                                {...field}
                                className="border-gray-200 dark:border-gray-700 focus:ring-green-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-200">
                            Subject
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="What's this about?"
                              {...field}
                              className="border-gray-200 dark:border-gray-700 focus:ring-green-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="inquiryType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-200">
                            Inquiry Type
                          </FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-200"
                            >
                              <option value="general">General Inquiry</option>
                              <option value="bulk">Bulk Order Quote</option>
                              <option value="custom">
                                Custom Product Request
                              </option>
                              <option value="partnership">
                                Partnership Opportunity
                              </option>
                              <option value="support">Customer Support</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-200">
                            Message
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us how we can help..."
                              {...field}
                              rows={6}
                              className="border-gray-200 dark:border-gray-700 focus:ring-green-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Send Message
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info and Social Links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <Card className="bg-white dark:bg-gray-800 border-none shadow-xl rounded-2xl h-full">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 p-6">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Leaf className="mr-2 h-6 w-6 text-green-600 dark:text-green-400" />
                  Reach Out
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-10 mt-5">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Email
                    </p>
                    <a
                      href="mailto:info@ecotwist.in"
                      className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                    >
                      contact@ecotwist.in
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Address
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Mauryalok Complex, Patna, Bihar 800001, India
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Office Hours
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Mon-Sat: 9:00 AM - 6:00 PM
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Headphones className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Phone
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      +91 709-132-3777
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    {
                      icon: FaFacebookF,
                      href: "https://www.facebook.com/ecotwiststores",
                      color: "hover:text-blue-600",
                    },
                    {
                      icon: FaInstagram,
                      href: "https://www.instagram.com/ecotwiststores",
                      color: "hover:text-pink-500",
                    },
                    {
                      icon: FaLinkedinIn,
                      href: "https://www.linkedin.com/company/ecotwiststores",
                      color: "hover:text-blue-700",
                    },
                    {
                      icon: FaTwitter,
                      href: "https://x.com/ecotwiststores",
                      color: "hover:text-blue-400",
                    },
                    {
                      icon: FaPinterestP,
                      href: "https://www.pinterest.com/ecotwiststores",
                      color: "hover:text-red-500",
                    },
                    {
                      icon: FaYoutube,
                      href: "https://www.youtube.com/@ecotwiststores",
                      color: "hover:text-red-600",
                    },
                  ].map(({ icon: Icon, href, color }, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="icon"
                      className={`text-gray-600 dark:text-gray-300 ${color} rounded-full`}
                      asChild
                    >
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit our ${href.split(".")[1]} page`}
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Interactive Map */}
        <Card className="bg-white dark:bg-gray-800 border-none shadow-xl rounded-2xl overflow-hidden mt-10">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <MapPin className="mr-2 h-6 w-6 text-green-600 dark:text-green-400" />
              Find Us
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Suspense fallback={<p>Loading map...</p>}>
              <Map center={[25.6101, 85.1341]} zoom={14} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Live Chat Dialog */}
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          {/* Floating WhatsApp Button */}
          <DialogTrigger asChild>
            <Button
              className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-2xl z-50"
              aria-label="Open WhatsApp Support"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </DialogTrigger>

          {/* Dialog Content */}
          <DialogContent className="bg-white dark:bg-gray-800 border-none shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">
                WhatsApp Support
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 text-center">
              <Headphones className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Connect with us instantly on WhatsApp for chat or call support.
              </p>

              {/* Chat on WhatsApp */}
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-700 text-white w-full mb-3">
                  Chat on WhatsApp
                </Button>
              </a>

              {/* Call on WhatsApp (or normal phone call) */}
              <a href={whatsappCall}>
                <Button className="bg-green-500 hover:bg-green-600 text-white w-full">
                  Call Us on WhatsApp
                </Button>
              </a>

              <Button
                onClick={() => setIsChatOpen(false)}
                className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 w-full"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Testimonials Carousel */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-8 sm:py-12 md:py-16 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-xl"
        aria-label="Customer testimonials"
      >
        <div className="max-w-full sm:max-w-3xl md:max-w-5xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              What Our Customers Say
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
              Hear directly from our customers about their experiences with us.
              We’re proud to showcase their stories.
            </p>
          </div>

          <Carousel
            className="relative"
            opts={{
              align: "start",
              loop: true,
            }}
            aria-roledescription="carousel"
          >
            <div className="absolute -top-20 right-4 sm:right-20 sm:flex  z-10 hidden gap-2 sm:gap-3">
              <CarouselPrevious
                className="h-8 w-8 sm:h-9 sm:w-9 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-sm"
                aria-label="Previous testimonial"
              />
              <CarouselNext
                className="h-8 w-8 sm:h-9 sm:w-9 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-sm"
                aria-label="Next testimonial"
              />
            </div>
            <CarouselContent className="px-2 sm:px-4 -mx-2 sm:-mx-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={index}
                  className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 px-2 sm:px-3"
                >
                  <Card className="bg-white dark:bg-gray-800 border-none shadow-sm hover:shadow-md transition-shadow duration-200 h-full ">
                    <CardContent className="p-4 sm:p-6 flex flex-col justify-between  sm:items-start items-center h-full gap-4">
                      <div className="flex mb-2 sm:mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current"
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 line-clamp-4 text-center sm:text-left">
                        {testimonial.content}
                      </p>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          {testimonial.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {testimonial.role}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </motion.section>
    </div>
  );
}
