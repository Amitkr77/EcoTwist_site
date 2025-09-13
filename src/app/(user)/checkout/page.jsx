"use client";

import { useDispatch, useSelector } from "react-redux";
import { placeOrder, clearError } from "@/store/slices/ordersSlice";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearCart } from "@/store/slices/cartSlice";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  BadgeAlert,
  CheckIcon,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast"; // Add useToast for feedback
import RazorpayPayment from "@/components/RazorpayPayment";
function CheckoutPage() {
  const { profile } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast(); // Add toast for payment feedback
  const cart = useSelector((state) => state.cart);
  const { status, error } = useSelector((state) => state.orders);

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
    promoCode: "",
    notes: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [shippingEstimate, setShippingEstimate] = useState(5.99);
  const [totalWithShipping, setTotalWithShipping] = useState(0);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  useEffect(() => {
    dispatch(clearError());
    calculateTotal();
  }, [cart, appliedPromo, shippingEstimate, dispatch]);
  useEffect(() => {
    // Pre-fill form with user profile data
    if (profile?.address) {
      setFormData((prev) => ({
        ...prev,
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        street: profile.address[0]?.street || "",
        city: profile.address[0]?.city || "",
        state: profile.address[0]?.state || "",
        postalCode: profile.address[0]?.postalCode || "",
        country: profile.address[0]?.country || "",
      }));
    }
  }, [profile]);

  const calculateTotal = () => {
    let subtotal = cart.totalPrice;
    if (appliedPromo) {
      subtotal -= subtotal * (appliedPromo.discount / 100);
    }
    setTotalWithShipping(subtotal + shippingEstimate);
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.fullName.trim())
        newErrors.fullName = "Full name is required";
      if (!formData.phone.match(/^\+?[\d\s-]{10,}$/))
        newErrors.phone = "Valid phone number is required";
      if (!formData.street.trim())
        newErrors.street = "Street address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.postalCode.trim())
        newErrors.postalCode = "Postal code is required";
      if (!formData.country.trim()) newErrors.country = "Country is required";
    } else if (step === 2) {
      if (formData.promoCode && !validatePromoCode(formData.promoCode)) {
        newErrors.promoCode = "Invalid promo code";
      }
    } else if (step === 3) {
      if (cart.totalQuantity === 0) newErrors.cart = "Your cart is empty";
      if (!formData.agreeTerms)
        newErrors.agreeTerms = "You must agree to the terms";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    if (name === "postalCode" && value.trim()) {
      estimateShipping(value);
    }
  };

  const estimateShipping = (postalCode) => {
    setShippingEstimate(postalCode.length > 5 ? 1 : 2);
  };

  const applyPromoCode = () => {
    const validCodes = {
      SAVE10: { discount: 10 },
      FREESHIP: { discount: 0, freeShipping: true },
    };
    const promo = validCodes[formData.promoCode.toUpperCase()];
    if (promo) {
      setAppliedPromo(promo);
      if (promo.freeShipping) setShippingEstimate(0);
      setErrors({ ...errors, promoCode: "" });
    } else {
      setErrors({ ...errors, promoCode: "Invalid promo code" });
    }
  };

  const validatePromoCode = (code) => {
    return ["SAVE10", "FREESHIP"].includes(code.toUpperCase());
  };

  const handleNextStep = () => {
    const validationErrors = validateStep(currentStep);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle successful Razorpay payment
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
        discountApplied: appliedPromo ? appliedPromo.discount : 0,
        totalAmount: totalWithShipping,
        paymentMethod: "online", // Override to ensure online
        paymentId, // Include paymentId in order data
      };

      const result = await dispatch(placeOrder(orderData));
      if (placeOrder.fulfilled.match(result)) {
        const orderId = result.payload.data._id; // Assuming backend returns _id
        await dispatch(clearCart());
        toast({
          title: "Payment Successful!",
          description: `Order ${orderId} placed successfully. Payment ID: ${paymentId}`,
        });
        router.push(`/new-order?orderId=${orderId}`);
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

  // Handle Razorpay payment errors
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

  // Handle Place Order (for COD or after Razorpay success)
  const handlePlaceOrder = async () => {
    const validationErrors = validateStep(3);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (formData.paymentMethod === "online") {
      // For online payment, RazorpayPayment component will trigger handleRazorpaySuccess
      // No need to dispatch placeOrder here; it’s handled in handleRazorpaySuccess
      return;
    }

    // For COD
    try {
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
        discountApplied: appliedPromo ? appliedPromo.discount : 0,
        totalAmount: totalWithShipping,
      };

      const result = await dispatch(placeOrder(orderData));
      if (placeOrder.fulfilled.match(result)) {
        const orderId = result.payload.data._id;
        await dispatch(clearCart());
        router.push(`/orders?orderId=${orderId}`);
      } else {
        setErrors({
          general: result.error?.message || "Failed to place order.",
        });
      }
    } catch (error) {
      setErrors({
        general: error.message || "An error occurred. Please try again.",
      });
    }
  };

  const steps = [
    { number: 1, label: "Cart" },
    { number: 2, label: "Shipping" },
    { number: 3, label: "Payment" },
  ];

  const renderProgressBar = () => {
    return (
      <div className="w-full px-4 sm:px-0 py-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 w-full h-1 bg-gray-300 z-0 rounded-md" />
          <div
            className="absolute top-5 left-0 h-1 bg-blue-600 z-10 rounded-md transition-all duration-500 ease-in-out"
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
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    isCompleted
                      ? "bg-blue-600 border-blue-600 text-white"
                      : isActive
                      ? "bg-white border-blue-600 text-blue-600"
                      : "bg-white border-gray-300 text-gray-400"
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
                      ? "text-blue-600 font-semibold"
                      : isCompleted
                      ? "text-gray-700"
                      : "text-gray-400"
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
    <div className="mb-8 bg-gray-50 p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Order Summary
      </h3>
      {cart.totalQuantity === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          {Object.values(cart.items).map((item) => (
            <div key={item._id} className="flex items-center mb-4">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded mr-4"
                />
              )}
              <div className="flex-1">
                <span className="block font-medium">{item.name}</span>
                <span className="text-sm text-gray-600">
                  Quantity: {item.quantity}
                </span>
              </div>
              <span className="font-medium">
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="mt-4 border-t pt-2 text-sm">
            <div className="flex justify-between mb-1">
              <span>Subtotal</span>
              <span>₹{cart.totalPrice.toFixed(2)}</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between mb-1 text-green-600">
                <span>Discount ({appliedPromo.discount}%)</span>
                <span>
                  -₹
                  {(cart.totalPrice * (appliedPromo.discount / 100)).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between mb-1">
              <span>Shipping</span>
              <span>
                {shippingEstimate === 0
                  ? "Free"
                  : `₹${shippingEstimate.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between font-semibold mt-2 border-t pt-2">
              <span>Total</span>
              <span>₹{totalWithShipping.toFixed(2)}</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Estimated delivery: 3-5 business days
          </p>
        </>
      )}
      {errors.cart && (
        <p className="mt-2 text-sm text-red-500">{errors.cart}</p>
      )}
    </div>
  );

  const renderStep1 = () => (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 p-6 bg-gray-50 rounded-lg shadow-sm animate-fade-in">
        <div className="relative">
          <label
            htmlFor="fullName"
            className="block text-sm font-semibold text-gray-900 mb-1"
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
            className={`block w-full p-3 border-2 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
              errors.fullName
                ? "border-red-400 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            aria-invalid={errors.fullName ? "true" : "false"}
          />
          {errors.fullName && (
            <p
              id="fullName-error"
              className="mt-1.5 text-sm text-red-500 flex items-center animate-slide-down"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {errors.fullName}
            </p>
          )}
        </div>
        <div className="relative lg:col-span-2">
          <label
            htmlFor="phone"
            className="block text-sm font-semibold text-gray-900 mb-1"
          >
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className={`block w-full p-3 border-2 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
              errors.phone
                ? "border-red-400 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            aria-invalid={errors.phone ? "true" : "false"}
          />
          {errors.phone && (
            <p
              id="phone-error"
              className="mt-1.5 text-sm text-red-500 flex items-center animate-slide-down"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {errors.phone}
            </p>
          )}
        </div>
        <div className="lg:col-span-2">
          <label
            htmlFor="street"
            className="block text-sm font-semibold text-gray-900 mb-1"
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
            className={`block w-full p-3 border-2 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
              errors.street
                ? "border-red-400 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            aria-describedby={errors.street ? "street-error" : undefined}
            aria-invalid={errors.street ? "true" : "false"}
          />
          {errors.street && (
            <p
              id="street-error"
              className="mt-1.5 text-sm text-red-500 flex items-center animate-slide-down"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {errors.street}
            </p>
          )}
        </div>
        <div className="relative">
          <label
            htmlFor="postalCode"
            className="block text-sm font-semibold text-gray-900 mb-1"
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
            className={`block w-full p-3 border-2 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
              errors.postalCode
                ? "border-red-400 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            aria-describedby={
              errors.postalCode ? "postalCode-error" : undefined
            }
            aria-invalid={errors.postalCode ? "true" : "false"}
          />
          {errors.postalCode && (
            <p
              id="postalCode-error"
              className="mt-1.5 text-sm text-red-500 flex items-center animate-slide-down"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {errors.postalCode}
            </p>
          )}
        </div>
        <div className="relative">
          <label
            htmlFor="city"
            className="block text-sm font-semibold text-gray-900 mb-1"
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
            className={`block w-full p-3 border-2 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
              errors.city
                ? "border-red-400 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            aria-describedby={errors.city ? "city-error" : undefined}
            aria-invalid={errors.city ? "true" : "false"}
          />
          {errors.city && (
            <p
              id="city-error"
              className="mt-1.5 text-sm text-red-500 flex items-center animate-slide-down"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {errors.city}
            </p>
          )}
        </div>
        <div className="relative">
          <label
            htmlFor="state"
            className="block text-sm font-semibold text-gray-900 mb-1"
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
            className={`block w-full p-3 border-2 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
              errors.state
                ? "border-red-400 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            aria-describedby={errors.state ? "state-error" : undefined}
            aria-invalid={errors.state ? "true" : "false"}
          />
          {errors.state && (
            <p
              id="state-error"
              className="mt-1.5 text-sm text-red-500 flex items-center animate-slide-down"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {errors.state}
            </p>
          )}
        </div>

        <div className="relative">
          <label
            htmlFor="country"
            className="block text-sm font-semibold text-gray-900 mb-1"
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
            className={`block w-full p-3 border-2 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
              errors.country
                ? "border-red-400 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            aria-describedby={errors.country ? "country-error" : undefined}
            aria-invalid={errors.country ? "true" : "false"}
          />
          {errors.country && (
            <p
              id="country-error"
              className="mt-1.5 text-sm text-red-500 flex items-center animate-slide-down"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {errors.country}
            </p>
          )}
        </div>
      </div>
      <style>
        {`
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
`}
      </style>
    </>
  );

  const renderStep2 = () => (
    <div className="animate-fade-in">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          Payment Method
        </label>
        <select
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="cod">
            Cash on Delivery (Pay when you receive your order)
          </option>
          <option value="online">
            Online Payment (Secure payment via card/UPI)
          </option>
        </select>
        <p className="mt-2 text-sm text-gray-500">
          We use secure encryption for all online payments.
        </p>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          Promo Code
        </label>
        <div className="flex">
          <input
            type="text"
            name="promoCode"
            value={formData.promoCode}
            onChange={handleChange}
            className={`mt-1 flex-1 p-2 border ${
              errors.promoCode ? "border-red-500" : "border-gray-300"
            } rounded-l-md focus:ring-blue-500 focus:border-blue-500`}
          />
          <button
            onClick={applyPromoCode}
            className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
        {errors.promoCode && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <BadgeAlert className="w-4 h-4 mr-1" />
            {errors.promoCode}
          </p>
        )}
        {appliedPromo && (
          <p className="mt-2 text-sm text-green-600 flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Promo applied successfully!
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Special Instructions
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows="3"
          placeholder="Any notes for delivery?"
        ></textarea>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-fade-in">
      {renderOrderSummary()}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleChange}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">
            I agree to the{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              terms and conditions
            </a>
          </span>
        </label>
        {errors.agreeTerms && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <BadgeAlert className="w-4 h-4 mr-1" />
            {errors.agreeTerms}
          </p>
        )}
      </div>
      {formData.paymentMethod === "online" && (
        <div className="mb-6">
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
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-md font-semibold mb-2">Checkout Tips</h4>
        <ul className="text-sm text-gray-600 list-disc pl-5">
          <li>Double-check your address for accurate delivery.</li>
          <li>Use promo codes for savings!</li>
          <li>Contact support if you have any issues.</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Secure Checkout
        </h2>
        {renderProgressBar()}
        {(errors.general || error) && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center">
            <BadgeAlert className="w-5 h-5 mr-2" />
            {errors.general || error}
          </div>
        )}
        {currentStep === 1 && (
          <h3 className="text-xl font-semibold mb-4">Shipping Address</h3>
        )}
        {currentStep === 2 && (
          <h3 className="text-xl font-semibold mb-4">Payment & Promo</h3>
        )}
        {currentStep === 3 && (
          <h3 className="text-xl font-semibold mb-4">Review & Confirm</h3>
        )}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        <div className="mt-8 flex justify-between">
          {currentStep > 1 && (
            <button
              onClick={handlePrevStep}
              className="flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              <ChevronLeftIcon className="w-5 h-5 mr-2" /> Back
            </button>
          )}
          {currentStep < 3 ? (
            <button
              onClick={handleNextStep}
              className="ml-auto flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next <ChevronRightIcon className="w-5 h-5 ml-2" />
            </button>
          ) : (
            formData.paymentMethod === "cod" && (
              <button
                onClick={handlePlaceOrder}
                disabled={
                  status === "loading" ||
                  isPaymentLoading ||
                  !formData.agreeTerms
                }
                className={`ml-auto px-6 py-2 rounded-md text-white transition-colors flex items-center ${
                  status === "loading" ||
                  isPaymentLoading ||
                  !formData.agreeTerms
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {status === "loading" || isPaymentLoading
                  ? "Placing Order..."
                  : "Place Order"}
                {status !== "loading" && !isPaymentLoading && (
                  <CheckCircleIcon className="w-5 h-5 ml-2" />
                )}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
