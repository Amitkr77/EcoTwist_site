"use client";
import { useEffect, useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WriteReviewDialog from "./WriteReviewDialog"; // Update path if needed

const ReviewsTabContent = ({ productId, productName, userId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/review?product=${productId}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.data);
        }
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const calculateStats = () => {
    const total = reviews.length;
    if (total === 0) return { avg: 0, breakdown: {} };

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const totalScore = reviews.reduce((sum, review) => {
      breakdown[review.rating]++;
      return sum + review.rating;
    }, 0);

    return {
      avg: (totalScore / total).toFixed(1),
      breakdown,
    };
  };

  const { avg, breakdown } = calculateStats();

  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < count ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ));
  };

  return (
    <TabsContent value="reviews">
      <Card className="border-gray-200 dark:border-gray-700 mt-6 shadow-lg bg-white/95 dark:bg-gray-800/95 rounded-xl overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-base text-gray-500 dark:text-gray-400 animate-pulse">
                Loading reviews...
              </p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
                No reviews yet. Be the first to share your experience with{" "}
                <span className="font-bold">{productName}</span>!
              </p>
              <div className="mt-4">
                <WriteReviewDialog productId={productId} userId={userId} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Section: Recent Reviews */}
              <div className="lg:col-span-2">
                {/* ⭐ Average Rating */}
                <div className="text-center lg:text-left">
                  <h3 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {avg} <span className="text-lg">/ 5</span>
                  </h3>
                  <div className="flex justify-center lg:justify-start text-xl mt-2">
                    {renderStars(Math.round(avg))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Based on {reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"}
                  </p>
                </div>

                {/* 📊 Rating Breakdown */}
                <div className="mt-6 space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Rating Breakdown
                  </h4>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <div className="w-8 text-gray-600 dark:text-gray-300">
                        {star}★
                      </div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-300"
                          style={{
                            width:
                              reviews.length > 0
                                ? `${(breakdown[star] / reviews.length) * 100}%`
                                : "0%",
                          }}
                        ></div>
                      </div>
                      <div className="w-8 text-right text-gray-600 dark:text-gray-300">
                        {breakdown[star]}
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-6 mb-2">
                  Recent Reviews
                </h3>
                <div className="space-y-6">
                  {reviews.slice(0, 3).map((review) => (
                    <div
                      key={review._id}
                      className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-yellow-400 text-sm">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {review.user?.name || "Anonymous"}
                        </p>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-800 dark:text-white text-base">
                        {review.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-3">
                        {review.body}
                      </p>
                      {review.photos && review.photos.length > 0 && (
                        <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
                          {review.photos.map((photo, idx) => (
                            <img
                              key={idx}
                              src={photo}
                              alt={`Review photo ${idx + 1}`}
                              className="w-24 h-24 object-cover rounded-md border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 👁️ View All Button */}
                {reviews.length > 3 && (
                  <div className="mt-6 text-center">
                    <Button
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      View All {reviews.length} Reviews
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Section: Rating Summary & Write Review */}
              <div className="lg:col-span-1">
                {/* ✍️ Write Review Button */}
                <div className="mt-8">
                  <WriteReviewDialog productId={productId} userId={userId} />
                </div>
              </div>

              {/* ✍️ Write Review Button (Mobile) */}
              <div className="lg:hidden mt-6 text-center">
                <WriteReviewDialog productId={productId} userId={userId} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default ReviewsTabContent;
