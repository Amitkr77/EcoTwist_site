"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  CheckCircleIcon,
  AlertCircle as BadgeAlert,
  CalendarIcon,
  TruckIcon,
  CreditCardIcon,
  HomeIcon,
  DownloadIcon,
  ArrowLeft,
  ShoppingCart,
  Store,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { downloadLatestInvoice, clearError } from "@/store/slices/ordersSlice";

// Utility function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

function ViewOrder() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const orders = useSelector((state) => state.orders.list);
  const { invoiceStatus, invoiceError } = useSelector((state) => state.orders);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const orderId = searchParams.get("orderId");

  const getAuthToken = () => {
    return localStorage.getItem("user-token") || "";
  };

  // Fetch order details
  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`/api/orders/${orderId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch order: ${response.status}`);
        }

        const orderData = await response.json();
        setOrder(orderData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to fetch order details.");

        // Fallback to Redux store
        const lastOrder = orders.find((o) => o.id === orderId);
        if (lastOrder) {
          setOrder(lastOrder);
        }
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, orders]);

  // Memoized invoice handler
  const handleOpenInvoice = useCallback(async () => {
    dispatch(clearError());
    try {
      const result = await dispatch(downloadLatestInvoice()).unwrap();
      window.open(result.url, "_blank", "noopener,noreferrer");
      toast.success("Invoice opened successfully!");
    } catch (error) {
      console.error("Failed to open invoice:", error);
      toast.error("Failed to download invoice.");
    }
  }, [dispatch]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-800">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 text-center">
          <BadgeAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
          <p className="text-base text-gray-600 mb-6">
            {error || "No order found. Please check your order ID."}
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all text-base font-medium"
            aria-label="Return to orders"
          >
            <ArrowLeft className="w-5 h-5" />
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const subtotal =
    order.items?.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    ) || 0;
  const total = subtotal + (order.shippingCost || 0);

  const orderTimeline = [
    {
      step: "Order Placed",
      date: new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      icon: CheckCircleIcon,
      color: "text-green-500",
    },
    {
      step: "Processing",
      date: "Est. Tomorrow",
      icon: CalendarIcon,
      color: "text-blue-500",
    },
    {
      step: "Shipped",
      date: "Est. 2-3 days",
      icon: TruckIcon,
      color: "text-yellow-500",
    },
    {
      step: "Delivered",
      date: "Est. 3-5 days",
      icon: HomeIcon,
      color: "text-purple-500",
    },
  ];

  // Dynamic timeline based on order status
  const currentStepIndex = orderTimeline.findIndex(
    (step) => step.step.toLowerCase() === order.status?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="text-base text-gray-600 mt-2">
            Order ID: {order.orderId || "N/A"}
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/3 bg-white rounded-2xl shadow-lg p-6 lg:sticky lg:top-6"
          >
            <div className="text-center mb-6">
              <CheckCircleIcon
                className={`w-16 h-16 ${
                  order.status === "Delivered" ? "text-green-500" : "text-teal-500"
                } mx-auto mb-4`}
              />
              <h2 className="text-2xl font-semibold text-gray-800">
                Order {order.status || "Pending"}
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Placed on{" "}
                {new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CreditCardIcon className="w-5 h-5 text-teal-600" />
                  Order Summary
                </h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    <strong className="font-medium">Order ID:</strong> {order.orderId || "N/A"}
                  </p>
                  <p>
                    <strong className="font-medium">Subtotal:</strong>{" "}
                    {formatCurrency(subtotal)}
                  </p>
                  <p>
                    <strong className="font-medium">Shipping:</strong>{" "}
                    {order.shippingCost ? formatCurrency(order.shippingCost) : "Free"}
                  </p>
                  <p>
                    <strong className="font-medium">Total:</strong> {formatCurrency(total)}
                  </p>
                  <p>
                    <strong className="font-medium">Payment:</strong>{" "}
                    {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                  </p>
                  <p>
                    <strong className="font-medium">Status:</strong>{" "}
                    <span
                      className={`capitalize ${
                        order.status === "Pending"
                          ? "text-yellow-600"
                          : order.status === "Delivered"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={handleOpenInvoice}
                disabled={invoiceStatus === "loading"}
                className={`w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-300 ${
                  invoiceStatus === "loading"
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
                }`}
                aria-label="Download invoice"
              >
                {invoiceStatus === "loading" ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5 text-teal-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="w-4 h-4" />
                    Download Invoice
                  </>
                )}
              </motion.button>
              {invoiceError && (
                <p className="text-red-600 text-sm flex items-center justify-center">
                  <BadgeAlert className="w-4 h-4 mr-2" />
                  {invoiceError}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 shadow-sm mt-4">
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link
                    href="/orders"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-5 py-3 rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all text-sm font-semibold w-full"
                    aria-label="View all orders"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    All Orders
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <a
                    href="mailto:info@ecotwist.in"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all text-sm font-semibold w-full"
                    aria-label="Contact support"
                  >
                    <Mail className="w-4 h-4" />
                    Help
                  </a>
                </motion.div>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <main className="lg:w-2/3 bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <button
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="lg:hidden w-full flex items-center justify-between bg-gray-100 rounded-lg p-3 mb-4 text-base font-semibold text-gray-800"
              aria-expanded={isDetailsOpen}
              aria-controls="order-details"
            >
              <span>Order Details</span>
              <svg
                className={`w-5 h-5 transition-transform ${isDetailsOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <AnimatePresence>
              {(isDetailsOpen || window.innerWidth >= 1024) && (
                <motion.div
                  id="order-details"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Items */}
                  <section className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-green-600" />
                      Order Items
                    </h2>
                    <div className="space-y-4">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all"
                          >
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name || `Product ${item.productId}`}
                                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-gray-500 text-sm">No Image</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <span className="block text-base font-medium text-gray-800">
                                {item.name || `Product ${item.productId}`}
                              </span>
                              <span className="text-sm text-gray-500">
                                Qty: {item.quantity} @ {formatCurrency(item.price || 0)} each
                              </span>
                            </div>
                            <span className="text-base font-medium text-gray-800 flex-shrink-0">
                              {formatCurrency((item.price || 0) * item.quantity)}
                            </span>
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-base text-gray-600 text-center py-4">
                          No items in this order.
                        </p>
                      )}
                    </div>
                  </section>

                  {/* Delivery Address */}
                  <section className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <HomeIcon className="w-5 h-5 text-indigo-600" />
                      Delivery Address
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                      {order.deliveryAddress ? (
                        <div className="space-y-1">
                          <p className="font-medium">{order.deliveryAddress.fullName}</p>
                          <p>{order.deliveryAddress.street}</p>
                          <p>
                            {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
                            {order.deliveryAddress.postalCode}
                          </p>
                          <p>{order.deliveryAddress.country}</p>
                          <p>Phone: {order.deliveryAddress.phone}</p>
                        </div>
                      ) : (
                        <p className="text-center">No delivery address provided.</p>
                      )}
                    </div>
                  </section>

                  {/* Timeline */}
                  <section className="mb-8" aria-label="Order Timeline">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <TruckIcon className="w-5 h-5 text-orange-600" />
                      Order Timeline
                    </h2>
                    <div className="relative overflow-x-auto">
                      <div className="absolute top-6 left-0 right-0 h-1 bg-teal-200"></div>
                      <div className="flex flex-row space-x-6 md:space-x-8 pb-4 lg:pb-0">
                        {orderTimeline.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="flex flex-col items-center relative min-w-[120px] md:min-w-[150px]"
                          >
                            <div
                              className={`absolute top-4 w-4 h-4 rounded-full ${
                                index <= currentStepIndex ? "bg-green-500" : "bg-gray-300"
                              } z-10`}
                            ></div>
                            <item.icon className={`w-5 h-5 ${item.color} mb-2 mt-8 flex-shrink-0`} />
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-800">{item.step}</p>
                              <p className="text-xs text-gray-500">{item.date}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ViewOrder;