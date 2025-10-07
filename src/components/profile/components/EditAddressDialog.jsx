import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateAddress } from "@/store/slices/userSlice";

export default function EditAddressDialog({ open, onOpenChange, address, user }) {


  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    isDefault: false,
  });
  const [errors, setErrors] = useState({});

  // Update formData when address or user props change
  useEffect(() => {
    if (address) {
      setFormData({
        fullName: address.fullName || user?.fullName || "",
        phone: address.phone || user?.phone || "",
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        postalCode: address.postalCode || "",
        country: address.country || "",
        isDefault: address.isDefault || false,
      });
      setErrors({}); // Clear errors when address changes
    }
  }, [address, user]);

  const validateAddress = () => {
    const errors = {};
    if (!formData.fullName) errors.fullName = "Full name is required";
    if (!formData.phone) errors.phone = "Phone number is required";
    if (!formData.street) errors.street = "Street is required";
    if (!formData.city) errors.city = "City is required";
    if (!formData.state) errors.state = "State is required";
    if (!formData.postalCode) errors.postalCode = "Postal code is required";
    if (!formData.country) errors.country = "Country is required";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateAddress = async () => {
    if (!validateAddress()) return;

    if (!address?._id) {
      toast.error("Invalid address ID");
      return;
    }

    try {
      await dispatch(
        updateAddress({
          addressId: address._id,
          addressData: formData,
        })
      ).unwrap();
      toast.success("Address updated successfully");
      onOpenChange(false); // Close the dialog
    } catch (err) {
      toast.error(err.message || "Failed to update address");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Address</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Full Name</Label>
            <Input
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="mt-1 text-sm sm:text-base"
              aria-label="Full Name"
            />
            {errors.fullName && (
              <p className="text-xs sm:text-sm text-red-500 mt-1">
                {errors.fullName}
              </p>
            )}
          </div>
          <div>
            <Label className="text-sm">Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="mt-1 text-sm sm:text-base"
              aria-label="Phone"
            />
            {errors.phone && (
              <p className="text-xs sm:text-sm text-red-500 mt-1">
                {errors.phone}
              </p>
            )}
          </div>
          <div>
            <Label className="text-sm">Street</Label>
            <Input
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
              className="mt-1 text-sm sm:text-base"
              aria-label="Street"
            />
            {errors.street && (
              <p className="text-xs sm:text-sm text-red-500 mt-1">
                {errors.street}
              </p>
            )}
          </div>
          <div>
            <Label className="text-sm">City</Label>
            <Input
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="mt-1 text-sm sm:text-base"
              aria-label="City"
            />
            {errors.city && (
              <p className="text-xs sm:text-sm text-red-500 mt-1">
                {errors.city}
              </p>
            )}
          </div>
          <div>
            <Label className="text-sm">State</Label>
            <Input
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              className="mt-1 text-sm sm:text-base"
              aria-label="State"
            />
            {errors.state && (
              <p className="text-xs sm:text-sm text-red-500 mt-1">
                {errors.state}
              </p>
            )}
          </div>
          <div>
            <Label className="text-sm">Postal Code</Label>
            <Input
              value={formData.postalCode}
              onChange={(e) =>
                setFormData({ ...formData, postalCode: e.target.value })
              }
              className="mt-1 text-sm sm:text-base"
              aria-label="Postal Code"
            />
            {errors.postalCode && (
              <p className="text-xs sm:text-sm text-red-500 mt-1">
                {errors.postalCode}
              </p>
            )}
          </div>
          <div>
            <Label className="text-sm">Country</Label>
            <Input
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              className="mt-1 text-sm sm:text-base"
              aria-label="Country"
            />
            {errors.country && (
              <p className="text-xs sm:text-sm text-red-500 mt-1">
                {errors.country}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isDefault: checked })
              }
            />
            <Label htmlFor="isDefault" className="text-sm">
              Set as Default
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-sm sm:text-base"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateAddress}
            className="text-sm sm:text-base"
          >
            Update Address
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}