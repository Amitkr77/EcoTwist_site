"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Share2, Heart, LoaderCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import WriteReviewDialog from "@/components/WriteReviewDialog";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "next/navigation";
import Link from "next/link";
import Head from "next/head";

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

  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (product && product.images?.length > 0) {
      setSelectedColor(product.options[0].values[0]);
      setSelectedCapacity(product.options[1].values[0]);
      setSelectedImage(
        product.images.find((img) => img.isPrimary)?.url ||
          product.images[0].url
      );
    }
  }, [product]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data.data);
      } catch (error) {
        console.error("Failed to load product:", error);
      }
    }
    if (productId) fetchProduct();
  }, [productId]);

  if (!product) {
    return (
      <div className="p-10 space-y-6">
        <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const selectedVariant =
    product.variants.find(
      (variant) =>
        variant.optionValues.Color === selectedColor &&
        (variant.optionValues.Capacity === selectedCapacity ||
          variant.optionValues.Size === selectedCapacity)
    ) || product.variants[0];
  const isAvailable = selectedVariant.inventory.quantity > 0;

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast({
        title: "Login required",
        description: "Please login to add items to cart.",
      });
      return;
    }
    addToCart(product._id, selectedVariant.sku, quantity);
    toast({
      title: "Added to Cart",
      description: `${product.name} added to cart.`,
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <Head>
        <title>{product.name} | EcoStore</title>
      </Head>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Images */}
        <div>
          <div className="relative w-full h-[350px] sm:h-[450px] lg:h-[500px] rounded-lg overflow-hidden border">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>
          <div className="flex gap-3 mt-4 overflow-x-auto">
            {product.images.map((img) => (
              <button
                key={img.position}
                onClick={() => setSelectedImage(img.url)}
                className={`relative w-20 h-20 rounded border ${
                  selectedImage === img.url
                    ? "border-gray-700"
                    : "border-gray-200"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-600">
              {product.brand} · {product.bestUse}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.tags.map((tag, i) => (
                <Badge key={i} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <p className="text-2xl font-semibold">
            ₹{selectedVariant.price} {selectedVariant.currency}
          </p>

          {/* Options */}
          <div>
            <Label>Color</Label>
            <RadioGroup
              value={selectedColor}
              onValueChange={setSelectedColor}
              className="flex gap-4 mt-2"
            >
              {product.options
                .find((o) => o.name === "Color")
                .values.map((color) => (
                  <div key={color} className="flex items-center gap-2">
                    <RadioGroupItem value={color} id={color} />
                    <Label htmlFor={color}>{color}</Label>
                  </div>
                ))}
            </RadioGroup>
          </div>

          <div>
            <Label>Size / Capacity</Label>
            <RadioGroup
              value={selectedCapacity}
              onValueChange={setSelectedCapacity}
              className="flex gap-4 mt-2"
            >
              {product.options
                .find((o) => o.name === "Capacity" || o.name === "Size")
                .values.map((value) => (
                  <div key={value} className="flex items-center gap-2">
                    <RadioGroupItem value={value} id={value} />
                    <Label htmlFor={value}>{value}</Label>
                  </div>
                ))}
            </RadioGroup>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <Label>Quantity</Label>
            <Input
              type="number"
              value={quantity}
              min={1}
              max={selectedVariant.inventory.quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value)))
              }
              className="w-20 text-center"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className="flex-1 bg-green-700 text-white"
            >
              Add to Cart
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsWishlisted(!isWishlisted)}
            >
              <Heart
                className={`w-5 h-5 ${
                  isWishlisted ? "text-red-500 fill-red-500" : ""
                }`}
              />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: "Link copied!",
                  description:
                    "Product link has been copied to your clipboard.",
                  duration: 5000,
                });
              }}
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="description" className="mt-12">
        <TabsList className="flex flex-wrap gap-3 bg-gray-100 p-2 rounded">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4">
          {product.description}
        </TabsContent>
        <TabsContent value="benefits" className="mt-4">
          <ul className="list-disc pl-5 space-y-1">
            {product.benefits.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="usage" className="mt-4">
          {product.usage}
        </TabsContent>
        <TabsContent value="faqs" className="mt-4">
          <Accordion type="single" collapsible>
            {product.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
        <TabsContent value="reviews" className="mt-4">
          <WriteReviewDialog />
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">You May Also Like</h2>
        <Carousel>
          <CarouselContent>
            {relatedProducts.map((p) => (
              <CarouselItem
                key={p.id}
                className="basis-1/2 md:basis-1/3 lg:basis-1/4 p-2"
              >
                <Card>
                  <CardContent className="p-3">
                    <div className="relative w-full h-40 rounded overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="mt-2 font-semibold">{p.name}</h3>
                    <p className="text-gray-600">₹{p.price}</p>
                    <Button asChild variant="outline" className="w-full mt-2">
                      <Link href={`/product/${p.id}`}>View</Link>
                    </Button>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
