"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// optional: using shadcn/ui Dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const WriteReviewForm = ({ productId, userId }) => {
  const [review, setReview] = useState("");
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false); // 👈 New state

  useEffect(() => {
    const token = localStorage.getItem("user-token");
    setIsAuthenticated(!!token);
  }, []);

  const handlePhotoChange = (e) => {
    setPhotos([...e.target.files]);
  };

  const handleSubmit = async () => {
    //  If not logged in, show login popup instead of static message
    if (!isAuthenticated) {
      setShowLoginPopup(true);
      return;
    }

    if (!review.trim() || !title.trim() || rating === 0) {
      console.log("Please fill in all fields, including title and rating.");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("user-token");

      const handleImageUpload = async (photos) => {
        try {
          const uploadedUrls = [];

          for (const file of photos) {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/review/uploadImage", {
              method: "POST",
              body: formData,
            });

            if (!res.ok) {
              throw new Error("Upload failed");
            }

            const data = await res.json();
            uploadedUrls.push(data.url); 
          }
          return uploadedUrls;
        } catch (error) {
          console.error("Image upload error:", error);
          return [];
        }
      };

      const uploadedUrls = await handleImageUpload(photos);

      // Submit review
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
          photos: uploadedUrls,
          status: "published",
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to submit review");

      // Reset form
      setReview("");
      setTitle("");
      setRating(0);
      setPhotos([]);
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () =>
    [1, 2, 3, 4, 5].map((star) => (
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

  return (
    <>
      <div className="border border-gray-300 rounded-lg p-6 mt-6 bg-white dark:bg-gray-800 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Write a Review</h2>
        <p className="text-sm text-gray-500 mb-4">
          Share your experience with this product.
        </p>

        <div className="space-y-4">
          {/* Title Input */}
          <Input
            placeholder="Review title (e.g. 'Amazing product!')"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
          />

          {/* Photo Upload */}
          <div>
            <label className="font-medium">Upload Photos:</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="mt-1 block w-full text-sm text-gray-500
               file:mr-4 file:py-2 file:px-4
               file:rounded-md file:border-0
               file:text-sm file:font-semibold
               file:bg-green-50 file:text-green-700
               hover:file:bg-green-100"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </div>

      {/*  Login Popup */}
      <Dialog open={showLoginPopup} onOpenChange={setShowLoginPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to log in before submitting a review.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowLoginPopup(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => (window.location.href = "/login")} // redirect to login page
            >
              Go to Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WriteReviewForm;
