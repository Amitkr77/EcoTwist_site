"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext.js";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const ProductCard = ({ product }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { isLoggedIn } = useAuth();

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.map((img) => img.url)
      : ["/placeholder.svg"];

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

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

    addToCart(product);
    // toast({
    //   title: "Added to Cart",
    //   description: `${product.name} has been added to your cart.`,
    // });
  };

  const isOutOfStock = product.stock === 0;

  const handleCardClick = () => {
    router.push(`/product-info/${product._id}/`);
  };
  return (
    <div onClick={handleCardClick}>
      <Card className="h-full flex flex-col">
        <CardHeader className="p-0 relative">
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="w-full h-32 xs:h-36 sm:h-48 lg:h-56 xl:h-64 object-contain rounded-t-lg"
          />
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 bg-white/80 hover:bg-white rounded-full"
                onClick={handlePrevImage}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-white/80 hover:bg-white rounded-full"
                onClick={handleNextImage}
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </Button>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </CardHeader>

        <CardContent className="flex-1 p-2 pb-0 xs:pb-0 xs:p-3 sm:p-4 sm:pb-0">
          <div className="flex  justify-between items-start mb-2 ">
            <CardTitle className="text-sm xs:text-base sm:text-base lg:text-lg xl:text-2xl">
              {product.name}
            </CardTitle>
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {product.categories[0]}
            </Badge>
          </div>

          <p className="text-xs xs:text-sm sm:text-base text-gray-600  line-clamp-2">
            {product.description}
          </p>
        </CardContent>

        <CardFooter className="p-2 xs:p-3 sm:p-4 pt-0 flex flex-col space-y-4 sm:space-y-6">
          <div className="flex justify-between items-center w-full">
            <span className="text-base xs:text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-green-600">
              ₹{product.variants[0].price}
            </span>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${
                    i < Math.floor(4.5)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
          <Button
            onClick={handleAddToCart}
            className="w-full text-xs xs:text-sm sm:text-base"
            disabled={isOutOfStock}
          >
            <ShoppingCart className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 mr-1 xs:mr-1 sm:mr-2" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProductCard;
