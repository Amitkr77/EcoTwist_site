import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Heart, Eye, Trash2, Share2 } from "lucide-react";
import Link from "next/link";
import { addToCart } from "@/store/slices/cartSlice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { removeFromWishlist } from "@/store/slices/userSlice";
import { useRouter } from "next/navigation";

export default function Wishlist({ wishlistItems, isLoading }) {
  const router = useRouter();
  const handleGoHome = () => {
    router.push("/");
  };
  const dispatch = useDispatch();
  const handleRemoveWishlistItem = async (productId) => {
    try {
      // Dispatch the action to remove from wishlist
      await dispatch(removeFromWishlist(productId)).unwrap();

      // Show success toast
      toast.success("Item removed from wishlist");
    } catch (error) {
      // Show error toast
      toast.error(error.message || "Failed to remove item from wishlist");
      console.error("Failed to remove from wishlist:", error);
    }
  };
  const handleAddToCart = async (item) => {
    if (!item.productId?._id) {
      toast.error("Invalid product ID");
      return;
    }
    const variantSku = item.variantSku || item.productId?.variants?.[0]?.sku;
    if (!variantSku) {
      toast.error("No variant available for this product");
      return;
    }
    try {
      await dispatch(addToCart({
        productId: item.productId._id,
        variantSku,
        quantity: 1,
      })).unwrap();
      toast.success("Item added to cart");
      console.log("Item added to cart:", item.name);
    } catch (error) {
      toast.error(error.message || "Failed to add item to cart");
      console.error("Failed to add to cart:", error);
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0 sm:p-2">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-48 sm:h-64 rounded-xl bg-gray-100"
              />
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex justify-center items-center flex-col gap-4 p-8 sm:p-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm">
            <Heart size={40} className="text-rose-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Your Wishlist is Empty
            </h1>
            <p className="text-sm sm:text-base text-gray-600 text-center max-w-md">
              Explore our collection and add your favorite products to your
              wishlist!
            </p>
            <Button
              onClick={handleGoHome}
              className="text-base font-semibold bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 px-6 py-2"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {wishlistItems.map((item, index) => (
              <Card
                key={index}
                className="overflow-hidden border border-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <CardContent className="p-4 sm:p-5">
                  <Link
                    href={`/product-info/${item.productId.slug}--${item.productId._id}`}
                  >
                    <img
                      src={item.imageUrl || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-full h-40 sm:h-48 object-cover rounded-lg mb-4 transition-transform duration-300 hover:scale-105"
                    />
                  </Link>
                  <p className="font-semibold text-lg sm:text-xl text-gray-900 tracking-tight mb-1">
                    {item.name}
                  </p>
                  <p className="text-base sm:text-lg font-medium text-gray-700 mb-4">
                    ₹{item.price.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleAddToCart(item)}
                      // disabled={loading}
                      className="flex-1 text-sm sm:text-base font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 "
                    >
                      Add to Cart
                    </Button>
                    <Link
                      href={`/product-info/${item.productId.slug}--${item.productId._id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-gray-300 rounded-lg text-sm sm:text-base font-medium tracking-tight shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-gray-200 hover:border-red-300 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="sm:max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-lg font-bold text-gray-900 tracking-tight">
                            Remove Item?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-sm text-gray-600">
                            Are you sure you want to remove{" "}
                            <span className="font-medium">{item.name}</span>{" "}
                            from your wishlist?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              item.productId?._id &&
                              handleRemoveWishlistItem(
                                item.productId._id || item.productId.id
                              )
                            }
                            className="text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg"
                            disabled={!item.productId?.id}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Button
          variant="outline"
          className="mt-6 sm:mt-8 text-sm sm:text-base font-medium text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Share2 className="w-4 h-4 mr-2 text-gray-600" />
          Share Wishlist
        </Button>
      </CardContent>
    </Card>
  );
}
