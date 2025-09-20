"use client";

import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDebounce } from "use-debounce";
import toast from "react-hot-toast";
import { mergeGuestCart, fetchCart } from "@/store/slices/cartSlice";

// Constants for API endpoints
const API_ENDPOINTS = {
  LOGIN: "/api/user/auth/login",
  FORGOT_PASSWORD: "/api/user/auth/forgot-password",
};

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Debounce form input changes
  const [debouncedFormData] = useDebounce(formData, 300);

  // Validate form inputs
  const validateForm = useCallback(() => {
    const newErrors = { email: "", password: "", general: "" };
    if (!debouncedFormData.email) {
      newErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(debouncedFormData.email)) {
      newErrors.email = "Please enter a valid email.";
    }
    if (!debouncedFormData.password) {
      newErrors.password = "Password is required.";
    } else if (debouncedFormData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  }, [debouncedFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, general: "" }));
  };

  // Enhanced handleSubmit with cart merge
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      const res = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(debouncedFormData),
      });

      const data = await res.json();

      if (res.ok) {
        // Store the token
        localStorage.setItem("user-token", data.token);

        // Decode token to get user ID
        try {
          const decoded = jwtDecode(data.token);
          const userId = decoded?.userId || decoded?.id || decoded?.sub;
          if (userId) {
            localStorage.setItem("user-id", userId);
          }
        } catch (decodeError) {
          console.error("Failed to decode token:", decodeError);
        }

        // Check if there's a guest cart to merge
        const guestCart = localStorage.getItem("guest-cart");
        if (guestCart) {
          console.log("🛒 Guest cart detected, merging with auth cart...");

          try {
            // Merge guest cart first
            await dispatch(mergeGuestCart()).unwrap();
            console.log("✅ Guest cart merged successfully");

            // Show success message if items were merged
            const mergedCart = localStorage.getItem("guest-cart");
            if (
              !mergedCart ||
              mergedCart === '{"cart":{"items":[]},"timestamp":0}'
            ) {
              toast.success("Your cart has been transferred!", {
                duration: 3000,
              });
            }
          } catch (mergeError) {
            console.error("❌ Failed to merge guest cart:", mergeError);
            toast.error(
              "Login successful, but some cart items couldn't be transferred. Please add them again.",
              { duration: 5000 }
            );
          }
        }

        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);

        toast.success("Welcome back! Logging you in...", { duration: 2000 });
        
      } else {
        setErrors((prev) => ({
          ...prev,
          general: data.error || "Login failed. Please check your credentials.",
        }));
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrors((prev) => ({
        ...prev,
        general: "Network error. Please check your connection and try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail || !EMAIL_REGEX.test(resetEmail)) {
      setResetMessage("Please enter a valid email address.");
      return;
    }

    setResetLoading(true);
    setResetMessage("");

    try {
      const res = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();

      if (res.ok) {
        setResetMessage(
          "Password reset link sent! Check your email for instructions."
        );
        toast.success("Reset link sent! Check your inbox.");
        setResetEmail("");
      } else {
        setResetMessage(
          data.error || "Failed to send reset link. Please try again."
        );
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setResetMessage(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-teal-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md transform transition-all duration-300 hover:shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600">
            Log in to explore sustainable gifting solutions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border-teal-200 focus:border-teal-400 focus:ring-teal-400 transition-colors duration-200 ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                disabled={isLoading}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-500">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full border-teal-200 focus:border-teal-400 focus:ring-teal-400 transition-colors duration-200 pr-10 ${
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 rounded disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-red-500">
                  {errors.password}
                </p>
              )}
            </div>
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white transition-colors duration-300 disabled:bg-teal-300 disabled:cursor-not-allowed"
              disabled={isLoading || !!errors.email || !!errors.password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging In...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-3 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="text-teal-600 hover:underline font-medium"
            >
              Sign Up
            </Link>
          </p>
          <Button
            variant="link"
            onClick={() => setForgotOpen(true)}
            className="text-sm text-teal-600 hover:underline h-auto p-0"
            disabled={isLoading}
          >
            Forgot Password?
          </Button>
        </CardFooter>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Enter your email address and we'll send you a link to reset your
              password.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleForgotPassword}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-2">
              <label
                htmlFor="reset-email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                  setResetMessage("");
                }}
                className="w-full border-teal-200 focus:border-teal-400 focus:ring-teal-400 transition-colors duration-200"
                aria-invalid={!!resetMessage && resetMessage.includes("error")}
                aria-describedby={
                  resetMessage ? "reset-email-error" : undefined
                }
                disabled={resetLoading}
                required
              />
            </div>
            {resetMessage && (
              <div
                className={`p-3 rounded-md text-sm ${
                  resetMessage.includes("error") ||
                  resetMessage.includes("failed")
                    ? "bg-red-50 border border-red-200 text-red-700"
                    : "bg-green-50 border border-green-200 text-green-700"
                }`}
              >
                {resetMessage}
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForgotOpen(false);
                  setResetEmail("");
                  setResetMessage("");
                }}
                className="border-gray-300"
                disabled={resetLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-teal-500 hover:bg-teal-600 text-white transition-colors duration-300 disabled:bg-teal-300"
                disabled={resetLoading || !resetEmail.trim()}
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
