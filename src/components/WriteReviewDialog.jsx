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
import { Textarea } from "@/components/ui/textarea"; // Replace with your Textarea component
// import { toast } from "sonner"; // Optional: any toast library

const WriteReviewDialog = () => {
  const [open, setOpen] = useState(false);
  const [review, setReview] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem("token"); // Adjust key name if different
    setIsAuthenticated(!!token);
  }, []);

  const handleTriggerClick = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      //   toast.warning("Please log in to write a review.");
      alert("Please log in to write a review.");
      return;
    }
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!review.trim()) {
      //   toast.error("Review cannot be empty.");
      alert("Review cannot be empty.");
      return;
    }

    // Example: Submit review via API here
    // e.g., await fetch('/api/reviews', { method: 'POST', body: JSON.stringify({ review, productId }) })

    // toast.success("Review submitted successfully!");
    alert("Review submitted successfully!")
    setReview("");
    setOpen(false);
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
          <Textarea
            rows={5}
            placeholder="Your honest thoughts help others..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
          />
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
