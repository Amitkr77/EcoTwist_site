"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "@/store/slices/userSlice";
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";

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
  const [isLoading, setIsLoading] = useState(null);
  const {
    status: userStatus,
    error: userError,
    profile,
  } = useSelector((state) => state.user);

  useEffect(() => {
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
    fetchProducts();
  }, []);

  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userId = decoded?.userId || decoded?.id || decoded?.sub;
        if (userId) {
          dispatch(fetchUserProfile(userId));
        } else {
          console.error("User ID not found in token");
          // toast({
          //   title: "Error",
          //   description: "Invalid user token. Please log in again.",
          //   variant: "destructive",
          // });
        }
      } catch (error) {
        console.error("Invalid token", error);
        // toast({
        //   title: "Error",
        //   description: "Invalid token. Please log in again.",
        //   variant: "destructive",
        // });
      }
    }
  }, [dispatch]);

  const testimonials = [
    {
      name: "Priya sharma",
      company: "TechCorp Inc.",
      rating: 5,
      comment:
        "EcoTwist's sustainable products and responsive support made our event a hit. Highly recommend!",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b0bd?auto=format&fit=crop&w=100&q=80",
    },
    {
      name: "Rahul verma",
      company: "GreenStart",
      rating: 5,
      comment:
        "The custom branding options were fantastic. Quick response and eco-friendly packaging!",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
    },
    {
      name: "Anita Desai",
      company: "EcoFlow Solutions",
      rating: 5,
      comment:
        "Partnering with EcoTwist was seamless. Their commitment to sustainability is inspiring.",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative z-10 text-gray-800 py-20 sm:py-12 lg:py-15 overflow-hidden flex flex-col lg:flex-row items-center bg-gradient-to-br from-white via-teal-50 to-white">
        {/* Decorative SVG Line */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
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

        {/* Image Block */}
        <div className="relative w-full lg:w-1/2 h-72 sm:h-80 md:h-96 lg:h-[650px] sm:mt-16 mt-0">
          <div className="relative w-full h-full">
            <Image
              src="./new_hero1.png"
              alt="Eco-Friendly Gifts"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain object-center transition-opacity duration-300 hover:opacity-95"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-white/60" />
          </div>
        </div>

        {/* Content Block */}
        <div className="relative z-10 w-full lg:w-1/2 px-4 sm:px-6 lg:px-12 flex items-center justify-center sm:mt-16 mt-0 ">
          <div className="w-full max-w-3xl bg-white/95 p-6 sm:p-8 lg:p-12 rounded-xl border border-teal-100 shadow-md transition-transform duration-300 hover:shadow-lg lg:-rotate-1 lg:hover:rotate-0">
            {/* Badge */}
            <span className="inline-block bg-teal-100 px-3 py-1 rounded-full text-xs uppercase tracking-wide font-semibold text-teal-800">
              🌿 Eco Elite Gifting
            </span>

            {/* Heading */}
            <h1 className="mt-6 font-sans text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight text-gray-800 group">
              <span className="group-hover:text-teal-600 group-hover:scale-105 transition-all duration-300 ">
                Elevate
              </span>{" "}
              <span className=" group-hover:scale-105 transition-all duration-300">
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

            {/* Subheading */}
            <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-600 font-light leading-tight max-w-xl">
              Transform your brand with exclusive, upcycled gifts. Sustainable,
              chic, and ready to impress—act today!
            </p>

            {/* Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="px-5 py-3 text-sm sm:text-base font-medium bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors duration-300 rounded-lg"
              >
                <Link href="/products">Discover Gifts</Link>
              </Button>
              <Button
                asChild
                className="px-5 py-3 text-sm sm:text-base font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors duration-300 rounded-lg"
              >
                <Link href="/about">Our Story</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 lg:py-10 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
              Why Choose EcoTwist?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-xl sm:max-w-2xl mx-auto">
              We combine sustainability with premium quality to deliver gifts
              that make a lasting impression.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 px-0 sm:px-4 lg:px-8 py-8 sm:py-10 lg:py-12 bg-white">
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
              <Card
                key={index}
                className="glass-card text-center group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-xl border border-slate-100 bg-white/70 backdrop-blur-md"
              >
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div
                    className={`h-12 w-12 sm:h-14 sm:w-14 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center bg-gradient-to-r ${feature.gradient}`}
                  >
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="font-heading font-semibold text-base sm:text-lg text-slate-800 mb-2 group-hover:text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-200">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-full sm:max-w-3xl md:max-w-5xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Our{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                Impact
              </span>{" "}
              in Action
            </h2>
            <p className="mt-2 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-md sm:max-w-lg md:max-w-xl mx-auto">
              Driving sustainability and community growth with every step we
              take.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Card
                  className={`flex flex-col items-center justify-center text-center p-10 rounded-full 
                    02 ${stat.color} border-none shadow-sm hover:shadow-md transition-shadow duration-300`}
                  aria-label={`${stat.label}: ${stat.value}`}
                >
                  <CardContent className="flex flex-col items-center justify-center p-0 space-y-3">
                    <div className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white dark:bg-gray-800">
                      {stat.icon}
                    </div>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold">
                      {stat.value}
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold">
                      {stat.label}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-8 sm:mt-10 md:mt-12 flex items-center"
          >
            <Button
              asChild
              className="px-4 sm:px-6 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 font-medium text-sm sm:text-base flex items-center gap-2 hover:gap-3 transition-all duration-300 mx-auto"
            >
              <Link href="/about">
                Learn More
                <MoveRight className="w-4 sm:w-5 h-4 sm:h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 sm:py-12 md:py-16 bg-white dark:bg-gray-900">
        <div className="max-w-full sm:max-w-3xl md:max-w-5xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading and CTA */}
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-6 sm:mb-8 md:mb-10">
            <div className="text-center sm:text-left space-y-2">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
              >
                Featured Products
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-md sm:max-w-lg"
              >
                Discover our handpicked selection, crafted to inspire and
                delight.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-4 sm:mt-0"
            >
              <Button
                asChild
                className="px-4 sm:px-6 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium text-sm sm:text-base flex items-center gap-2 hover:gap-3 transition-all duration-300"
              >
                <Link href="/products">
                  View All
                  <MoveRight className="w-4 sm:w-5 h-4 sm:h-5" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Product Carousel */}
          <Carousel
            className="relative"
            opts={{
              align: "start",
              loop: true,
            }}
            aria-roledescription="carousel"
            aria-label="Featured products"
          >
            <CarouselContent className="-mx-2 sm:-mx-3">
              {products.map((product, index) => (
                <CarouselItem
                  key={product._id}
                  className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 px-2 sm:px-3"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="border dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg overflow-hidden">
                      <CardContent className="p-4 sm:p-5">
                        <div className="relative w-full h-40 sm:h-48 md:h-52 rounded-md overflow-hidden group">
                          <Image
                            src={
                              product.images?.[0]?.url || "/product_image.png"
                            }
                            alt={product.name}
                            fill
                            className="object-cover transition-all duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            priority={index < 2}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="mt-3 space-y-2">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                            {product.name}
                          </h3>
                          <div className="flex justify-between items-center">
                            <p className="text-base sm:text-lg font-bold text-green-700 dark:text-gray-200">
                              ₹
                              {product.variants[0].price.toLocaleString(
                                "en-IN"
                              )}
                            </p>
                            {product.categories[0] && (
                              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                {product.brand}
                              </span>
                            )}
                          </div>
                          <Button
                            asChild
                            variant="outline"
                            className="w-full mt-4 text-sm sm:text-base text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 hover:bg-green-600 hover:text-white dark:hover:bg-green-600 dark:hover:text-white rounded-md transition-colors duration-300 flex items-center justify-center gap-2"
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
            <div className="sm:flex hidden justify-center gap-2 mt-4 sm:mt-6  ">
              <CarouselPrevious
                className="h-8 w-8 sm:h-9 sm:w-9 bg-green-600 text-white hover:bg-green-700 rounded-full transition-colors duration-300"
                aria-label="Previous product"
              />
              <CarouselNext
                className="h-8 w-8 sm:h-9 sm:w-9 bg-green-600 text-white hover:bg-green-700 rounded-full transition-colors duration-300"
                aria-label="Next product"
              />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-8 sm:py-12 lg:py-16 relative bg-white overflow-hidden">
        {/* Decorative SVG Leaf Outlines */}
        <div className="absolute top-32 sm:top-40 lg:top-64 right-4 sm:right-16 lg:right-[28rem] w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-[url('/leaf-green.png')] bg-cover bg-center opacity-30 z-10 hidden sm:block" />

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
            {/* Image + Stat */}
            <div className="relative group">
              <div className="overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl max-w-3xl mx-auto">
                <Image
                  src="/product_image.png"
                  alt="Eco-friendly artisan crafting"
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  placeholder="blur"
                  blurDataURL="/product_image.png"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 1100px"
                />
              </div>
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-white border border-slate-200 px-4 sm:px-6 py-2 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg backdrop-blur-sm bg-opacity-90 animate-fade-in-up">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-forest mb-1">
                  100%
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Sustainable Materials
                </p>
              </div>
            </div>

            {/* Text Content */}
            <div className="flex justify-center items-center">
              <div className="text-center lg:text-left">
                <span className="inline-block bg-green-800/10 text-green-800 px-3 sm:px-4 py-2 sm:py-3 rounded-full text-xs font-bold uppercase tracking-wide mb-6 sm:mb-8 lg:mb-10">
                  Our Story
                </span>

                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-6 sm:mb-8 lg:mb-12">
                  Where <span className="text-forest">Purpose</span> Meets Craft
                </h2>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6 sm:mb-8 lg:mb-10">
                  At <strong>EcoTwist</strong>, sustainability isn&apos;t a
                  trend — it’s a mindset. We craft beautiful, intentional gifts
                  from discarded and biodegradable materials, telling stories of
                  care, creativity, and impact.
                </p>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 sm:mb-10 lg:mb-16">
                  Each product is a collaboration between our in-house designers
                  and skilled artisans, creating livelihoods while helping
                  brands gift meaningfully and consciously.
                </p>

                <Button
                  asChild
                  className="bg-forest hover:bg-green-700/10 text-black px-6 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-base font-semibold shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Link href="/about">
                    Learn More
                    <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              Sustainable Materials We Use
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Each material is carefully selected for its environmental benefits
              and durability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Bamboo",
                icon: "🎋",
                description: "Fast-growing, renewable, naturally antibacterial",
                color: "forest",
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
              <div
                key={index}
                className="eco-card p-6 text-center animate-fade-in"
              >
                <div className="text-4xl mb-4">{material.icon}</div>
                <h3 className="font-heading font-semibold text-lg text-slate-800 mb-2">
                  {material.name}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {material.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
              What Our Customers Say
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-md sm:max-w-lg lg:max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us for their
              corporate gifting needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-0 sm:px-4 lg:px-10">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="glass-card">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center mb-3 sm:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3 sm:h-4 w-3 sm:w-4 text-green-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4 italic">
                    &quot;{testimonial.comment}&quot;
                  </p>
                  <div className="flex items-center">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-2 sm:mr-3 object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-slate-800">
                        {testimonial.name}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
