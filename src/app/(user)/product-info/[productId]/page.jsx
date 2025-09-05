"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation"; // Next.js 13+ App Router

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2, Heart, LoaderCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import WriteReviewDialog from "@/components/WriteReviewDialog";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

// Mock related products data
const relatedProducts = [
  {
    id: 1,
    name: "EcoSip Bamboo Straw",
    price: 9.99,
    image: "/products/straw.png",
    slug: "eco-sip-bamboo-straw",
  },
  {
    id: 2,
    name: "grayLeaf Travel Mug",
    price: 24.99,
    image: "/products/mug.png",
    slug: "grayleaf-travel-mug",
  },
  {
    id: 3,
    name: "Bamboo Cutlery Set",
    price: 14.99,
    image: "/products/cutlery.png",
    slug: "bamboo-cutlery-set",
  },
];

export default function ProductPage() {
  const [product, setProduct] = useState(null);
  const { productId } = useParams();
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  // const [isZoomed, setIsZoomed] = useState(false);
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (product) {
      setSelectedColor(product.options[0].values[0]);
      setSelectedCapacity(product.options[1].values[0]);
      setSelectedImage(product.images.find((img) => img.isPrimary).url);
    }
  }, [product]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        setProduct(data.data);
        console.log(data.data);
      } catch (error) {
        console.error("Failed to load product:", error);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (!product) {
    return (
      <div className="p-10 space-y-6">
        <div className="flex items-center space-x-2">
          <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Fetching product...</p>
        </div>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      const shouldLogin = window.confirm(
        "You need to be logged in to add items to the cart. Do you want to login now?"
      );
      if (shouldLogin) {
        router.push("/login");
      }
      return;
    }

    const productId = product._id;
    const variantSku = selectedVariant.sku;
    const quantity = 1; // Default quantity to 1, can be customized

    // Pass the required data to addToCart
    addToCart(productId, variantSku, quantity);
    // toast({
    //   title: "Added to Cart",
    //   description: `${product.name} has been added to your cart.`,
    // });
  };

  const getSelectedVariant = () => {
    const isCapacityProduct = product.options.some(
      (opt) => opt.name === "Capacity"
    );

    return (
      product.variants.find((variant) => {
        const matchesColor = variant.optionValues.Color === selectedColor;
        const matchesCapacityOrSize = isCapacityProduct
          ? variant.optionValues.Capacity === selectedCapacity
          : variant.optionValues.Size === selectedCapacity;

        return matchesColor && matchesCapacityOrSize;
      }) || product.variants[0]
    );
  };
  const selectedVariant = getSelectedVariant();
  const isAvailable = selectedVariant.inventory.quantity > 0;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "The product link has been copied to your clipboard.",
    });
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: `${product.name} has been ${
        isWishlisted ? "removed from" : "added to"
      } your wishlist.`,
    });
  };

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(
      1,
      Math.min(selectedVariant.inventory.quantity, value)
    );
    setQuantity(newQuantity);
  };

  const sizeOrCapacityOption = product.options.find(
    (opt) => opt.name === "Capacity" || opt.name === "Size"
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28    min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        {/* Hero Section */}
        <div className=" rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-200 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-7xl lg:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">
              {product.name}
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              {product.brand} - {product.bestUse}
            </p>
          </div>
          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            {product.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-gray-200 text-gray-900 text-xs sm:text-sm"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Image Section */}
          <div className="lg:col-span-2">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden shadow-md border border-gray-200 bg-white"
            >
              <Image
                src={selectedImage }
                alt={product.name}
                fill
                className="object-contain transition-transform duration-300"
                style={{ transformOrigin: "center" }}
              />
            </motion.div>
            <div className="flex gap-2 sm:gap-3 justify-start mt-3 sm:mt-4 overflow-x-auto">
              {product.images.map((img) => (
                <motion.button
                  key={img.position}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-md overflow-hidden border-2 flex-shrink-0 ${
                    selectedImage === img.url
                      ? "border-gray-500"
                      : "border-gray-200"
                  } shadow-sm`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sidebar: Product Actions */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="border-gray-200 bg-white/90 shadow-sm">
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex justify-between items-center gap-2 sm:gap-4">
                  <p className="text-xl sm:text-2xl font-semibold text-gray-700">
                    ₹{selectedVariant.price} {selectedVariant.currency}
                  </p>
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-600 cursor-pointer flex-shrink-0"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>

                {/* Variant Selection */}
                <div>
                  <Label className="text-base sm:text-lg font-semibold text-gray-900">
                    Color
                  </Label>
                  <RadioGroup
                    value={selectedColor}
                    onValueChange={setSelectedColor}
                    className="flex gap-3 sm:gap-4 mt-2 flex-wrap"
                  >
                    {product.options
                      .find((opt) => opt.name === "Color")
                      .values.map((color) => (
                        <motion.div
                          key={color}
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={color}
                            id={color}
                            className="text-gray-600"
                          />
                          <Label
                            htmlFor={color}
                            className="text-gray-700 text-sm sm:text-base"
                          >
                            {color}
                          </Label>
                        </motion.div>
                      ))}
                  </RadioGroup>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-base sm:text-lg font-semibold text-gray-900">
                      {sizeOrCapacityOption.name}
                    </Label>
                    {sizeOrCapacityOption.name === "Capacity" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="link"
                            className="text-gray-600 text-sm sm:text-base"
                          >
                            View Size Guide
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="border-gray-200 sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Size Guide</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                            <p>
                              <strong>500ml:</strong> Ideal for short trips or
                              daily commutes.
                            </p>
                            <p>
                              <strong>750ml:</strong> Perfect for all-day
                              hydration or workouts.
                            </p>
                            <p>
                              <strong>1L:</strong> Best for long hikes or shared
                              use.
                            </p>
                            <p className="text-sm text-gray-600">
                              Choose based on your hydration needs!
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  <RadioGroup
                    value={selectedCapacity}
                    onValueChange={setSelectedCapacity}
                    className="flex gap-3 sm:gap-4 mt-2 flex-wrap"
                  >
                    {sizeOrCapacityOption?.values.map((value) => (
                      <motion.div
                        key={value}
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={value}
                          id={value}
                          className="text-gray-600"
                        />
                        <Label
                          htmlFor={value}
                          className="text-gray-700 text-sm sm:text-base"
                        >
                          {value}
                        </Label>
                      </motion.div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base sm:text-lg font-semibold text-gray-900">
                    Quantity
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="border-gray-300 flex-shrink-0"
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value))
                      }
                      className="w-16 sm:w-20 text-center border-gray-300"
                      min="1"
                      max={selectedVariant.inventory.quantity}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= selectedVariant.inventory.quantity}
                      className="border-gray-300 flex-shrink-0"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-md">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                    onClick={handleAddToCart}
                      className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 cursor-pointer text-white"
                      disabled={!isAvailable}
                      size="lg"
                    >
                      Add to Cart
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleWishlistToggle}
                      className={`border-gray-300 transition-colors duration-200 cursor-pointer ${
                        isWishlisted
                          ? "text-red-500 border-red-300"
                          : "text-gray-600"
                      }`}
                      aria-label="Toggle wishlist"
                    >
                      <Heart
                        className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200 ${
                          isWishlisted ? "fill-red-500" : ""
                        }`}
                      />
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {product.subscriptionOffer.enabled && (
              <Card className="border-gray-200 bg-gray-50 shadow-sm">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg text-gray-900">
                    Subscription Offer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <p className="text-gray-700 text-sm sm:text-base">
                    Save {product.subscriptionOffer.firstOrderDiscountPct}% on
                    your first order and{" "}
                    {product.subscriptionOffer.recurringDiscountPct}% on
                    recurring orders.
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base">
                    Delivered every {product.subscriptionOffer.interval.count}{" "}
                    {product.subscriptionOffer.interval.unit}s. Cancel anytime.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2 sm:mt-4 border-gray-500 text-gray-600 w-full sm:w-auto"
                  >
                    Subscribe Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Description and Tabs */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <Card className="border-gray-200 bg-white/90 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {product.description}
              </p>
            </CardContent>
          </Card>
          <Tabs defaultValue="benefits" className="mt-6 sm:mt-8">
            <TabsList className="bg-gray-100 rounded-lg flex flex-wrap justify-start sm:justify-center overflow-x-auto p-1">
              <TabsTrigger
                value="benefits"
                className="data-[state=active]:bg-gray-200 text-sm sm:text-base "
              >
                Benefits
              </TabsTrigger>
              <TabsTrigger
                value="usage"
                className="data-[state=active]:bg-gray-200 text-sm sm:text-base"
              >
                Usage
              </TabsTrigger>
              <TabsTrigger
                value="faqs"
                className="data-[state=active]:bg-gray-200 text-sm sm:text-base"
              >
                FAQs
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:bg-gray-200 text-sm sm:text-base"
              >
                Reviews
              </TabsTrigger>
            </TabsList>
            <TabsContent value="benefits">
              <Card className="border-gray-200 mt-4 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm sm:text-base">
                    {product.benefits.map((benefit, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {benefit}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="usage">
              <Card className="border-gray-200 mt-4 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <p className="text-gray-700 text-sm sm:text-base">
                    {product.usage}
                  </p>
                  <p className="text-gray-700 mt-2 text-sm sm:text-base">
                    {product.bestUse}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="faqs">
              <Card className="border-gray-200 mt-4 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <Accordion type="single" collapsible>
                    {product.faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`faq-${index}`}>
                        <AccordionTrigger className="text-gray-900 text-sm sm:text-base">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 text-sm sm:text-base">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews">
              <Card className="border-gray-200 mt-4 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <p className="text-gray-700 text-sm sm:text-base">
                    No reviews yet. Be the first to share your experience with
                    the {product.name}!
                  </p>
                  <WriteReviewDialog />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            You May Also Like
          </h2>
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 sm:-ml-4">
              {relatedProducts.map((related) => (
                <CarouselItem
                  key={related.id}
                  className="pl-2 sm:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <Card className="border-gray-200 shadow-sm">
                    <CardContent className="p-3 sm:p-4">
                      <div className="relative w-full h-40 sm:h-48 rounded-md overflow-hidden">
                        <Image
                          src={related.image}
                          alt={related.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h3 className="mt-2 text-base sm:text-lg font-semibold text-gray-900">
                        {related.name}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        ₹{related.price}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-2 w-full border-gray-500 text-gray-600 text-sm sm:text-base"
                      >
                        View Product
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </motion.div>
    </div>
  );
}
