"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  BadgeAlert,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  TruckIcon,
  CreditCardIcon,
  HomeIcon,
  DownloadIcon,
  ArrowLeft,
  ShoppingCart,
  Share2,
} from "lucide-react";
import Confetti from "react-confetti"; // Install via npm install react-confetti for success animation
import { downloadLatestInvoice, clearError } from "@/store/slices/ordersSlice";

function OrderConfirmation() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const orders = useSelector((state) => state.orders.list);
  const { invoiceStatus, invoiceError } = useSelector((state) => state.orders);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    items: true,
    address: true,
    timeline: true,
  });

  const orderId = searchParams.get("orderId");

  const getAuthToken = () => {
    return localStorage.getItem("user-token") || "";
  };

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
        const lastOrder = orders[orders.length - 1];
        if (lastOrder && lastOrder.id === orderId) {
          setOrder(lastOrder);
        }
        setLoading(false);
      }
    };

    fetchOrder();

    // Auto-hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [orderId, orders]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md text-center">
          <BadgeAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error ||
              "It looks like there’s no recent order. Please place an order first."}
          </p>
          <Link
            href="/cart"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  const total =
    order.items?.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    ) || 0;

  // Simulated order timeline for content-rich UX
  const orderTimeline = [
    {
      step: "Order Placed",
      date: new Date().toLocaleDateString(),
      icon: CheckCircleIcon,
      color: "text-green-500",
    },
    {
      step: "Processing",
      date: "Estimated: Tomorrow",
      icon: CalendarIcon,
      color: "text-blue-500",
    },
    {
      step: "Shipped",
      date: "Estimated: In 2-3 days",
      icon: TruckIcon,
      color: "text-yellow-500",
    },
    {
      step: "Delivered",
      date: "Estimated: In 3-5 days",
      icon: HomeIcon,
      color: "text-gray-500",
    },
  ];

  // const handleDownloadInvoice = async () => {
  //   try {
  //     const resultAction = await dispatch(
  //       downloadInvoice(order.invoiceId || order.orderId)
  //     );
  //     if (downloadInvoice.fulfilled.match(resultAction)) {
  //       const link = document.createElement("a");
  //       link.href = resultAction.payload;
  //       link.download = `invoice-${order.invoiceId || order.orderId}.pdf`;
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //       window.URL.revokeObjectURL(resultAction.payload);
  //       // toast.success("Invoice downloaded successfully!");
  //     } else {
  //       // toast.error(invoiceError || "Failed to download invoice");
  //     }
  //   } catch (error) {
  //     console.error("Error downloading invoice:", error);
  //     // toast.error("An error occurred while downloading the invoice");
  //   }
  // };

  const handleOpenInvoice = async () => {
    dispatch(clearError()); // Optional: Clear any prior errors
    try {
      const result = await dispatch(downloadLatestInvoice()).unwrap();

      // Open the direct API URL in a new tab
      window.open(result.url, "_blank", "noopener,noreferrer"); // _blank for new tab, secure options
    } catch (error) {
      console.error("Failed to open invoice:", error);
      // Optional: toast.error(error.message);
    }
  };
  if (invoiceStatus === "loading") return <p>preparing download...</p>;
  if (invoiceError) return <p>Error: {invoiceError}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 relative mt-16">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />
      )}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        {" "}
        {/* Enhanced styling */}
        <div className="text-center mb-8">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl font-bold mb-2 text-gray-800">
            Order Placed Successfully!
          </h2>
          <p className="text-lg text-green-700">
            Thank you for shopping with us 🎉
          </p>
          <p className="text-sm text-gray-500 mt-2">
            An email confirmation has been sent to you.
          </p>{" "}
          {/* Content-rich addition */}
        </div>
        {/* Invoice Download Button */}
        {/* <div className="mb-6 flex justify-center">
          <button
            onClick={handleDownloadInvoice}
            disabled={invoiceStatus === "loading" || !order.invoiceId}
            className={`flex items-center px-6 py-3 rounded-md text-white transition-colors ${
              invoiceStatus === "loading" || !order.invoiceId
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <DownloadIcon className="w-5 h-5 mr-2" />
            {invoiceStatus === "loading"
              ? "Downloading..."
              : "Download Invoice"}
          </button>
          {invoiceError && (
            <p className="mt-2 text-sm text-red-500 flex items-center">
              <BadgeAlert className="w-4 h-4 mr-1" />
              {invoiceError}
            </p>
          )}
        </div> */}
        {/* Collapsible Sections for Interactivity */}
        <div className="space-y-4">
          {/* Order Details Section */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection("details")}
              className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-t-lg hover:bg-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <CreditCardIcon className="w-5 h-5 mr-2 text-blue-600" />
                Order Details
              </h3>
              {expandedSections.details ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
            {expandedSections.details && (
              <div className="p-4 text-gray-600 animate-fade-in">
                <p>
                  <strong>Order ID:</strong> {order.orderId || "N/A"}
                </p>
                <p>
                  <strong>Total:</strong> ₹{total.toFixed(2)}
                </p>{" "}
                {/* Standardized to ₹ */}
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {order.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </p>
                <div className="flex w-full justify-between">
                  <p>
                    <strong>Status:</strong> {order.status || "Pending"}
                  </p>{" "}
                  <div className="space-y-2">
                    <button
                      onClick={handleOpenInvoice}
                      disabled={invoiceStatus === "loading"}
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
      ${
        invoiceStatus === "loading"
          ? "bg-gray-300 text-gray-700 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
      }
    `}
                      aria-busy={invoiceStatus === "loading"}
                      aria-disabled={invoiceStatus === "loading"}
                      title={
                        invoiceStatus === "loading"
                          ? "Loading invoice..."
                          : "Click to open invoice"
                      }
                    >
                      {invoiceStatus === "loading" ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4 mr-2 text-white"
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
                          <DownloadIcon className="w-5 h-5 mr-2" />
                          Invoice
                        </>
                      )}
                    </button>

                    {invoiceError && (
                      <p className="flex items-center text-sm text-red-600">
                        <BadgeAlert className="w-4 h-4 mr-1" />
                        <span>{invoiceError}</span>
                      </p>
                    )}
                  </div>{" "}
                </div>
                {/* Assuming status available */}
              </div>
            )}
          </div>

          {/* Order Items Section */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection("items")}
              className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-t-lg hover:bg-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
                Items in Your Order
              </h3>
              {expandedSections.items ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
            {expandedSections.items && (
              <div className="p-4 space-y-4 animate-fade-in">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded mr-4"
                        />
                      )}{" "}
                      {/* Assuming imageUrl */}
                      <div className="flex-1">
                        <span className="block font-medium">
                          {item.name || `Product ${item.productId}`}
                        </span>
                        <span className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </span>
                      </div>
                      <span className="font-medium">
                        ₹{((item.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No items found in this order.</p>
                )}
              </div>
            )}
          </div>

          {/* Delivery Address Section */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection("address")}
              className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-t-lg hover:bg-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <HomeIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Delivery Address
              </h3>
              {expandedSections.address ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
            {expandedSections.address && (
              <div className="p-4 text-gray-600 animate-fade-in">
                {order.deliveryAddress ? (
                  <>
                    <p>
                      <strong>Name:</strong> {order.deliveryAddress.fullName}
                    </p>
                    <p>
                      <strong>Street:</strong> {order.deliveryAddress.street}
                    </p>
                    <p>
                      <strong>City/State:</strong> {order.deliveryAddress.city},{" "}
                      {order.deliveryAddress.state}{" "}
                      {order.deliveryAddress.postalCode}
                    </p>
                    <p>
                      <strong>Country:</strong> {order.deliveryAddress.country}
                    </p>
                    <p>
                      <strong>Phone:</strong> {order.deliveryAddress.phone}
                    </p>
                  </>
                ) : (
                  <p>No delivery address provided.</p>
                )}
              </div>
            )}
          </div>

          {/* Order Timeline Section */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection("timeline")}
              className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-t-lg hover:bg-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <TruckIcon className="w-5 h-5 mr-2 text-orange-600" />
                Order Timeline
              </h3>
              {expandedSections.timeline ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
            {expandedSections.timeline && (
              <div className="p-4 animate-fade-in">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                  {orderTimeline.map((item, index) => (
                    <div
                      key={index}
                      className="mb-6 flex items-center relative"
                    >
                      <div
                        className={`absolute left-0 flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 ${
                          index === 0 ? "border-green-500" : "border-gray-300"
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div className="ml-12">
                        <p className="font-medium">{item.step}</p>
                        <p className="text-sm text-gray-500">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Content-Rich Tips Section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-md font-semibold mb-2">Next Steps</h4>
          <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
            {/* <li>Track your order in real-time via the app.</li> */}
            <li>Contact support at info@ecotwist.in for any queries.</li>
            <li>Enjoy free returns within 30 days!</li>
            <li>Share your experience on social media.</li>
          </ul>
        </div>
        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Continue Shopping */}
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600/90 text-white px-6 py-3 rounded-md hover:bg-blue-700/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>

          {/* View Cart */}
          <Link
            href="/cart"
            className="flex-1 flex items-center justify-center gap-2 bg-gray-700/80 text-white px-6 py-3 rounded-md hover:bg-gray-800/90 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all backdrop-blur-sm"
          >
            <ShoppingCart className="w-5 h-5" />
            View Cart
          </Link>

          {/* Share Order */}
          <button
            onClick={() => alert("Order shared!")}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600/90 text-white px-6 py-3 rounded-md hover:bg-green-700/90 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all backdrop-blur-sm"
          >
            <Share2 className="w-5 h-5" />
            Share Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;
