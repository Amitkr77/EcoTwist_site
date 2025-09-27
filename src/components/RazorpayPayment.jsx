"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import axios from "axios";

const RazorpayPayment = ({
  amount,
  onSuccess,
  onError,
  deliveryAddress,
  disabled = false,
}) => {
  const loadRazorpayScript = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
      } else {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () =>
          reject(new Error("Failed to load Razorpay SDK. Please check your network."));
        document.body.appendChild(script);
      }
    });

  const handlePayment = async () => {
    try {
      // Step 1: Load Razorpay SDK
      await loadRazorpayScript();

      // Step 2: Create Razorpay order via backend
      const token = localStorage.getItem("user-token");
      if (!token) {
        throw new Error("User not authenticated. Please log in.");
      }

      const response = await axios.post(
        "/api/payment/create-order",
        { amount: Math.round(amount * 100) }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { orderId } = response.data;

      // Step 3: Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: Math.round(amount * 100), 
        currency: "INR", 
        name: "Ecotwist",
        description: "Order Payment",
        order_id: orderId, 
        prefill: {
          name: deliveryAddress.fullName || "",
          email: deliveryAddress.email || "",
          contact: deliveryAddress.phone || "",
        },
        notes: {
          address: `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.zipCode}`,
        },
        theme: { color: "#3399cc" },
        handler: async (response) => {
          // Step 4: Verify payment on backend
          try {
            const verifyResponse = await axios.post(
              "/api/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyResponse.data.success) {
              onSuccess(response.razorpay_payment_id);
            } else {
              onError(new Error("Payment verification failed."));
            }
          } catch (error) {
            onError(new Error("Error verifying payment. Please try again."));
          }
        },
        modal: {
          ondismiss: () => onError(new Error("Payment cancelled by user.")),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        onError(new Error(response.error.description || "Payment failed."));
      });
      rzp.open();
    } catch (error) {
      onError(error);
    }
  };

  return (
    <Button onClick={handlePayment} className="w-full" size="lg" disabled={disabled}>
      <CreditCard className="w-4 h-4 mr-2" />
      Pay with Razorpay - ₹{amount.toFixed(2)}
    </Button>
  );
};

export default RazorpayPayment;