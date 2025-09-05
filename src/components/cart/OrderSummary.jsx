import React from "react";
import { Separator } from "@/components/ui/separator";

export const OrderSummary = ({ total }) => (
  <div className="p-4 space-y-3">
    <div className="flex justify-between text-gray-700">
      <span>Subtotal</span>
      <span>₹{total.toFixed(2)}</span>
    </div>
    <div className="flex justify-between text-gray-700">
      <span>Shipping</span>
      <span>Free</span>
    </div>
    <Separator />
    <div className="flex justify-between font-semibold text-gray-900">
      <span>Total</span>
      <span>₹{total.toFixed(2)}</span>
    </div>
  </div>
);
