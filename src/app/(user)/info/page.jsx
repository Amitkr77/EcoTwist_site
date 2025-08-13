import { Separator } from "@/components/ui/separator";
import React from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star } from "lucide-react";
import Image from "next/image";

// Placeholder images (replace with actual image URLs)
const productImages = [
  "/products/bottle/bottle_1.png",
  "/products/bottle/bottle_2.png",
  "/products/bottle/bottle_3.png",
   "/products/bottle/bottle_1.png",
  "/products/bottle/bottle_2.png",
  "/products/bottle/bottle_3.png",
];

export default function Page() {
  // Sample data for the product
  const product = {
    name: "Ecotwist Bamboo Water Bottle",
    rating: 4.5,
    reviews: 120,
    bestUse: "Perfect for daily hydration, outdoor adventures, and eco-conscious living.",
    variants: [
      { id: 1, color: "Natural Bamboo", price: 29.99 },
      { id: 2, color: "Charcoal Black", price: 31.99 },
      { id: 3, color: "Olive Green", price: 31.99 },
    ],
    packSizes: ["500ml", "750ml", "1L"],
    subscribePrice: 20.99, // 30% off from 29.99
    oneTimePrice: 29.99,
  };

  // Sample customer reviews for carousel
  const reviews = [
    { id: 1, name: "Priya S.", text: "Love the sustainability! Keeps water cold for hours.", rating: 5 },
    { id: 2, name: "Amit K.", text: "Great design, but the cap could be tighter.", rating: 4 },
    { id: 3, name: "Sneha R.", text: "Eco-friendly and stylish—highly recommend!", rating: 5 },
  ];

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Images Grid */}
        <div className="grid grid-cols-2 gap-4  p-4">
          {productImages.map((src, index) => (
            <div key={index} className="relative w-full h-80 bg-gray-200 rounded-lg overflow-hidden ">
              <Image src={src} alt={`Bottle image ${index + 1}`} layout="fill" objectFit="cover" />
            </div>
          ))}
        </div>

        {/* Product Content */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          <div className="flex items-center space-x-2">
            {/* Rating with Stars */}
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
              />
            ))}
            <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
          </div>
          <p className="text-gray-600 italic">Best use for: {product.bestUse}</p>

          {/* Product Variants */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-700">Choose Your Variant</h2>
            <div className="flex space-x-4">
              {product.variants.map((variant) => (
                <Button
                  key={variant.id}
                  variant={variant.color === "Natural Bamboo" ? "default" : "outline"}
                  className="text-sm"
                >
                  {variant.color} (${variant.price})
                </Button>
              ))}
            </div>
          </div>

          {/* Pack Sizes */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-700">Pack Sizes</h2>
            <div className="flex space-x-4">
              {product.packSizes.map((size) => (
                <Button key={size} variant="outline" className="text-sm">
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Delivery Options */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-700">Pick a Delivery Option:</h2>
            <p className="text-green-600 font-bold">Subscribe & Save 30%</p>
            <div>
              <p className="text-gray-700">Subscribe & Save 30%</p>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                <li>30% OFF 1st Order</li>
                <li>20% OFF Recurring</li>
                <li>Shipping Insured</li>
                <li>Ships Every 30 Days</li>
                <li>Lowest Price</li>
                <li>Cancel Any Time</li>
              </ul>
            </div>
            <div className="mt-2">
              <p className="text-gray-700">Try Once: ${product.oneTimePrice}</p>
            </div>
            <Button className="w-full bg-teal-500 text-white hover:bg-teal-600 mt-4">
              Add to Cart
            </Button>
          </div>

          {/* Accordion for Additional Sections */}
          <div className="space-y-2">
            <Accordion type="single" collapsible>
              <AccordionItem value="description">
                <AccordionTrigger>Product Description</AccordionTrigger>
                <AccordionContent>
                  The Ecotwist Bamboo Water Bottle is crafted from 100% sustainable bamboo, offering a natural and eco-friendly alternative to plastic bottles. Designed by Ecotwist, a leader in green innovation, this bottle combines style with functionality, keeping your beverages fresh while reducing environmental impact.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="usage">
                <AccordionTrigger>How to Use</AccordionTrigger>
                <AccordionContent>
                  Simply fill with water or your favorite beverage, seal the cap tightly, and carry it with you. Hand wash with mild soap and avoid extreme temperatures to preserve the bamboo finish.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="benefits">
                <AccordionTrigger>Benefits</AccordionTrigger>
                <AccordionContent>
                  - 100% biodegradable material
                  - Reduces plastic waste
                  - Durable and lightweight
                  - Naturally insulating properties
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="ingredients">
                <AccordionTrigger>Ingredients</AccordionTrigger>
                <AccordionContent>
                  Made from pure bamboo with a food-grade silicone seal. No harmful chemicals or plastics.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Carousel for Reviews */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Customer Reviews</h2>
            <div className="w-full overflow-hidden">
              <div className="flex space-x-4 animate-scroll">
                {reviews.map((review) => (
                  <div key={review.id} className="min-w-[300px] bg-white p-4 rounded-lg shadow-md">
                    <div className="flex items-center space-x-2 mb-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">{review.text}</p>
                    <p className="text-gray-800 font-medium mt-2">{review.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>How do I clean the bamboo bottle? - Hand wash with mild soap and avoid dishwashers.</li>
          <li>Is it leak-proof? - Yes, with a secure silicone seal.</li>
          <li>Can it keep drinks hot? - It offers mild insulation; for hot drinks, use a sleeve.</li>
        </ul>
      </div>
    </div>
  );
}

