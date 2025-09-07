"use client";

import { authApi, getAuthToken } from "@/lib/authApi";
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState();
  const [error, setError] = useState(null);

  // Fetch cart and user
  useEffect(() => {
    const fetchCartAndUser = async () => {
      const token = getAuthToken();
      if (!token) {
        console.warn("No token found. Skipping cart fetch.");
        setIsHydrated(true);
        return;
      }

      try {
        const response = await authApi("get", "/api/cart");
        if (!response?.data?.cart) {
          throw new Error("Invalid cart response");
        }
        const { items = [], userId } = response.data.cart;
        setCartItems(items);
        setUser(userId);
      } catch (error) {
        setError("Failed to load cart. Please try again.");
        console.error("Error fetching cart and user:", error);
      } finally {
        setIsHydrated(true);
      }
    };

    fetchCartAndUser();
  }, []);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      const token = getAuthToken();
      if (!token) {
        console.warn("No token found. Skipping orders fetch.");
        return;
      }

      try {
        const response = await authApi("get", "/api/orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const addToCart = async (productId, variantSku, quantity = 1) => {
    const token = getAuthToken();
    if (!token) {
      setError("Please log in to add items to cart.");
      return;
    }

    try {
      const response = await authApi("post", "/api/cart", {
        productId,
        variantSku,
        quantity,
      });
      setCartItems(response.data.cart.items);
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const removeFromCart = async (productId, variantSku) => {
    const token = getAuthToken();
    if (!token) {
      setError("Please log in to add items to cart.");
      return;
    }

    try {
      const response = await authApi(
        "delete",
        `/api/cart/${productId}/${variantSku}`
      );
      setCartItems(response.data.cart.items);
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const updateQuantity = async (productId, variantSku, quantity) => {
    const token = getAuthToken();
    if (!token) return;

    if (quantity <= 0) {
      console.warn("Quantity must be greater than zero.");
      return;
    }

    try {
      const response = await authApi("put", "/api/cart", {
        productId,
        variantSku,
        quantity,
      });

      if (response.status === 200 && response.data?.cart?.items) {
        setCartItems(response.data.cart.items);
        console.log("Cart updated successfully.");
      } else {
        console.warn("Unexpected response structure:", response);
      }
    } catch (error) {
      console.error("Error updating item quantity:", error);
    }
  };

  const clearCart = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      await authApi("delete", "/api/cart");
      setCartItems([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const placeOrder = async (deliveryAddress, paymentMethod) => {
    const token = getAuthToken();
    if (!token) {
      console.error("Please log in to place an order");
      setError("Please log in to place an order.");
      return;
    }

    try {
      const response = await authApi("post", "/api/orders", {
        products: cartItems,
        deliveryAddress,
        paymentMethod,
      });
      if (!response?.data?.orderId) {
        throw new Error("Invalid order response");
      }
      setOrders((prevOrders) => [...prevOrders, response.data.orderId]);
      clearCart();
      return response.data.orderId;
    } catch (error) {
      setError("Failed to place order. Please try again.");
      console.error("Error placing order:", error);
      throw error; 
    }
  };

  return (
    <CartContext.Provider
      value={{
        user,
        cartItems,
        orders,
        isHydrated,
        setError,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
