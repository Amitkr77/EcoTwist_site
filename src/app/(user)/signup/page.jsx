"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import toast from "react-hot-toast";
import debounce from "lodash/debounce";

// Constants
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    general: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Validate single field
  const validateField = useCallback(
    (name) => {
      const newErrors = { ...errors };
      if (name === "name") {
        if (!formData.name.trim()) newErrors.name = "Name is required.";
        else newErrors.name = "";
      } else if (name === "email") {
        if (!formData.email) newErrors.email = "Email is required.";
        else if (!EMAIL_REGEX.test(formData.email))
          newErrors.email = "Please enter a valid email.";
        else newErrors.email = "";
      } else if (name === "password") {
        if (!formData.password) newErrors.password = "Password is required.";
        else if (!PASSWORD_REGEX.test(formData.password))
          newErrors.password =
            "Password must be at least 8 characters with uppercase, lowercase, and a number.";
        else newErrors.password = "";
      }
      setErrors(newErrors);
    },
    [formData, errors]
  );

  // Validate entire form
  const validateForm = useCallback(() => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      general: "",
    };
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    else if (!EMAIL_REGEX.test(formData.email))
      newErrors.email = "Please enter a valid email.";
    if (!formData.password) newErrors.password = "Password is required.";
    else if (!PASSWORD_REGEX.test(formData.password))
      newErrors.password =
        "Password must be at least 8 characters with uppercase, lowercase, and a number.";
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err);
  }, [formData]);

  // Debounced validation
  const debouncedValidateField = useCallback(debounce(validateField, 300), [
    validateField,
  ]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, general: "", [name]: "" }));
    debouncedValidateField(name);
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      const [firstName, ...rest] = formData.name.trim().split(" ");
      const lastName = rest.join(" ");
      const res = await fetch("/api/user/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error("Invalid server response.");
      }

      if (res.ok) {
        // Store formData in localStorage to pass to OTP page
        localStorage.setItem("signupFormData", JSON.stringify(formData));
        toast.success("Registration successful! Please verify your OTP.", {
          duration: 3000,
        });
        router.push("/signup/verify");
      } else {
        setErrors((prev) => ({
          ...prev,
          general: data.error || "Registration failed.",
        }));
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: err.message || "An error occurred. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-teal-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md transform transition-all duration-300 hover:shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">
            Join the Green Journey
          </CardTitle>
          <CardDescription className="text-gray-600">
            Create an account to unlock eco-friendly gifting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleRegister}
            className="space-y-4"
            role="form"
            aria-label="Sign up form"
          >
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full border-teal-200 focus:border-teal-400 focus:ring-teal-400 ${
                  errors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                disabled={isLoading}
              />
              {errors.name && (
                <p
                  id="name-error"
                  className="text-sm text-red-500"
                  aria-live="polite"
                >
                  {errors.name}
                </p>
              )}
            </div>
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
                className={`w-full border-teal-200 focus:border-teal-400 focus:ring-teal-400 ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                disabled={isLoading}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="text-sm text-red-500"
                  aria-live="polite"
                >
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
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full border-teal-200 focus:border-teal-400 focus:ring-teal-400 pr-10 ${
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 rounded"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="text-sm text-red-500"
                  aria-live="polite"
                >
                  {errors.password}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white transition-colors duration-300 disabled:bg-teal-300 disabled:cursor-not-allowed"
              disabled={
                isLoading ||
                !!errors.name ||
                !!errors.email ||
                !!errors.password
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing Up...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
            {errors.general && (
              <div
                className="p-3 bg-red-50 border border-red-200 rounded-md"
                aria-live="polite"
              >
                <p className="text-sm text-red-700 text-center">
                  {errors.general}
                </p>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-600 hover:underline">
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}