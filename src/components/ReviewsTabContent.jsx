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
      <Card className="border-gray-200 dark:border-gray-700 mt-4 shadow-sm bg-white/90 dark:bg-gray-800/90">
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <p className="text-sm text-gray-500">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              No reviews yet. Be the first to share your experience with the{" "}
              {productName}!
            </p>
          ) : (
            <>
              {/* ⭐ Average Rating */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {avg} out of 5
                </h3>
                <div className="text-lg">{renderStars(Math.round(avg))}</div>
                <p className="text-sm text-gray-500 mt-1">
                  {reviews.length} reviews
                </p>
              </div>

              {/* 📊 Breakdown */}
              <div className="mb-4 space-y-1">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <div className="w-10">{star}★</div>
                    <div className="w-full bg-gray-200 rounded h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded"
                        style={{
                          width:
                            reviews.length > 0
                              ? `${(breakdown[star] / reviews.length) * 100}%`
                              : "0%",
                        }}
                      ></div>
                    </div>
                    <div className="w-6 text-right">{breakdown[star]}</div>
                  </div>
                ))}
              </div>

              {/* 💬 Recent Reviews */}
              <div className="space-y-4 mt-6">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review._id} className="border-t pt-4">
                    <div className="flex items-center gap-2">
                      <div className="text-yellow-400 text-sm">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {review.user?.name || "Anonymous"}
                      </p>
                    </div>
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      {review.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {review.body}
                    </p>
                     {review.photos && review.photos.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {review.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt="Review photo"
                            className="w-20 h-20 object-cover rounded-md border"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 👁️ View All Button */}
              {reviews.length > 3 && (
                <div className="mt-4">
                  <Button variant="outline">View All Reviews</Button>
                </div>
              )}
            </>
          )}

          {/* ✍️ Write Review */}
          <div className="mt-6">
            <WriteReviewDialog productId={productId} userId={userId} />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default ReviewsTabContent;
