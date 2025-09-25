"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// Constants
const OTP_LENGTH = 6;

// OTP Input Component
function OtpInput({ value, onChange, error }) {
  const inputsRef = useRef([]);
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(""));

  // Handle individual input changes
  const handleInputChange = (index, e) => {
    const newValue = e.target.value.replace(/\D/g, "").slice(0, 1);
    const newOtpValues = [...otpValues];
    newOtpValues[index] = newValue;
    setOtpValues(newOtpValues);
    onChange(newOtpValues.join(""));

    // Move focus to next input
    if (newValue && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const newOtpValues = Array(OTP_LENGTH).fill("");
    pastedData.split("").forEach((char, i) => {
      if (i < OTP_LENGTH) newOtpValues[i] = char;
    });
    setOtpValues(newOtpValues);
    onChange(newOtpValues.join(""));
    if (pastedData.length > 0) {
      inputsRef.current[Math.min(pastedData.length, OTP_LENGTH - 1)].focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {otpValues.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleInputChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          className={`w-12 h-12 text-center text-lg font-medium border-teal-200 focus:border-teal-400 focus:ring-teal-400 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : ""
          }`}
          aria-label={`OTP digit ${index + 1}`}
          aria-invalid={!!error}
          aria-describedby={error && index === 0 ? "otp-error" : undefined}
        />
      ))}
    </div>
  );
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({ otp: "", general: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Retrieve formData from localStorage
  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("signupFormData");
      return storedData ? JSON.parse(storedData) : { email: "", password: "" };
    }
    return { email: "", password: "" };
  });

  // Validate OTP
  const validateOtp = useCallback(() => {
    const newErrors = { otp: "", general: "" };
    if (!otp) newErrors.otp = "OTP is required.";
    else if (otp.length !== OTP_LENGTH)
      newErrors.otp = "Enter a 6-digit OTP.";
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err);
  }, [otp]);

  // Handle OTP change
  const handleOtpChange = (value) => {
    setOtp(value);
    setErrors((prev) => ({ ...prev, general: "", otp: "" }));
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      const res = await fetch("/api/user/auth/resendOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error("Invalid server response.");
      }

      if (res.ok) {
        setResendCooldown(60);
        toast.success("OTP resent! Check your email.", { duration: 3000 });
      } else {
        setErrors((prev) => ({
          ...prev,
          general: data.error || "Failed to resend OTP.",
        }));
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: err.message || "Failed to resend OTP. Try again.",
      }));
    } finally {
      setResendLoading(false);
    }
  };

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!validateOtp()) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      const res = await fetch("/api/user/auth/verifyOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error("Invalid server response.");
      }

      if (res.ok) {
        const loginRes = await fetch("/api/user/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        let loginData;
        try {
          loginData = await loginRes.json();
        } catch (parseError) {
          throw new Error("Invalid login response.");
        }

        if (loginRes.ok) {
          localStorage.setItem("user-token", loginData.token);
          localStorage.removeItem("signupFormData"); // Clean up
          toast.success("You are now a Green Planet member 💚", {
            duration: 3000,
          });
          router.push("/");
        } else {
          setErrors((prev) => ({
            ...prev,
            general: loginData.error || "Login failed after verification.",
          }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          general: data.error || "Invalid OTP.",
        }));
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: err.message || "An error occurred during verification.",
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
            Verify Your Account
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter the 6-digit OTP sent to your email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleVerifyOtp}
            className="space-y-4"
            role="form"
            aria-label="OTP verification form"
          >
            <div className="space-y-2">
              <label
                htmlFor="otp"
                className="text-sm font-medium text-gray-700"
              >
                OTP
              </label>
              <OtpInput
                value={otp}
                onChange={handleOtpChange}
                error={errors.otp}
              />
              {errors.otp && (
                <p
                  id="otp-error"
                  className="text-sm text-red-500 text-center"
                  aria-live="polite"
                >
                  {errors.otp}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white transition-colors duration-300 disabled:bg-teal-300 disabled:cursor-not-allowed"
              disabled={isLoading || !!errors.otp}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
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
          <div className="text-sm text-gray-600 flex flex-col items-center">
            <p>Didn't receive the OTP?</p>
            <Button
              onClick={handleResendOtp}
              variant="link"
              className="text-teal-600 hover:underline"
              disabled={resendLoading || resendCooldown > 0}
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : resendLoading
                ? "Resending..."
                : "Resend OTP"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}