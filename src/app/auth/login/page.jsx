"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, ArrowRightCircle, HomeIcon } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login delay
    setTimeout(() => {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", email);
      setIsLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative">
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

      {/* Background Image + Overlay */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/eco-hero-image.jpg"
          alt="Eco Friendly Gifts"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <Card className="w-full max-w-md bg-white backdrop-blur-lg shadow-2xl rounded-xl border border-white/30">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <img src="/logo.png" alt="Ecotwist Logo" className="h-20" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-slate-600 hidden">
            Sign in to your Ecotwist account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Google Sign-In Button */}
          <Button
            type="button"
            onClick={() => console.log("Google Sign In")}
            className="w-full bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 py-2.5 font-medium rounded-md flex items-center justify-center gap-3 transition-all shadow-sm mb-5"
          >
            <img src="/google.png" alt="" className="h-5 w-5" />
            Continue with Google
          </Button>

          {/* OR Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white/80 px-3 text-slate-500">
                  Or Sign in to your Ecotwist account
                </span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input with Icon */}
            <div className="relative">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                id="email"
                type="email"
                aria-label="Email address"
                aria-required="true"
                aria-describedby="email-description"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-white/70 border border-slate-300 focus:ring-2 focus:ring-green-700/50 focus:outline-none transition"
              />
              <span id="email-description" className="sr-only">
                Enter your email address
              </span>
            </div>

            {/* Password Input with Icon */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                id="password"
                type="password"
                aria-label="Password"
                aria-required="true"
                aria-describedby="password-description"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 bg-white/70 border border-slate-300 focus:ring-2 focus:ring-green-700/50 focus:outline-none transition"
              />
              <span id="password-description" className="sr-only">
                Enter your account password
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full eco-button py-3 font-semibold tracking-wide text-base flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Account Link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/80 px-3 text-slate-500">
                  Don’t have an account?
                </span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/auth/register"
                className="flex items-center justify-center gap-1 text-green-700 hover:text-green-600 font-medium transition"
              >
                Create new account
                <ArrowRightCircle className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
