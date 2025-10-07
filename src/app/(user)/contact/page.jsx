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
    name: "Anita Desai",
    role: "Sustainability Advocate",
    content:
      "Partnering with Ecotwist was seamless. Their commitment to sustainability is inspiring.",
    rating: 5,
  },
  {
    name: "Anita Desai",
    role: "Sustainability Advocate",
    content:
      "Partnering with Ecotwist was seamless. Their commitment to sustainability is inspiring.",
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
        className="relative py-32 px-6 text-center overflow-hidden bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-800 dark:to-emerald-900 text-white"
      >
        {/* Background Overlay with animation */}
        <div className="absolute inset-0 bg-black/30"></div>
        {/* Main Content */}
        <div className="text-center z-10 relative">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            Connect with Ecotwist
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-6"
          >
            Join us in creating a sustainable future. Reach out for inquiries,
            partnerships, or eco-friendly inspiration.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-6"
          >
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              <a href="#contact-form">Get in Touch</a>
            </Button>
          </motion.div>
        </div>

        {/* Animated Circular Elements */}
        <motion.div
          className="absolute top-16 left-5 w-32 h-32 bg-white/20 rounded-full"
          animate={{ y: [0, -20, 0], rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-16 right-5 w-48 h-48 bg-white/30 rounded-full"
          animate={{ y: [0, 20, 0], rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
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
