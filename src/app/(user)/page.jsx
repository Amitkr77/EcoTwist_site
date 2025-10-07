"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  Truck,
  Shield,
  Recycle,
  Award,
  MoveRight,
  ArrowRight,
  Leaf,
  Users,
  Globe,
  ShoppingBag,
  MessageCircle,
  X,
  Hand,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Eco-Entrepreneur",
    content:
      "EcoTwist's sustainable products and responsive support made our event a hit. Highly recommend!",
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
    name: "Toushif Akram",
    role: "Biz Flyer",
    content:
      "Partnering with EcoTwist was seamless. Their commitment to sustainability is inspiring.",
    rating: 5,
  },
  {
    name: "Ashutosh Kumar",
    role: "TenderDesk",
    content: "The product quality is excellent! I received a quick response from the team, and the eco-friendly packaging truly reflects their commitment to sustainability. Highly satisfied with both the service and the products!",
    rating: 5,
  },
];

const stats = [
  {
    icon: <Leaf className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-500" />,
    value: "100K+",
    label: "CO₂ Reduced (kg)",
    description: "Offsetting emissions through sustainable practices.",
    color:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: <Users className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />,
    value: "500+",
    label: "Communities Empowered",
    description: "Supporting local artisans and eco-initiatives.",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  {
    icon: <Recycle className="h-8 w-8 sm:h-10 sm:w-10 text-amber-500" />,
    value: "10K+",
    label: "Materials Repurposed",
    description: "Transforming waste into beautiful products.",
    color:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  },
  {
    icon: <Globe className="h-8 w-8 sm:h-10 sm:w-10 text-purple-500" />,
    value: "1M+",
    label: "Lives Impacted",
    description: "Creating a global ripple effect for sustainability.",
    color:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  useEffect(() => {
    // Helper function to check if the token is expired
    const isTokenExpired = (token) => {
      try {
        console.log("Decoding token:", token);
        const decodedToken = jwtDecode(token); // Decode the JWT token
        const expiry = decodedToken.exp; // Get the expiry time from the token payload
        const isExpired = Date.now() >= expiry * 1000; // Check if token is expired
        return isExpired;
      } catch (e) {
        console.error("Error decoding token:", e);
        return true;
      }
    };

    const checkAndRemoveToken = () => {
      // Get the token from localStorage
      const localStorageToken = localStorage.getItem("user-token");

      // Check localStorage token
      if (localStorageToken) {
        if (isTokenExpired(localStorageToken)) {
          localStorage.removeItem("user-token");
          localStorage.removeItem("user-id");
        }
      }
    };

    // Call the function to check the token on page load
    checkAndRemoveToken();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="min-h-screen relative">
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="relative"
        >
          <Button
            className="rounded-full p-4 bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
            aria-label="Open chat support"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </motion.div>
        {/* Chat Preview Modal */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-20 right-6 sm:bottom-24 sm:right-8 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-green-100"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      EcoTwist Support
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsChatOpen(false)}
                      aria-label="Close chat"
                    >
                      <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Have questions about our sustainable gifts? We're here to
                    help!
                  </p>
                  <Button
                    asChild
                    className="w-full bg-green-600 text-white hover:bg-green-700"
                  >
                    <Link href="/contact">Start Chat</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 text-gray-800 py-12 md:py-16 lg:py-20 overflow-hidden flex flex-col lg:flex-row items-center bg-gradient-to-br from-white via-teal-50 to-white">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0,80 Q50,100 100,80"
              fill="none"
              stroke="#2E7D32"
              strokeWidth="0.3"
              strokeDasharray="3"
            />
          </svg>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl sm:mt-10 mt-2">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="relative w-full lg:w-1/2 h-72 sm:h-72 md:h-80 lg:h-[600px]">
              <Image
                src="./eco-hero-image.png"
                alt="Eco-Friendly Gifts"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain object-center transition-opacity duration-300 hover:opacity-95"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/40" />
            </div>
            <div className="relative z-10 w-full lg:w-1/2 px-4 sm:px-6 lg:px-12 mt-6 lg:mt-0">
              <div className="w-full max-w-3xl bg-white/95 p-6 sm:p-8 lg:p-10 rounded-xl border border-teal-100 shadow-md transition-transform duration-300 hover:shadow-lg group">
                <span className="inline-block bg-teal-100 px-3 py-1 rounded-full text-xs uppercase tracking-wide font-semibold text-teal-800">
                  🌿 Eco Elite Gifting
                </span>
                <h1 className="mt-6 font-sans text-2xl sm:text-3xl lg:text-5xl font-bold leading-snug tracking-tight text-gray-800 group">
                  <span className="group-hover:text-teal-600 group-hover:scale-105 transition-all duration-300">
                    Elevate
                  </span>{" "}
                  <span className="group-hover:scale-105 transition-all duration-300">
                    Eco
                  </span>
                  -
                  <span className="group-hover:text-teal-600 group-hover:scale-105 transition-all duration-300">
                    Luxury
                  </span>{" "}
                  with{" "}
                  <span className="group-hover:text-teal-600 group-hover:scale-105 transition-all duration-300">
                    Style
                  </span>
                </h1>
                <p className="mt-6 text-base sm:text-lg lg:text-xl text-gray-600 font-light leading-relaxed max-w-xl">
                  Transform your brand with exclusive, upcycled gifts.
                  Sustainable, chic, and ready to impress—act today!
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <Button
                    asChild
                    className="px-6 py-3 text-sm sm:text-base font-medium bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors duration-300 rounded-lg"
                  >
                    <Link href="/products">Discover Gifts</Link>
                  </Button>
                  <Button
                    asChild
                    className="px-6 py-3 text-sm sm:text-base font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors duration-300 rounded-lg"
                  >
                    <Link href="/about">Our Story</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-6">
              Why Choose EcoTwist?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto">
              We combine sustainability with premium quality to deliver gifts
              that make a lasting impression.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: Recycle,
                title: "100% Sustainable",
                description:
                  "All products made from upcycled and biodegradable materials",
                gradient: "from-green-700 via-emerald-500 to-lime-400",
              },
              {
                icon: Award,
                title: "Crafted Assurance",
                description:
                  "Handcrafted by skilled artisans with attention to detail",
                gradient: "from-indigo-600 via-purple-500 to-yellow-400",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                description: "Quick and reliable shipping across India",
                gradient: "from-yellow-400 via-orange-500 to-red-500",
              },
              {
                icon: Shield,
                title: "Quality Guarantee",
                description: "30-day return policy and quality assurance",
                gradient: "from-blue-700 via-cyan-500 to-teal-400",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <Card className="text-center border border-slate-100 bg-white/70 backdrop-blur-md rounded-xl hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div
                      className={`h-12 w-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-r ${feature.gradient}`}
                    >
                      <feature.icon className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg text-slate-800 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Our{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                Impact
              </span>{" "}
              in Action
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              Driving sustainability and community growth with every step we
              take.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card
                  className={`flex flex-col items-center justify-center text-center p-8 rounded-xl ${stat.color} border-none shadow-sm hover:shadow-md transition-shadow duration-300`}
                  aria-label={`${stat.label}: ${stat.value}`}
                >
                  <CardContent className="flex flex-col items-center justify-center p-0 space-y-4">
                    <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white dark:bg-gray-800">
                      {stat.icon}
                    </div>
                    <div className="text-3xl md:text-4xl font-bold">
                      {stat.value}
                    </div>
                    <h3 className="text-base font-semibold">{stat.label}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="relative flex flex-col sm:flex-row justify-between items-center sm:items-end mb-6 sm:mb-8 md:mb-12">
            <div className="absolute inset-0 opacity-10 pointer-events-none hidden lg:block">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,10 Q50,20 100,10"
                  fill="none"
                  stroke="#2E7D32"
                  strokeWidth="0.5"
                  strokeDasharray="3"
                />
              </svg>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center sm:text-left space-y-4 relative z-10"
            >
              <motion.div
                variants={childVariants}
                className="flex items-center justify-center sm:justify-start gap-2"
              >
                <Leaf className="h-6 w-6 text-green-600" />
                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Featured Products
                </h2>
              </motion.div>
              <motion.p
                variants={childVariants}
                className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl"
              >
                Discover our handpicked selection, crafted to inspire and
                delight.{" "}
              </motion.p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative mt-4 sm:mt-0"
            >
              <Button
                asChild
                className="px-6 py-3 rounded-md bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 font-medium text-base flex items-center gap-2 hover:gap-3 hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                aria-label="View all products"
              >
                <Link href="/products">
                  View All
                  <MoveRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </div>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={fetchProducts}
                className="px-6 py-3 bg-green-600 text-white hover:bg-green-700"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Carousel
                className="relative"
                opts={{
                  align: "start",
                  loop: true,
                }}
                aria-roledescription="carousel"
                aria-label="Featured products"
              >
                <CarouselContent className="-mx-3">
                  {isLoading
                    ? Array(4)
                        .fill(0)
                        .map((_, index) => (
                          <CarouselItem
                            key={index}
                            className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 px-3"
                          >
                            <Card className="border dark:bg-gray-800 rounded-lg overflow-hidden">
                              <CardContent className="p-5">
                                <Skeleton className="w-full h-48 rounded-md" />
                                <div className="mt-3 space-y-2">
                                  <Skeleton className="h-6 w-3/4" />
                                  <div className="flex justify-between">
                                    <Skeleton className="h-5 w-1/3" />
                                    <Skeleton className="h-5 w-1/4" />
                                  </div>
                                  <Skeleton className="h-10 w-full" />
                                </div>
                              </CardContent>
                            </Card>
                          </CarouselItem>
                        ))
                    : products.map((product, index) => (
                        <CarouselItem
                          key={product._id}
                          className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 px-3"
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <Card className="border dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg overflow-hidden">
                              <CardContent className="p-5">
                                <div className="relative w-full h-48 rounded-md overflow-hidden group">
                                  <Image
                                    src={
                                      product.images?.[0]?.url ||
                                      "/product_image.png"
                                    }
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-all duration-300 group-hover:scale-105"
                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    loading={index >= 2 ? "lazy" : undefined}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <div className="mt-3 space-y-2">
                                  <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                                    {product.name}
                                  </h3>
                                  <div className="flex justify-between items-center">
                                    <p className="text-lg font-bold text-green-700 dark:text-gray-200">
                                      ₹
                                      {product.variants[0].price.toLocaleString(
                                        "en-IN"
                                      )}
                                    </p>
                                    {product.categories[0] && (
                                      <span className="text-sm text-gray-600 dark:text-gray-300 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                        {product.brand}
                                      </span>
                                    )}
                                  </div>
                                  <Button
                                    asChild
                                    variant="outline"
                                    className="w-full mt-4 text-base text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 hover:bg-green-600 hover:text-white dark:hover:bg-green-600 dark:hover:text-white rounded-md transition-colors duration-300 flex items-center justify-center gap-2"
                                  >
                                    <Link href={`/product-info/${product._id}`}>
                                      <ShoppingBag className="w-4 h-4" />
                                      View Product
                                    </Link>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </CarouselItem>
                      ))}
                </CarouselContent>
                <div className="sm:flex hidden justify-center gap-3 mt-6">
                  <CarouselPrevious
                    className="h-9 w-9 bg-green-600 text-white hover:bg-green-700 rounded-full transition-colors duration-300"
                    aria-label="Previous product"
                  />
                  <CarouselNext
                    className="h-9 w-9 bg-green-600 text-white hover:bg-green-700 rounded-full transition-colors duration-300"
                    aria-label="Next product"
                  />
                </div>
              </Carousel>
              <AnimatePresence>
                {isLoading ? null : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    className="sm:hidden flex justify-center mt-4"
                    aria-live="polite"
                  >
                    <div className="flex items-center gap-2 bg-green-100 text-green-800 text-sm px-4 py-2 rounded-full">
                      <Hand className="h-5 w-5 animate-bounce" />
                      <span>Swipe to Explore More</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
      {/* Brand Story Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-white relative overflow-hidden">
        <div className="absolute top-40 lg:top-64 right-96 w-48 h-48 bg-[url('/leaf-green.png')] bg-cover bg-center opacity-20 z-10 hidden lg:block" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative group"
            >
              <div className="overflow-hidden rounded-2xl shadow-lg max-w-3xl mx-auto">
                <Image
                  src="/product_image.png"
                  alt="Eco-friendly artisan crafting"
                  width={400}
                  height={300}
                  className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105"
                  placeholder="blur"
                  blurDataURL="/product_image.png"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 1100px"
                  loading="lazy"
                />
              </div>
              <div className="absolute bottom-6 left-6 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm bg-opacity-90">
                <div className="text-3xl font-extrabold text-green-700 mb-1">
                  100%
                </div>
                <p className="text-sm text-slate-600 font-medium">
                  Sustainable Materials
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex justify-center items-center"
            >
              <div className="text-center lg:text-left">
                <span className="inline-block bg-green-800/10 text-green-800 px-4 py-3 rounded-full text-xs font-bold uppercase tracking-wide mb-8">
                  Our Story
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-snug tracking-tight mb-8">
                  Where <span className="text-green-700">Purpose</span> Meets
                  Craft
                </h2>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
                  At <strong>EcoTwist</strong>, sustainability isn&apos;t a
                  trend—it’s a mindset. We craft beautiful, intentional gifts
                  from discarded and biodegradable materials, telling stories of
                  care, creativity, and impact.
                </p>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-10">
                  Each product is a collaboration between our in-house designers
                  and skilled artisans, creating livelihoods while helping
                  brands gift meaningfully and consciously.
                </p>
                <Button
                  asChild
                  className="bg-green-700 hover:bg-green-700/10 hover:text-black text-white px-10 py-3 rounded-full text-base font-semibold shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Link href="/about">
                    Learn More
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-6">
              Sustainable Materials We Use
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Each material is carefully selected for its environmental benefits
              and durability.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                name: "Bamboo",
                icon: "🎋",
                description: "Fast-growing, renewable, naturally antibacterial",
                color: "green-700",
              },
              {
                name: "Jute",
                icon: "🌾",
                description: "Biodegradable fiber, strong and versatile",
                color: "ochre",
              },
              {
                name: "Recycled Plastic",
                icon: "♻️",
                description: "Giving plastic waste a second life",
                color: "sky",
              },
              {
                name: "Upcycled Textiles",
                icon: "🧵",
                description:
                  "Transforming fabric waste into beautiful products",
                color: "slate",
              },
            ].map((material, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 text-center border border-slate-100 rounded-xl bg-white/70 backdrop-blur-md hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl mb-4">{material.icon}</div>
                <h3 className="font-heading font-semibold text-lg text-slate-800 mb-2">
                  {material.name}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {material.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-12 md:py-16 lg:py-20 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-xl"
        aria-label="Customer testimonials"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Customers Say
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
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
            aria-label="Customer testimonials"
          >
            <div className="absolute -top-16 right-4 sm:right-8 sm:flex hidden gap-3 z-10">
              <CarouselPrevious
                className="h-9 w-9 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-sm"
                aria-label="Previous testimonial"
              />
              <CarouselNext
                className="h-9 w-9 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-sm"
                aria-label="Next testimonial"
              />
            </div>
            <CarouselContent className="-mx-3">
              {testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={index}
                  className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 px-3 py-2"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="bg-white dark:bg-gray-800 border-none shadow-sm hover:shadow-md transition-shadow duration-200 h-72 ">
                      <CardContent className="p-6 flex flex-col justify-between items-center sm:items-start h-full gap-4">
                        <div className="flex ">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-5 w-5 text-yellow-400 fill-current"
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <p className="text-base text-gray-600 dark:text-gray-300 line-clamp-4 text-center sm:text-left">
                          {testimonial.content}
                        </p>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-base">
                            {testimonial.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {testimonial.role}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </motion.section>
    </div>
  );
}
