"use client";

import { useDispatch, useSelector } from "react-redux";
import { placeOrder, clearError } from "@/store/slices/ordersSlice";
import { fetchCart, clearCart } from "@/store/slices/cartSlice"; // Fix 2: Added fetchCart import
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CheckIcon,
  Home,
  ChevronRight,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RazorpayPayment from "@/components/RazorpayPayment";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

// Configuration for currency and shipping (Fix 6)
const CURRENCY = "₹";
const SHIPPING_THRESHOLD = 499;
const SHIPPING_COST = 69;

function CheckoutPage() {
  const { profile } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const cart = useSelector((state) => state.cart);
  const { status, error } = useSelector((state) => state.orders); // Fix 1: Use error instead of orderError
  const { status: cartStatus, error: cartError } = useSelector(
    (state) => state.cart
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    paymentMethod: "cod",
    notes: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [shippingEstimate, setShippingEstimate] = useState(0);
  const [totalWithShipping, setTotalWithShipping] = useState(0);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false); // Simplified initialization

  useEffect(() => {
    // Fix 3: Fetch cart only on mount
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    // Pre-fill form with user profile data
    if (profile?.address) {
      setFormData((prev) => ({
        ...prev,
        fullName: profile.fullName || "",
        phone: profile.address[0]?.phone || profile.phone || "",
        street: profile.address[0]?.street || "",
        city: profile.address[0]?.city || "",
        state: profile.address[0]?.state || "",
        postalCode: profile.address[0]?.postalCode || "",
        country: profile.address[0]?.country || "",
      }));
    }
    calculateTotal();
  }, [profile, cart]);

  useEffect(() => {
    setIsAlertOpen(!!errors.general || !!error || !!cartError);
  }, [errors.general, error, cartError]);

  const handleCloseAlert = () => {
    setIsAlertOpen(false);
    dispatch(clearError());
    setErrors((prev) => ({ ...prev, general: "" }));
  };

  const calculateTotal = () => {
    const subtotal = cart.totalPrice || 0;
    const estimatedShipping =
      subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    setShippingEstimate(estimatedShipping);
    setTotalWithShipping(subtotal + estimatedShipping);
  };

  const validateStep = (step) => {
    const newErrors = {};
    // Fix 9: Check cart in all steps
    if (cart.totalQuantity === 0) {
      newErrors.cart = "Your cart is empty. Please add items to proceed.";
      router.push("/cart");
    }
    if (step === 1) {
      if (!formData.fullName.trim())
        newErrors.fullName = "Full name is required";
      // Fix 4: Stricter phone number validation (e.g., Indian format)
      if (!formData.phone.match(/^\+91[6-9]\d{9}$/))
        newErrors.phone =
          "Valid Indian phone number is required (e.g., +91XXXXXXXXXX)";
      if (!formData.street.trim())
        newErrors.street = "Street address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.postalCode.match(/^\d{6}$/))
        newErrors.postalCode = "Valid 6-digit postal code is required";
      if (!formData.country.trim()) newErrors.country = "Country is required";
    } else if (step === 3) {
      if (!formData.agreeTerms)
        newErrors.agreeTerms = "You must agree to the terms and conditions";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Fix 5: Clear specific field error
  };

  const handleNextStep = () => {
    const validationErrors = validateStep(currentStep);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({}); // Fix 5: Clear all form errors on successful validation
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    setErrors({}); // Fix 5: Clear errors when going back
  };

  const handleRazorpaySuccess = async (paymentId) => {
    try {
      setIsPaymentLoading(true);
      const orderData = {
        ...formData,
        products: Object.values(cart.items).map((item) => ({
          productId: item._id,
          variantSku: item.variantSku,
          quantity: item.quantity,
          title: item.name,
          price: item.price,
          imageUrl: item.imageUrl || null,
        })),
        shippingCost: shippingEstimate,
        totalAmount: totalWithShipping,
        paymentMethod: "online",
        paymentId,
      };

      const result = await dispatch(placeOrder(orderData));
      if (placeOrder.fulfilled.match(result)) {
        const orderId = result.payload.data._id;
        await dispatch(clearCart());
        toast({
          title: "Payment Successful!",
          description: `Order ${orderId} placed successfully. Payment ID: ${paymentId}`,
        });
        router.push(`/orders?orderId=${orderId}`);
      } else {
        throw new Error(result.error?.message || "Failed to place order");
      }
    } catch (error) {
      setErrors({
        general: error.message || "Failed to place order after payment.",
      });
      toast({
        title: "Order Error",
        description: error.message || "Failed to place order after payment.",
        variant: "destructive",
      });
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleRazorpayError = (error) => {
    setErrors({
      general: error.message || "Payment failed. Please try again.",
    });
    toast({
      title: "Payment Failed",
      description: error.message || "Please try again later.",
      variant: "destructive",
    });
    setIsPaymentLoading(false);
  };

  const handlePlaceOrder = async () => {
    const validationErrors = validateStep(3);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (formData.paymentMethod === "online") {
      return;
    }

    // Fix 7: Add loading state for COD
    try {
      setIsPaymentLoading(true);
      const orderData = {
        ...formData,
        products: Object.values(cart.items).map((item) => ({
          productId: item._id,
          variantSku: item.variantSku,
          quantity: item.quantity,
          title: item.name,
          price: item.price,
          imageUrl: item.imageUrl || null,
        })),
        shippingCost: shippingEstimate,
        totalAmount: totalWithShipping,
      };

      const result = await dispatch(placeOrder(orderData));
      if (placeOrder.fulfilled.match(result)) {
        const orderId = result.payload.data._id;
        await dispatch(clearCart());
        toast({
          title: "Order Placed!",
          description: `Order ${orderId} placed successfully.`,
        });
        router.push(`/orders?orderId=${orderId}`);
      } else {
        throw new Error(result.error?.message || "Failed to place order.");
      }
    } catch (error) {
      setErrors({
        general: error.message || "An error occurred. Please try again.",
      });
      toast({
        title: "Order Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const steps = [
    { number: 1, label: "Shipping" },
    { number: 2, label: "Payment" },
    { number: 3, label: "Review" },
  ];

  const renderProgressBar = () => {
    return (
      <div className="w-full px-4 sm:px-0 py-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 w-full h-1 bg-gray-200/50 dark:bg-gray-700/50 z-0 rounded-full" />
          <div
            className="absolute top-5 left-0 h-1 bg-emerald-500 dark:bg-emerald-600 z-10 rounded-full transition-all duration-500 ease-in-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.number;
            const isActive = currentStep === step.number;

            return (
              <div
                key={step.number}
                className="relative z-20 flex flex-col items-center flex-1"
              >
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-300 shadow-sm ${
                    isCompleted
                      ? "bg-emerald-500 dark:bg-emerald-600 border-emerald-500 dark:border-emerald-600 text-white"
                      : isActive
                      ? "bg-white dark:bg-gray-800 border-emerald-500 dark:border-emerald-600 text-emerald-500 dark:text-emerald-400"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div
                  className={`mt-2 text-xs sm:text-sm text-center ${
                    isActive
                      ? "text-emerald-500 dark:text-emerald-400 font-semibold"
                      : isCompleted
                      ? "text-gray-700 dark:text-gray-300"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderOrderSummary = () => (
    <div className="bg-white/95 dark:bg-gray-800/95 p-6 rounded-xl shadow-md border border-emerald-200/50 dark:border-emerald-700/50">
      <h3 className="text-lg font-semibold mb-4 text-emerald-700 dark:text-emerald-300">
        Order Summary
      </h3>
      {cartStatus === "loading" ? (
        <p className="text-gray-600 dark:text-gray-400">Loading cart...</p>
      ) : cartError ? (
        <p className="text-red-500 flex items-center">
          <AlertCircleIcon className="w-4 h-4 mr-2" />
          Error loading cart: {cartError}
        </p>
      ) : cart.totalQuantity === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">Your cart is empty.</p>
      ) : (
        <>
          {Object.values(cart.items).map((item) => (
            <div key={item._id} className="flex items-start mb-4">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg mr-4 shadow-sm"
                />
              )}
              <div className="flex-1">
                <span className="block font-medium text-gray-800 dark:text-gray-200">
                  {item.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Quantity: {item.quantity}
                </span>
              </div>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {CURRENCY}
                {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="mt-4 border-t pt-4 text-sm border-emerald-200 dark:border-emerald-700">
            <div className="flex justify-between mb-2 text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>
                {CURRENCY}
                {cart.totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between mb-2 text-gray-600 dark:text-gray-400">
              <span>Shipping</span>
              <span>
                {shippingEstimate === 0 ? (
                  <>
                    <span className="line-through text-gray-400 dark:text-gray-500 mr-1">
                      {CURRENCY}
                      {SHIPPING_COST}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      FREE
                    </span>
                  </>
                ) : (
                  `${CURRENCY}${shippingEstimate.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between font-semibold mt-2 border-t pt-3 text-gray-800 dark:text-gray-200 border-emerald-200 dark:border-emerald-700">
              <span>Total</span>
              <span>
                {CURRENCY}
                {totalWithShipping.toFixed(2)}
              </span>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2 text-emerald-500 dark:text-emerald-400" />
            Estimated delivery: 3-5 business days
          </p>
        </>
      )}
      {errors.cart && (
        <p className="mt-4 text-sm text-red-500 flex items-center">
          <AlertCircleIcon className="w-4 h-4 mr-2" />
          {errors.cart}
        </p>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 animate-fade-in">
      <div className="relative">
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          required // Fix 8: Add accessibility
          className={`block w-full p-3 border text-gray-900 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200 shadow-sm ${
            errors.fullName
              ? "border-red-300 bg-red-50 dark:bg-red-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500"
          }`}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          aria-invalid={errors.fullName ? "true" : "false"}
          aria-required="true" // Fix 8
        />
        {errors.fullName && (
          <p
            id="fullName-error"
            className="mt-2 text-sm text-red-500 flex items-center animate-slide-down"
          >
            <AlertCircleIcon className="w-4 h-4 mr-1" />
            {errors.fullName}
          </p>
        )}
      </div>
      <div className="relative">
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+91XXXXXXXXXX"
          required // Fix 8
          className={`block w-full p-3 border text-gray-900 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200 shadow-sm ${
            errors.phone
              ? "border-red-300 bg-red-50 dark:bg-red-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500"
          }`}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          aria-invalid={errors.phone ? "true" : "false"}
          aria-required="true" // Fix 8
        />
        {errors.phone && (
          <p
            id="phone-error"
            className="mt-2 text-sm text-red-500 flex items-center animate-slide-down"
          >
            <AlertCircleIcon className="w-4 h-4 mr-1" />
            {errors.phone}
          </p>
        )}
      </div>
      <div className="relative sm:col-span-2">
        <label
          htmlFor="street"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Street Address
        </label>
        <input
          type="text"
          id="street"
          name="street"
          value={formData.street}
          onChange={handleChange}
          placeholder="Enter your street address"
          required // Fix 8
          className={`block w-full p-3 border text-gray-900 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200 shadow-sm ${
            errors.street
              ? "border-red-300 bg-red-50 dark:bg-red-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500"
          }`}
          aria-describedby={errors.street ? "street-error" : undefined}
          aria-invalid={errors.street ? "true" : "false"}
          aria-required="true" // Fix 8
        />
        {errors.street && (
          <p
            id="street-error"
            className="mt-2 text-sm text-red-500 flex items-center animate-slide-down"
          >
            <AlertCircleIcon className="w-4 h-4 mr-1" />
            {errors.street}
          </p>
        )}
      </div>
      <div className="relative">
        <label
          htmlFor="city"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          City
        </label>
        <input
          type="text"
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="Enter your city"
          required // Fix 8
          className={`block w-full p-3 border text-gray-900 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200 shadow-sm ${
            errors.city
              ? "border-red-300 bg-red-50 dark:bg-red-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500"
          }`}
          aria-describedby={errors.city ? "city-error" : undefined}
          aria-invalid={errors.city ? "true" : "false"}
          aria-required="true" // Fix 8
        />
        {errors.city && (
          <p
            id="city-error"
            className="mt-2 text-sm text-red-500 flex items-center animate-slide-down"
          >
            <AlertCircleIcon className="w-4 h-4 mr-1" />
            {errors.city}
          </p>
        )}
      </div>
      <div className="relative">
        <label
          htmlFor="state"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          State
        </label>
        <input
          type="text"
          id="state"
          name="state"
          value={formData.state}
          onChange={handleChange}
          placeholder="Enter your state"
          required // Fix 8
          className={`block w-full p-3 border text-gray-900 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200 shadow-sm ${
            errors.state
              ? "border-red-300 bg-red-50 dark:bg-red-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500"
          }`}
          aria-describedby={errors.state ? "state-error" : undefined}
          aria-invalid={errors.state ? "true" : "false"}
          aria-required="true" // Fix 8
        />
        {errors.state && (
          <p
            id="state-error"
            className="mt-2 text-sm text-red-500 flex items-center animate-slide-down"
          >
            <AlertCircleIcon className="w-4 h-4 mr-1" />
            {errors.state}
          </p>
        )}
      </div>
      <div className="relative">
        <label
          htmlFor="postalCode"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Postal Code
        </label>
        <input
          type="text"
          id="postalCode"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          placeholder="Enter your postal code"
          required // Fix 8
          className={`block w-full p-3 border text-gray-900 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200 shadow-sm ${
            errors.postalCode
              ? "border-red-300 bg-red-50 dark:bg-red-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500"
          }`}
          aria-describedby={errors.postalCode ? "postalCode-error" : undefined}
          aria-invalid={errors.postalCode ? "true" : "false"}
          aria-required="true" // Fix 8
        />
        {errors.postalCode && (
          <p
            id="postalCode-error"
            className="mt-2 text-sm text-red-500 flex items-center animate-slide-down"
          >
            <AlertCircleIcon className="w-4 h-4 mr-1" />
            {errors.postalCode}
          </p>
        )}
      </div>
      <div className="relative">
        <label
          htmlFor="country"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Country
        </label>
        <input
          type="text"
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="Enter your country"
          required // Fix 8
          className={`block w-full p-3 border text-gray-900 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200 shadow-sm ${
            errors.country
              ? "border-red-300 bg-red-50 dark:bg-red-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500"
          }`}
          aria-describedby={errors.country ? "country-error" : undefined}
          aria-invalid={errors.country ? "true" : "false"}
          aria-required="true" // Fix 8
        />
        {errors.country && (
          <p
            id="country-error"
            className="mt-2 text-sm text-red-500 flex items-center animate-slide-down"
          >
            <AlertCircleIcon className="w-4 h-4 mr-1" />
            {errors.country}
          </p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="p-6 bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-md border border-emerald-200/50 dark:border-emerald-700/50 animate-fade-in space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Payment Method
        </h4>
        <div className="space-y-4">
          <label className="flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md has-[:checked]:border-emerald-500 dark:has-[:checked]:border-emerald-400 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/20">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={formData.paymentMethod === "cod"}
              onChange={handleChange}
              className="mt-1 mr-3 accent-emerald-500 dark:accent-emerald-400"
              aria-checked={formData.paymentMethod === "cod"}
            />
            <div>
              <span className="block font-medium text-gray-800 dark:text-gray-200">
                Cash on Delivery
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pay when you receive your order
              </p>
            </div>
          </label>
          <label className="flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md has-[:checked]:border-emerald-500 dark:has-[:checked]:border-emerald-400 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/20">
            <input
              type="radio"
              name="paymentMethod"
              value="online"
              checked={formData.paymentMethod === "online"}
              onChange={handleChange}
              className="mt-1 mr-3 accent-emerald-500 dark:accent-emerald-400"
              aria-checked={formData.paymentMethod === "online"}
            />
            <div>
              <span className="block font-medium text-gray-800 dark:text-gray-200">
                Online Payment
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Secure payment via card/UPI/Wallet
              </p>
            </div>
          </label>
        </div>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <CheckCircleIcon className="w-4 h-4 mr-2 text-emerald-500 dark:text-emerald-400" />
          All payments are secure and encrypted.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="p-6 bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-md border border-emerald-200/50 dark:border-emerald-700/50">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Final Confirmation
        </h4>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleChange}
            className="mr-3 accent-emerald-500 dark:accent-emerald-400"
            aria-checked={formData.agreeTerms}
            required // Fix 8
            aria-required="true" // Fix 8
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            I agree to the{" "}
            <a
              href="/terms"
              className="text-emerald-500 dark:text-emerald-400 hover:underline font-medium"
            >
              terms and conditions
            </a>
          </span>
        </label>
        {errors.agreeTerms && (
          <p className="mt-2 text-sm text-red-500 flex items-center">
            <AlertCircleIcon className="w-4 h-4 mr-2" />
            {errors.agreeTerms}
          </p>
        )}
      </div>

      {formData.paymentMethod === "online" && (
        <div className="p-6 bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-md border border-emerald-200/50 dark:border-emerald-700/50">
          <RazorpayPayment
            amount={totalWithShipping}
            onSuccess={handleRazorpaySuccess}
            onError={handleRazorpayError}
            deliveryAddress={formData}
            disabled={
              status === "loading" || isPaymentLoading || !formData.agreeTerms
            }
          />
        </div>
      )}

      <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
        <h4 className="text-md font-semibold mb-3 text-emerald-700 dark:text-emerald-300">
          Checkout Tips
        </h4>
        <ul className="text-sm text-emerald-700 dark:text-emerald-300 list-disc pl-5 space-y-1">
          <li>Double-check your address for accurate delivery.</li>
          <li>Contact support if you have any issues.</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 dark:from-green-800 dark:via-emerald-800 dark:to-teal-900 relative text-white pt-10 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-emerald-900/20 to-teal-900/20 z-[-1]"></div>
      <motion.div
        className="absolute top-20 left-10 w-24 h-24 bg-white/15 rounded-full backdrop-blur-sm border border-white/20"
        animate={{
          y: [0, -30, 0],
          rotate: [0, 180, 360],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-32 h-32 bg-white/20 rounded-full backdrop-blur-sm border border-white/30"
        animate={{
          y: [0, 30, 0],
          rotate: [0, -180, -360],
          scale: [1, 0.95, 1],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-8 w-16 h-16 bg-emerald-200/25 rounded-full backdrop-blur-sm"
        animate={{ x: [-15, 15, -15], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-10 w-20 h-20 bg-teal-100/20 rounded-full backdrop-blur-sm"
        animate={{
          x: [10, -10, 10],
          y: [0, -10, 0],
          opacity: [0.6, 0.3, 0.6],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <AnimatePresence>
        {(errors.general || error || cartError) && isAlertOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md"
          >
            <Alert
              variant="destructive"
              className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 shadow-lg"
            >
              <AlertCircleIcon className="h-5 w-5" />
              <AlertTitle className="text-red-700 dark:text-red-300 font-semibold">
                Error
              </AlertTitle>
              <AlertDescription className="text-red-600 dark:text-red-200">
                {errors.general || error || cartError}
              </AlertDescription>
              <button
                onClick={handleCloseAlert}
                className="absolute top-2 right-2 text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-5xl mx-auto">
        <div className=" pb-6 pr-8">
          <div className=" flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center text-sm md:text-base"
            >
              <ol className="flex items-center space-x-2">
                <li>
                  <Link
                    href="/"
                    className="flex items-center text-white transition-colors duration-200"
                  >
                    <Home className="w-5 h-5 mr-1" aria-hidden="true" />
                    <span className="hidden sm:inline">Home</span>
                    <span className="sr-only">Go to homepage</span>
                  </Link>
                </li>
                <li>
                  <ChevronRight
                    className="w-4 h-4 text-white"
                    aria-hidden="true"
                  />
                </li>
                <li>
                  <Link
                    href="/cart"
                    className="text-white transition-colors duration-200"
                  >
                    Cart
                  </Link>
                </li>
                <li>
                  <ChevronRight
                    className="w-4 h-4 text-white"
                    aria-hidden="true"
                  />
                </li>
                <li>
                  <span
                    className="text-green-600 dark:text-green-400 font-medium"
                    aria-current="page"
                  >
                    Checkout
                  </span>
                </li>
              </ol>
            </nav>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center md:justify-end"
            >
              <Lock
                className="w-6 h-6 mr-2 text-white dark:text-green-400"
                aria-hidden="true"
              />
              Secure Checkout
            </motion.h2>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
            {renderProgressBar()}
            {(errors.general || error) && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
                <AlertCircleIcon className="w-5 h-5 mr-3" />
                {errors.general || error}
              </div>
            )}
            {currentStep === 1 && (
              <>
                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                  Shipping Address
                </h3>
                {renderStep1()}
              </>
            )}
            {currentStep === 2 && (
              <>
                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                  Payment Details
                </h3>
                {renderStep2()}
              </>
            )}
            {currentStep === 3 && (
              <>
                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                  Review & Confirm
                </h3>
                {renderStep3()}
              </>
            )}
            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevStep}
                  className="flex items-center px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
                >
                  <ChevronLeftIcon className="w-5 h-5 mr-2" /> Back
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="ml-auto flex items-center px-6 py-3 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 dark:from-green-800 dark:via-emerald-800 dark:to-teal-900 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  disabled={cartStatus === "loading" || isPaymentLoading} // Fix 7
                >
                  Next <ChevronRightIcon className="w-5 h-5 ml-2" />
                </button>
              ) : (
                formData.paymentMethod === "cod" && (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={
                      cartStatus === "loading" ||
                      isPaymentLoading ||
                      !formData.agreeTerms
                    }
                    className={`ml-auto px-6 py-3 rounded-lg text-white transition-colors flex items-center shadow-sm ${
                      cartStatus === "loading" ||
                      isPaymentLoading ||
                      !formData.agreeTerms
                        ? "bg-indigo-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {cartStatus === "loading" || isPaymentLoading
                      ? "Placing Order..."
                      : "Place Order"}
                    {cartStatus !== "loading" && !isPaymentLoading && (
                      <CheckCircleIcon className="w-5 h-5 ml-2" />
                    )}
                  </button>
                )
              )}
            </div>
          </div>
          <div className="lg:sticky lg:top-24 lg:self-start">
            {renderOrderSummary()}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default CheckoutPage;
