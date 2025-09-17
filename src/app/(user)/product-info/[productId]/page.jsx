"use client";

import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { Share2, Heart, LoaderCircle, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import WriteReviewDialog from "@/components/WriteReviewDialog";
import Head from "next/head";
import { addToCart, updateCart } from "@/store/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
  fetchUserProfile,
} from "@/store/slices/userSlice";
import Link from "next/link";
import { fetchProducts } from "@/store/slices/productSlices";

export default function ProductPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { productId } = useParams();
  const {
    byId: productsById,
    allIds,
    status: productStatus,
    error: productError,
  } = useSelector((state) => state.products || {});
  const {
    profile,
    wishlist,
    status: userStatus,
    error: userError,
  } = useSelector((state) => state.user || {});
  const { status: cartStatus, error: cartError } = useSelector(
    (state) => state.cart || {}
  );
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const product = productsById[productId];

  // Fetch products and user profile
  useEffect(() => {
    if (productStatus === "idle") {
      dispatch(fetchProducts());
    }
    const userId = localStorage.getItem("user-id");
    if (userId && userStatus === "idle") {
      dispatch(fetchUserProfile(userId));
    }
  }, [dispatch, productStatus, userStatus]);

  // Initialize variant selections
  useEffect(() => {
    if (product && product.images?.length > 0) {
      setSelectedColor(
        product.options?.find((opt) => opt.name === "Color")?.values[0] || ""
      );
      setSelectedCapacity(
        product.options?.find(
          (opt) => opt.name === "Capacity" || opt.name === "Size"
        )?.values[0] || ""
      );
      setSelectedImage(
        product.images.find((img) => img.isPrimary)?.url ||
          product.images[0].url
      );
    }
  }, [product]);

  // Check wishlist status
  useEffect(() => {
    if (productId && wishlist) {
      setIsWishlisted(wishlist.some((item) => item.productId === productId));
    }
  }, [productId, wishlist]);

  // Handle errors
  useEffect(() => {
    if (productStatus === "failed" && productError) {
      toast.error(productError);
      console.error("Product fetch error:", productError);
    }
    if (userStatus === "failed" && userError) {
      toast.error(userError);
      console.error("User fetch error:", userError);
    }
    if (cartStatus === "failed" && cartError) {
      toast.error(cartError);
      console.error("Cart error:", cartError);
    }
  }, [
    productStatus,
    productError,
    userStatus,
    userError,
    cartStatus,
    cartError,
  ]);

  // Get related products
  const relatedProducts = useMemo(() => {
    if (productStatus !== "succeeded" || !allIds || !product) return [];
    return allIds
      .filter(
        (id) =>
          id !== productId &&
          productsById[id]?.categories?.some((cat) =>
            product.categories?.includes(cat)
          )
      )
      .slice(0, 4)
      .map((id) => productsById[id]);
  }, [allIds, productsById, product, productId]);

  const getSelectedVariant = () => {
    if (!product?.variants) return null;
    const isCapacityProduct = product.options?.some(
      (opt) => opt.name === "Capacity"
    );
    return (
      product.variants.find((variant) => {
        const matchesColor = variant.optionValues?.Color === selectedColor;
        const matchesCapacityOrSize = isCapacityProduct
          ? variant.optionValues?.Capacity === selectedCapacity
          : variant.optionValues?.Size === selectedCapacity;
        return matchesColor && matchesCapacityOrSize;
      }) || product.variants[0]
    );
  };
  const selectedVariant = getSelectedVariant();
  const isAvailable = selectedVariant?.inventory?.quantity > 0;

  const handleAddToCart = () => {
    const userId = localStorage.getItem("user-id");
    if (!userId) {
      if (
        window.confirm(
          "You need to be logged in to add items to the cart. Do you want to login now?"
        )
      ) {
        router.push("/login");
      }
      return;
    }
    if (!selectedVariant) {
      toast.error("Please select a variant");
      return;
    }
    dispatch(
      addToCart({
        userId,
        productId,
        variantSku: selectedVariant.sku,
        quantity,
      })
    )
      .unwrap()
      .then(() => toast.success(`${product.name} added to cart`))
      .catch((err) => toast.error(err || "Failed to add to cart"));
  };

  const handleWishlistToggle = () => {
    const userId = localStorage.getItem("user-id");
    if (!userId) {
      if (
        window.confirm(
          "You need to be logged in to manage your wishlist. Do you want to login now?"
        )
      ) {
        router.push("/login");
      }
      return;
    }
    if (isWishlisted) {
      dispatch(removeFromWishlist({ userId, productId }))
        .unwrap()
        .then(() => {
          setIsWishlisted(false);
          toast.success(`${product.name} removed from wishlist`);
        })
        .catch((err) => toast.error(err || "Failed to remove from wishlist"));
    } else {
      dispatch(addToWishlist({ userId, productId }))
        .unwrap()
        .then(() => {
          setIsWishlisted(true);
          toast.success(`${product.name} added to wishlist`);
        })
        .catch((err) => toast.error(err || "Failed to add to wishlist"));
    }
  };

  const handleQuantityChange = (value) => {
    const parsedValue = parseInt(value);
    if (isNaN(parsedValue) || parsedValue < 1) {
      setQuantity(1);
      return;
    }
    const newQuantity = Math.min(
      parsedValue,
      selectedVariant?.inventory?.quantity || 1
    );
    setQuantity(newQuantity);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Product link copied to clipboard!");
  };

  const sizeOrCapacityOption = product?.options?.find(
    (opt) => opt.name === "Capacity" || opt.name === "Size"
  );

  if (productStatus === "loading" || userStatus === "loading") {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="p-10 space-y-6">
          <div className="flex items-center space-x-2">
            <LoaderCircle className="h-5 w-5 animate-spin text-green-600 dark:text-green-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Fetching product...
            </p>
          </div>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (productStatus === "failed" || !product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900 dark:to-pink-900">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Oops! Something went wrong.
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {productError || "Product not found"}
          </p>
          <Button
            onClick={() => dispatch(fetchProducts())}
            className="bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600"
            aria-label="Retry loading product"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <Head>
        <title>{product.name} | Eco-Friendly Store</title>
        <meta name="description" content={product.description} />
        <meta name="keywords" content={product.tags?.join(", ") || ""} />
      </Head>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        {/* Hero Section */}
        <div className="rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700 shadow-md bg-white/90 dark:bg-gray-800/90 flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
              {product.name}
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
              {product.brand} - {product.bestUse}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {product.tags?.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs sm:text-sm"
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
              className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <Image
                src={selectedImage || "/product_image.png"}
                alt={product.name || "Product image"}
                fill
                className="object-contain transition-transform duration-300"
              />
            </motion.div>
            <div className="flex gap-2 sm:gap-3 justify-start mt-3 sm:mt-4 overflow-x-auto">
              {product.images?.map((img) => (
                <motion.button
                  key={img.position}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-md overflow-hidden border-2 flex-shrink-0 ${
                    selectedImage === img.url
                      ? "border-green-500 dark:border-green-400"
                      : "border-gray-200 dark:border-gray-700"
                  } shadow-sm`}
                  aria-label={`Select image ${img.alt}`}
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
            <Card className="border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 shadow-sm">
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex justify-between items-center gap-2 sm:gap-4">
                  <p className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-200">
                    ₹{selectedVariant?.price || 0}{" "}
                    {selectedVariant?.currency || "INR"}
                  </p>
                  <Button
                    variant="outline"
                    className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 cursor-pointer flex-shrink-0"
                    onClick={handleShare}
                    aria-label="Share product"
                  >
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>

                {/* Variant Selection */}
                {product.options?.find((opt) => opt.name === "Color") && (
                  <div>
                    <Label className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Color
                    </Label>
                    <RadioGroup
                      value={selectedColor}
                      onValueChange={setSelectedColor}
                      className="flex gap-3 sm:gap-4 mt-2 flex-wrap"
                    >
                      {product.options
                        .find((opt) => opt.name === "Color")
                        ?.values.map((color) => (
                          <motion.div
                            key={color}
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={color}
                              id={color}
                              className="text-gray-600 dark:text-gray-300"
                            />
                            <Label
                              htmlFor={color}
                              className="text-gray-700 dark:text-gray-300 text-sm sm:text-base"
                            >
                              {color}
                            </Label>
                          </motion.div>
                        ))}
                    </RadioGroup>
                  </div>
                )}

                {sizeOrCapacityOption && (
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {sizeOrCapacityOption.name}
                      </Label>
                      {sizeOrCapacityOption.name === "Capacity" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="link"
                              className="text-gray-600 dark:text-gray-400 text-sm sm:text-base"
                            >
                              View Size Guide
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="border-gray-200 dark:border-gray-700 sm:max-w-md bg-white dark:bg-gray-800">
                            <DialogHeader>
                              <DialogTitle>Size Guide</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                              <p>
                                <strong>500ml:</strong> Ideal for short trips or
                                daily commutes.
                              </p>
                              <p>
                                <strong>750ml:</strong> Perfect for all-day
                                hydration or workouts.
                              </p>
                              <p>
                                <strong>1L:</strong> Best for long hikes or
                                shared use.
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
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
                      {sizeOrCapacityOption.values.map((value) => (
                        <motion.div
                          key={value}
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={value}
                            id={value}
                            className="text-gray-600 dark:text-gray-300"
                          />
                          <Label
                            htmlFor={value}
                            className="text-gray-700 dark:text-gray-300 text-sm sm:text-base"
                          >
                            {value}
                          </Label>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                <div>
                  <Label className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Quantity
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="border-gray-300 dark:border-gray-600 flex-shrink-0"
                      aria-label="Decrease quantity"
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value))
                      }
                      className="w-16 sm:w-20 text-center border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                      min="1"
                      max={selectedVariant?.inventory?.quantity || 1}
                      aria-label="Quantity"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={
                        quantity >= (selectedVariant?.inventory?.quantity || 1)
                      }
                      className="border-gray-300 dark:border-gray-600 flex-shrink-0"
                      aria-label="Increase quantity"
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
                      className="w-full bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600"
                      disabled={!isAvailable}
                      size="lg"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
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
                      className={`border-gray-300 dark:border-gray-600 transition-colors duration-200 ${
                        isWishlisted
                          ? "text-red-500 border-red-300 dark:border-red-400"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                      aria-label={
                        isWishlisted
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      <Heart
                        className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200 ${
                          isWishlisted ? "fill-red-500" : ""
                        }`}
                      />
                    </Button>
                  </motion.div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isAvailable ? "In Stock" : "Out of Stock"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Description and Tabs */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <Card className="border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                {product.description}
              </p>
            </CardContent>
          </Card>
          <Tabs defaultValue="benefits" className="mt-6 sm:mt-8">
            <TabsList className="bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-wrap justify-start sm:justify-center overflow-x-auto p-1">
              <TabsTrigger
                value="benefits"
                className="data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-600 text-sm sm:text-base text-gray-900 dark:text-gray-100"
              >
                Benefits
              </TabsTrigger>
              <TabsTrigger
                value="usage"
                className="data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-600 text-sm sm:text-base text-gray-900 dark:text-gray-100"
              >
                Usage
              </TabsTrigger>
              <TabsTrigger
                value="faqs"
                className="data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-600 text-sm sm:text-base text-gray-900 dark:text-gray-100"
              >
                FAQs
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-600 text-sm sm:text-base text-gray-900 dark:text-gray-100"
              >
                Reviews
              </TabsTrigger>
            </TabsList>
            <TabsContent value="benefits">
              <Card className="border-gray-200 dark:border-gray-700 mt-4 shadow-sm bg-white/90 dark:bg-gray-800/90">
                <CardContent className="p-4 sm:p-6">
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    {product.benefits?.map((benefit, index) => (
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
              <Card className="border-gray-200 dark:border-gray-700 mt-4 shadow-sm bg-white/90 dark:bg-gray-800/90">
                <CardContent className="p-4 sm:p-6">
                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    {product.usage}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm sm:text-base">
                    {product.bestUse}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="faqs">
              <Card className="border-gray-200 dark:border-gray-700 mt-4 shadow-sm bg-white/90 dark:bg-gray-800/90">
                <CardContent className="p-4 sm:p-6">
                  <Accordion type="single" collapsible>
                    {product.faqs?.map((faq, index) => (
                      <AccordionItem key={index} value={`faq-${index}`}>
                        <AccordionTrigger className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews">
              <Card className="border-gray-200 dark:border-gray-700 mt-4 shadow-sm bg-white/90 dark:bg-gray-800/90">
                <CardContent className="p-4 sm:p-6">
                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
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
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-10 lg:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
              You May Also Like
            </h2>
            <Carousel className="w-full relative">
              <CarouselContent className="-ml-2 sm:-ml-4">
                {relatedProducts.map((related) => (
                  <CarouselItem
                    key={related._id}
                    className="pl-2 sm:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <Card className="border-gray-200 dark:border-gray-700 shadow-sm bg-white/90 dark:bg-gray-800/90">
                      <CardContent className="p-3 sm:p-4">
                        <div className="relative w-full h-40 sm:h-48 rounded-md overflow-hidden">
                          <Image
                            src={
                              related.images?.find((img) => img.isPrimary)
                                ?.url ||
                              related.images?.[0]?.url ||
                              "/product_image.png"
                            }
                            alt={related.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h3 className="mt-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {related.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                          ₹
                          {Math.min(
                            ...(related.variants?.map((v) => v.price || 0) || [
                              0,
                            ])
                          )}
                        </p>
                        <Button
                          asChild
                          variant="outline"
                          className="mt-2 w-full border-gray-500 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm sm:text-base"
                        >
                          <Link
                            href={`/products/${related._id}`}
                            aria-label={`View ${related.name}`}
                          >
                            View Product
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {/* <CarouselPrevious className="bg-gray-200 dark:bg-gray-700" />
              <CarouselNext className="bg-gray-200 dark:bg-gray-700" /> */}
              <div className="absolute left-1/2 -bottom-10 flex gap-2">
                <CarouselPrevious className="h-8 w-8 sm:h-10 sm:w-10 bg-green-800 text-white  transition-colors duration-300" />
                <CarouselNext className="h-8 w-8 sm:h-10 sm:w-10 bg-green-800 text-white  transition-colors duration-300" />
              </div>
            </Carousel>
          </div>
        )}
      </motion.div>
    </div>
  );
}
