// components/cart/PaymentSection.js
"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import RazorpayPayment from "../RazorpayPayment";

const PaymentSection = ({
  paymentMethod,
  setPaymentMethod,
  handleCheckout,
  handleRazorpaySuccess,
  handleRazorpayError,
  totalPrice,
  deliveryAddress,
  isAddressValid,
  isLoading,
}) => {
  return (
    <div className="p-6">
      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
        <div className="flex items-center space-x-2 mb-4">
          <RadioGroupItem value="cod" id="cod" />
          <Label htmlFor="cod">Cash on Delivery</Label>
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <RadioGroupItem value="online" id="online" />
          <Label htmlFor="online">Online Payment (Razorpay)</Label>
        </div>
      </RadioGroup>
      {paymentMethod === "cod" ? (
        <Button
          className="w-full mt-4"
          onClick={handleCheckout}
          disabled={isLoading || !isAddressValid}
        >
          {isLoading ? "Processing..." : "Proceed to Checkout"}
        </Button>
      ) : (
        <RazorpayPayment
          amount={totalPrice}
          onSuccess={handleRazorpaySuccess}
          onError={handleRazorpayError}
          deliveryAddress={deliveryAddress}
          disabled={isLoading || !isAddressValid}
        />
      )}
    </div>
  );
};

export default PaymentSection;