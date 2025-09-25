"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  UserPlus,
  ArrowRightCircle,
  HomeIcon,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = () => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = async () => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    setIsLoading(true);

    // Simulated API
    setTimeout(() => {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", formData.email);
      setIsLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="py-12 px-4 flex justify-center items-center min-h-screen relative">
      <Link
        href="/"
        className="absolute top-16 left-20 bg-white/10 text-white backdrop-blur-xl p-4 rounded-full shadow-lg 
             hover:bg-white/20 transition-all duration-300 cursor-pointer group 
             sm:top-12 sm:left-6"
        aria-label="Home"
        role="button"
      >
        <HomeIcon className="w-6 h-6" />

        {/* Tooltip */}
        <span
          className="absolute left-full ml-2 top-1/2 -translate-y-1/2 
                   whitespace-nowrap bg-black text-white text-xs rounded px-2 py-1 opacity-0 
                   group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                   sm:hidden"
        >
          Home
        </span>
      </Link>

      {/* Background image + overlay */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/eco-hero-image.jpg"
          alt="Eco Friendly Gifts"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40 " />
      </div>

      <Card className="w-full max-w-md bg-white border border-white/30 shadow-2xl rounded-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <img src="/logo.png" alt="EcoTwist Logo" className="h-20" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800">
            Create Account
          </CardTitle>
          <CardDescription className="text-slate-600">
            Join EcoTwist for sustainable shopping
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                id="name"
                name="name"
                type="text"
                aria-label="Full name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="pl-10 bg-white/70 border border-slate-300 focus:ring-2 focus:ring-green-700/50"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                id="email"
                name="email"
                type="email"
                aria-label="Email address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="pl-10 bg-white/70 border border-slate-300 focus:ring-2 focus:ring-green-700/50"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                id="password"
                name="password"
                type="password"
                aria-label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="pl-10 bg-white/70 border border-slate-300 focus:ring-2 focus:ring-green-700/50"
              />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                aria-label="Confirm password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="pl-10 bg-white/70 border border-slate-300 focus:ring-2 focus:ring-green-700/50"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full eco-button py-3 font-semibold tracking-wide text-base flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                "Creating Account..."
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          {/* Already have account */}
          <div className="mt-6 text-center">
            <span className="text-slate-500">Already have an account? </span>
            <Link
              href="/auth/login"
              className="flex justify-center items-center gap-1 text-green-700 hover:text-green-600 font-medium transition"
            >
              Sign in
              <ArrowRightCircle className="w-4 h-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
