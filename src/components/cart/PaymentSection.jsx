import React from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import RazorpayPayment from "@/components/RazorpayPayment";

export const PaymentSection = ({
  paymentMethod,
  setPaymentMethod,
  handleCheckout,
  handleRazorpaySuccess,
  handleRazorpayError,
  totalPrice,
  deliveryAddress,
  isAddressValid,
  isLoading
}) => {
  return (
    <div className="p-4 space-y-4">
      <RadioGroup
        value={paymentMethod}
        onValueChange={setPaymentMethod}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cod" id="cod" />
          <Label htmlFor="cod" className="text-gray-700">Cash on Delivery</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="online" id="online" />
          <Label htmlFor="online" className="text-gray-700">Online Payment (Razorpay)</Label>
        </div>
      </RadioGroup>

      {paymentMethod === "online" ? (
        <RazorpayPayment
          amount={totalPrice}
          onSuccess={handleRazorpaySuccess}
          onError={handleRazorpayError}
          deliveryAddress={deliveryAddress}
          disabled={!isAddressValid || isLoading}
          className="w-full"
        />
      ) : (
        <Button
          onClick={handleCheckout}
          disabled={!isAddressValid || isLoading}
          className="w-full"
        >
          {isLoading ? "Processing..." : "Proceed to Checkout"}
        </Button>
      )}
    </div>
  );
};
