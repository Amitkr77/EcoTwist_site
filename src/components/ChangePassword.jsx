import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Edit, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function ChangePassword({ userId }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [open, setOpen] = useState(false); // Control dialog open state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.currentPassword)
      newErrors.currentPassword = "Current password is required";
    if (!formData.newPassword)
      newErrors.newPassword = "New password is required";
    if (formData.newPassword.length < 8)
      newErrors.newPassword = "New password must be at least 8 characters";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your new password";
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    // Optional: Add password strength check
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (formData.newPassword && !passwordRegex.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must include uppercase, lowercase, number, and special character";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      //   const token = Cookies.get("user-token");
      const token = localStorage.getItem("user-token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/api/user/auth/updatePassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Current password is incorrect");
        }
        throw new Error(data.error || "Failed to update password");
      }

      toast.success(data.message);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswords({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
      setOpen(false); // Close dialog on success
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className=" justify-start text-sm sm:text-base border-red-200 text-red-700 hover:bg-red-50 font-['Poppins',sans-serif]"
        >
          <Edit className="w-4 h-4 mr-2" /> Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white rounded-xl p-6 border border-teal-100/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 font-['Poppins',sans-serif]">
            Change Password
          </DialogTitle>
          <DialogDescription className="text-gray-600 font-['Poppins',sans-serif]">
            Update your password with a new, secure one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="currentPassword"
              className="text-sm font-semibold text-gray-500 uppercase tracking-wider"
            >
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.currentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={handleChange}
                className={`font-['Poppins',sans-serif] text-base ${
                  errors.currentPassword ? "border-red-500" : "border-gray-200"
                } focus:border-teal-400 focus:ring-teal-200`}
                aria-describedby="currentPassword-error"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-600"
                onClick={() => togglePasswordVisibility("currentPassword")}
                aria-label={
                  showPasswords.currentPassword
                    ? "Hide current password"
                    : "Show current password"
                }
              >
                {showPasswords.currentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            {errors.currentPassword && (
              <p id="currentPassword-error" className="text-sm text-red-500">
                {errors.currentPassword}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="newPassword"
              className="text-sm font-semibold text-gray-500 uppercase tracking-wider"
            >
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPasswords.newPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleChange}
                className={`font-['Poppins',sans-serif] text-base ${
                  errors.newPassword ? "border-red-500" : "border-gray-200"
                } focus:border-teal-400 focus:ring-teal-200`}
                aria-describedby="newPassword-error"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-600"
                onClick={() => togglePasswordVisibility("newPassword")}
                aria-label={
                  showPasswords.newPassword
                    ? "Hide new password"
                    : "Show new password"
                }
              >
                {showPasswords.newPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p id="newPassword-error" className="text-sm text-red-500">
                {errors.newPassword}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-semibold text-gray-500 uppercase tracking-wider"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`font-['Poppins',sans-serif] text-base ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-200"
                } focus:border-teal-400 focus:ring-teal-200`}
                aria-describedby="confirmPassword-error"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-600"
                onClick={() => togglePasswordVisibility("confirmPassword")}
                aria-label={
                  showPasswords.confirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showPasswords.confirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-sm text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-['Poppins',sans-serif] font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
