"use client";
import React from "react";
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
import { Star } from "lucide-react";

const ProductCard = ({ product }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();

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
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const isOutOfStock = product.stock === 0;

  const handleCardClick = () => {
    router.push(`/product-info/${product._id}/`);
  };

  return (
    <div onClick={handleCardClick}>
      <Card className="h-full flex flex-col">
        <CardHeader className="p-0">
          <img
            src={
              Array.isArray(product.images)
                ? product.images.find((img) => img.isPrimary)?.url ||
                  product.images[0]?.url ||
                  "/placeholder.svg"
                : "/placeholder.svg"
            }
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        </CardHeader>

        <CardContent className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <Badge variant="secondary">{product.categories[0]}</Badge>
          </div>

          <p className="text-sm text-gray-600 mb-3">{product.description}</p>

          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-green-600">
              ₹{product.variants[0].price}
            </span>
            <div className="flex items-center space-x-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(4.5)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>{" "}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            className="w-full"
            disabled={isOutOfStock}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProductCard;
