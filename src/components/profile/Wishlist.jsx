import React,{useState} from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function Wishlist() {
     const [userProfile, setUserProfile] = useState({
        name: "Amit kumar",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        addresses: [
          {
            id: 1,
            type: "Home",
            street: "123 Main St",
            city: "San Francisco",
            state: "CA",
            zipCode: "94105",
          },
        ],
        wishlist: [],
      });
  const togglePriceAlert = (productId) => {
    setUserProfile((prev) => ({
      ...prev,
      wishlist: prev.wishlist.map((item) =>
        item.id === productId ? { ...item, priceAlert: !item.priceAlert } : item
      ),
    }));
    toast.success("Price alert updated!");
  };
  const handleRemoveFromWishlist = (productId) => {
    setUserProfile((prev) => ({
      ...prev,
      wishlist: prev.wishlist.filter((item) => item.id !== productId),
    }));
    toast.success("Removed from wishlist!");
  };
  return (
    <div>
      <Card className="bg-white dark:bg-gray-800 border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            My Wishlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userProfile.wishlist.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userProfile.wishlist.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    ₹{item.price}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={item.priceAlert}
                      onChange={() => togglePriceAlert(item.id)}
                      className="w-4 h-4 text-gray-600 rounded"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      Notify on price drop
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      className="bg-gray-600 text-white hover:bg-gray-700"
                    >
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="border-gray-300 text-gray-600 dark:text-gray-300"
                    >
                      <Heart className="w-4 h-4 mr-2 fill-red-500" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 mx-auto text-gray-600 dark:text-gray-300 mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                Your wishlist is empty
              </p>
              <Link href="/products">
                <Button className="mt-4 bg-gray-600 text-white hover:bg-gray-700">
                  Browse Products
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
