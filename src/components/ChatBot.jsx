"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import { MessageCircle, X, HelpCircle, User, RefreshCw } from "lucide-react";

const chatbotData = {
  helpDesk: [
    {
      category: "Product Info",
      queries: [
        {
          question: "What products do you sell?",
          answer:
            "We offer a variety of items, including [clothing, electronics, home goods, etc.]. If you’re looking for something specific, just let us know!",
        },
        {
          question: "Where are your products made?",
          answer:
            "Our products come from all over the world. If you’re interested in a specific product's origin, I can give you more details!",
        },
        {
          question: "Do you have [product name] in stock?",
          answer:
            "Please check the product page for real-time availability. If it’s out of stock, we’ll notify you once it’s back!",
        },
      ],
    },
    {
      category: "Orders",
      queries: [
        {
          question: "Where is my order?",
          answer:
            "You can track your order in the 'Track Order' section on our website. Need help? Just send me your order number!",
        },
        {
          question: "How long does shipping take?",
          answer:
            "Shipping times depend on your location and the method you choose. Standard shipping takes about [X] business days, while expedited shipping takes [Y] business days.",
        },
        {
          question: "Do you offer free shipping?",
          answer:
            "Yes! We offer free shipping on orders over [X amount]. Check out our shipping page for more details.",
        },
      ],
    },
    {
      category: "Returns",
      queries: [
        {
          question: "What is your return policy?",
          answer:
            "We accept returns within [X] days of purchase. Please make sure the item is in original condition. For full return instructions, check our Returns page.",
        },
        {
          question: "Can I return an item if it’s on sale?",
          answer:
            "Yes! Sale items can be returned within our standard return window, as long as they meet our return criteria.",
        },
        {
          question: "How long does a refund take?",
          answer:
            "Refunds are processed within [X] business days after we receive your return. You’ll get notified when it’s done!",
        },
      ],
    },
    {
      category: "Payment",
      queries: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major credit and debit cards, PayPal, Apple Pay, and Google Pay for your convenience!",
        },
        {
          question: "Is it safe to enter my payment info?",
          answer:
            "Yes, we use secure encryption to protect your payment details, so you can shop worry-free.",
        },
        {
          question: "Do you charge sales tax?",
          answer:
            "Sales tax is applied based on your location. You’ll see the total, including tax, at checkout.",
        },
      ],
    },
    {
      category: "Account",
      queries: [
        {
          question: "How do I reset my password?",
          answer:
            "Just click 'Forgot Password?' on the login page and follow the instructions sent to your email to reset it.",
        },
        {
          question: "How do I create an account?",
          answer:
            "Simply click on 'Sign Up,' provide your email and create a password to get started. Easy as that!",
        },
        {
          question: "How can I update my account info?",
          answer:
            "You can update your details by logging in and going to 'Account Settings' in your profile.",
        },
      ],
    },
    {
      category: "Discounts",
      queries: [
        {
          question: "Do you have any discounts right now?",
          answer:
            "Check our 'Deals' page for current promotions. Or, sign up for our newsletter to get the latest discounts directly to your inbox!",
        },
        {
          question: "How do I use a promo code?",
          answer:
            "At checkout, just enter your promo code in the 'Discount Code' field to apply your discount!",
        },
        {
          question: "Can I use multiple discount codes?",
          answer:
            "We usually allow only one promo code per order. Be sure to use the one that gives you the best deal!",
        },
      ],
    },
    {
      category: "Support",
      queries: [
        {
          question: "How can I contact customer support?",
          answer:
            "You can reach us by email at [support email], or use our live chat for immediate help!",
        },
        {
          question: "How long will it take to get a response?",
          answer:
            "We aim to respond to all inquiries within 24 hours. For faster assistance, feel free to use live chat!",
        },
        {
          question: "Can I chat with a live agent?",
          answer:
            "Yes! Click the chat icon at the bottom right to chat live with one of our agents.",
        },
      ],
    },
    {
      category: "Shipping",
      queries: [
        {
          question: "How much does shipping cost?",
          answer:
            "Shipping cost depends on your location and the shipping method. You can see the total shipping cost during checkout.",
        },
        {
          question: "Do you ship internationally?",
          answer:
            "Yes, we offer international shipping to many countries. Shipping rates and times vary by destination.",
        },
        {
          question: "Can I change my shipping address?",
          answer:
            "If your order hasn’t shipped yet, we can help you update your address. Just contact us as soon as possible!",
        },
      ],
    },
    {
      category: "Product Quality",
      queries: [
        {
          question: "What should I do if my product is defective?",
          answer:
            "If your product is defective, contact us right away with details and we’ll assist you with a return or exchange.",
        },
        {
          question: "Do you offer warranties on products?",
          answer:
            "Yes, many of our products come with warranties. Please check the product page for specific warranty info.",
        },
      ],
    },
    {
      category: "General",
      queries: [
        {
          question: "Do you have a mobile app?",
          answer:
            "Yes! We have a mobile app available for download on both iOS and Android for a smoother shopping experience.",
        },
        {
          question: "Can I buy gift cards?",
          answer:
            "Yes! We offer gift cards in different denominations. You can find them on our Gift Cards page.",
        },
        {
          question: "Are your products eco-friendly?",
          answer:
            "We offer a range of eco-friendly products! Look for the eco-friendly label in product descriptions.",
        },
      ],
    },
  ],
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState(() => [
    {
      from: "bot",
      text: "Hello! How can I assist you today? Choose a category to get started.",
      quickReplies: chatbotData.helpDesk?.map((section) => section.category) || [],
      isCategory: true,
    },
  ]);
  const messagesEndRef = useRef(null);

  // Cache all queries for faster lookup
  const allQueries = useMemo(
    () =>
      chatbotData.helpDesk?.flatMap((section) =>
        section.queries.map((q) => ({ ...q, category: section.category }))
      ) || [],
    []
  );

  // Scroll to the latest message with a slight delay for DOM updates
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle category selection
  const handleCategorySelection = async (category) => {
    if (!chatbotData.helpDesk) {
      setError("No help desk data available. Please try again later.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const selectedSection = chatbotData.helpDesk.find(
        (section) => section.category === category
      );
      if (!selectedSection) {
        throw new Error("Category not found");
      }
      setMessages((prev) => [
        ...prev,
        { from: "user", text: category },
        {
          from: "bot",
          text: `Great! What's your question about ${category}?`,
          quickReplies: selectedSection.queries.map((q) => q.question) || [],
          isCategory: false,
        },
      ]);
    } catch (err) {
      setError("Failed to load category. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Oops, something went wrong. Please select another category.",
          quickReplies: chatbotData.helpDesk?.map((section) => section.category) || [],
          isCategory: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle query selection with thank you message
  const handleQuerySelection = async (question) => {
    if (!allQueries.length) {
      setError("No queries available. Please try again later.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const selectedQuery = allQueries.find((q) => q.question === question);
      if (!selectedQuery) {
        throw new Error("Question not found");
      }
      setMessages((prev) => [
        ...prev,
        { from: "user", text: question },
        {
          from: "bot",
          text: selectedQuery.answer,
          quickReplies: [],
          isCategory: false,
        },
        {
          from: "bot",
          text: "Thank you for your question! How else can I assist you?",
          quickReplies: chatbotData.helpDesk?.map((section) => section.category) || [],
          isCategory: true,
        },
      ]);
    } catch (err) {
      setError("Failed to load question. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Sorry, I couldn’t find that question. Please try another.",
          quickReplies: chatbotData.helpDesk?.map((section) => section.category) || [],
          isCategory: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset conversation
  const resetConversation = () => {
    setMessages([
      {
        from: "bot",
        text: "Hello! How can I assist you today? Choose a category to get started.",
        quickReplies: chatbotData.helpDesk?.map((section) => section.category) || [],
        isCategory: true,
      },
    ]);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen ? (
        <motion.div
          className="w-80 sm:w-[400px] bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[85vh]"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white">
            <div className="flex items-center gap-2">
              <HelpCircle size={20} />
              <h2 className="font-semibold text-base">Support Assistant</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetConversation}
                aria-label="Reset conversation"
                className="p-2 rounded-full hover:bg-emerald-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chatbot"
                className="p-2 rounded-full hover:bg-emerald-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="p-5 flex-1 overflow-y-auto flex flex-col gap-4 bg-gray-50/80 backdrop-blur-sm relative"
            role="log"
            aria-live="polite"
          >
            {/* Loading Overlay */}
            {isLoading && (
              <motion.div
                className="absolute inset-0 bg-gray-100/50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <svg
                  className="w-8 h-8 text-emerald-500 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v2m0 12v2m6-6h-2m-12 0H4"
                  />
                </svg>
              </motion.div>
            )}

            {messages.length === 0 ? (
              <div className="text-center text-sm text-gray-600">
                No messages yet.
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    className="flex flex-col max-w-full"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <div
                      className={`flex items-start gap-3 ${
                        msg.from === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Icon */}
                      {msg.from === "bot" ? (
                        <HelpCircle
                          className="text-emerald-600 flex-shrink-0"
                          size={22}
                          aria-hidden="true"
                        />
                      ) : (
                        <User
                          className="text-gray-600 flex-shrink-0 border border-gray-200 rounded-full p-1.5"
                          size={24}
                          aria-hidden="true"
                        />
                      )}

                      {/* Message bubble */}
                      <div
                        className={`p-3 rounded-2xl max-w-[80%] text-sm shadow-sm ${
                          msg.from === "user"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-white text-gray-800 border border-gray-100"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>

                    {/* Quick replies */}
                    {msg.quickReplies?.length > 0 && (
                      <AnimatePresence>
                        <motion.div
                          className="flex flex-wrap gap-2 mt-3 pl-4 pt-2 pb-3 max-w-full overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100"
                          role="group"
                          aria-label={`Quick reply options for ${
                            msg.isCategory ? "categories" : "questions"
                          }`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          {msg.quickReplies.map((reply, i) => (
                            <motion.button
                              key={`${reply}-${i}`}
                              onClick={() => {
                                if (isLoading) return;
                                msg.isCategory
                                  ? handleCategorySelection(reply)
                                  : handleQuerySelection(reply);
                              }}
                              className={`
                                relative bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs sm:text-sm 
                                px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 
                                ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 
                                focus:ring-emerald-500 focus:ring-offset-2 active:bg-emerald-200 
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${isLoading ? "cursor-wait" : "cursor-pointer"}
                              `}
                              aria-label={`Select ${reply}`}
                              aria-disabled={isLoading}
                              disabled={isLoading}
                              title={reply.length > 20 ? reply : undefined}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  if (!isLoading) {
                                    msg.isCategory
                                      ? handleCategorySelection(reply)
                                      : handleQuerySelection(reply);
                                  }
                                }
                              }}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.2, delay: i * 0.05 }}
                              whileHover={{ scale: isLoading ? 1 : 1.05 }}
                              whileTap={{ scale: isLoading ? 1 : 0.95 }}
                            >
                              <span className="truncate max-w-[160px] sm:max-w-[220px]">
                                {reply}
                              </span>
                              {isLoading && (
                                <motion.span
                                  className="absolute right-2 top-1/2 -translate-y-1/2"
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                >
                                  <svg
                                    className="w-4 h-4 text-emerald-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M12 4v2m0 12v2m6-6h-2m-12 0H4"
                                    />
                                  </svg>
                                </motion.span>
                              )}
                            </motion.button>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    )}
                    {/* Fallback for no quick replies */}
                    {!msg.quickReplies?.length && msg.from === "bot" && (
                      <motion.div
                        className="text-sm text-gray-600 mt-2 pl-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        No further options available.{" "}
                        <button
                          onClick={resetConversation}
                          className="text-emerald-600 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          aria-label="Start over"
                        >
                          Start over
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            {error && (
              <motion.div
                className="text-center text-sm text-red-600 bg-red-50 p-2 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </motion.div>
      ) : (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          aria-label="Open chatbot"
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <MessageCircle size={28} />
        </motion.button>
      )}
    </div>
  );
}