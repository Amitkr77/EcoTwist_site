"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const DeliveryAddressForm = ({ address, onChange }) => {
  const fields = [
    { id: "fullName", label: "Full Name *" },
    { id: "phone", label: "Phone Number" },
    { id: "street", label: "Street Address *" },
    { id: "city", label: "City *" },
    { id: "state", label: "State" },
    { id: "zipCode", label: "ZIP Code" },
  ];

  return (
    <div className="grid gap-4 p-4 md:grid-cols-2">
      {fields.map(({ id, label }) => (
        <div key={id} className={["street", "fullName"].includes(id) ? "md:col-span-2" : ""}>
          <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
          <Input
            id={id}
            value={address[id] || ""}
            onChange={(e) => onChange(id, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
            className="mt-1"
          />
        </div>
      ))}
    </div>
  );
};
