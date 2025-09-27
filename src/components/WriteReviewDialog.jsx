"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // Make sure this exists

const WriteReviewDialog = ({ productId, userId }) => {
  const [open, setOpen] = useState(false);
  const [review, setReview] = useState("");
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleTriggerClick = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to write a review.");
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!review.trim() || !title.trim() || rating === 0) {
      alert("Please fill in all fields, including title and rating.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          product: productId,
          user: userId,
          rating,
          title,
          body: review,
          status: "published",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      alert("Review submitted successfully!");
      setReview("");
      setTitle("");
      setRating(0);
      setOpen(false);
    } catch (err) {
      console.error("Submit error:", err);
      alert(err.message);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
        className={`cursor-pointer text-2xl ${
          star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="mt-4 border-gray-500 text-gray-600"
          onClick={handleTriggerClick}
        >
          Write a Review
        </Button>
      </DialogTrigger>

      <DialogContent className="border-gray-300">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with this product.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title Input */}
          <Input
            placeholder="Review title (e.g. 'Amazing product!')"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
          />

          {/* Star Rating */}
          <div className="flex items-center gap-2">
            <span className="font-medium">Your Rating:</span>
            <div className="flex">{renderStars()}</div>
          </div>

          {/* Review Textarea */}
          <Textarea
            rows={5}
            placeholder="Your honest thoughts help others..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
          />

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            Submit Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WriteReviewDialog;
