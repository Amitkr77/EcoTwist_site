"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Mail, Lock, LogIn, ArrowRightCircle } from "lucide-react";

// Separate component to handle useSearchParams
function LoginLogic({ setErrorMessage }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error") === "login-first") {
      toast.error("You must log in first!", { duration: 6000 });
      const params = new URLSearchParams(searchParams.toString());
      params.delete("error");

      router.replace(`${window.location.pathname}?${params.toString()}`, {
        scroll: false,
      });
    }
  }, [searchParams]);

  return null; 
}

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("select");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const roleManager = `manager:${role}`;
    
    if (role === "select") {
      toast.error("Please select your role");
      setIsLoading(false);
      return; 
    } 
    try {
      const response = await fetch("/api/managers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, roleManager }),
    });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result?.error || "Invalid email or password.");
        return;
      }

      // ✅ Login successful → cookie is already set by API
      router.push(`/manager/${role}`);
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative">
      <Card className="w-full max-w-md bg-white backdrop-blur-lg shadow-2xl rounded-xl border border-white/30">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <img src="/logo.png" alt="EcoTwist Logo" className="h-20" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800">
            Manager's Portal
          </CardTitle>
          <CardDescription className="text-slate-600 hidden">
            Sign in to your EcoTwist account
          </CardDescription>
        </CardHeader>

        <CardContent>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md bg-white/70 focus:ring-2 focus:ring-green-700/50 focus:outline-none transition"
              >
                <option value="select">--select your role--</option>
                <option value="sales">Sales Manager</option>
                <option value="finance">Finance Manager</option>
                <option value="marketing">Marketing Manager</option>
              </select>
            </div>

            {/* Email Input with Icon */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-white/70 border border-slate-300 focus:ring-2 focus:ring-green-700/50 focus:outline-none transition"
              />
            </div>

            {/* Password Input with Icon */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 bg-white/70 border border-slate-300 focus:ring-2 focus:ring-green-700/50 focus:outline-none transition"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}

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
                  Trouble signing in?
                </span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="mailto:info@ecotwist.in"
                className="flex items-center text-zinc-600 gap-2 justify-center hover:text-green-600 font-medium transition"
              >
                 Contact Admin
                <Mail className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Wrap useSearchParams logic in Suspense */}
          <Suspense fallback={<div>Loading...</div>}>
            <LoginLogic setErrorMessage={setErrorMessage} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}