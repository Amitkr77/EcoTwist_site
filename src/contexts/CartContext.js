"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

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
  const [user, setUser] = useState()

  // Fetch cart items on initial load
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get("/api/cart", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("user-token")}`,
          },
        });
        setCartItems(response.data.cart.items);
        setIsHydrated(true);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setIsHydrated(true);
      }
    };

    fetchCart();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/cart', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("user-token")}`
          }
        })
        setUser(response.data.cart.userId)
        setIsHydrated(true)
      } catch (error) {
        console.error("Error fetching user:", error);
        setIsHydrated(true);
      }
    }
    fetchUser();
  }, [])

  // Fetch orders on initial load
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("user-token")}`,
          },
        });
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // Add item to cart
  const addToCart = async (productId, variantSku, quantity = 1) => {
    try {
      const response = await axios.post(
        "/api/cart",
        { productId, variantSku, quantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("user-token")}`,
          },
        }
      );
      setCartItems(response.data.cart.items);
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId, variantSku) => {
    try {
      const response = await axios.delete(`/api/cart/${productId}/${variantSku}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("user-token")}`,
        },
      });
      setCartItems(response.data.cart.items);
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  // Update item quantity in cart
  const updateQuantity = async (productId, variantSku, quantity) => {
    try {
      const response = await axios.put(
        "/api/cart",
        { productId, variantSku, quantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("user-token")}`,
          },
        }
      );
      setCartItems(response.data.cart.items);
    } catch (error) {
      console.error("Error updating item quantity:", error);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      await axios.delete("/api/cart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("user-token")}`,
        },
      });
      setCartItems([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  // Get total price
  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Get total items in cart
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Place order
  const placeOrder = async (deliveryAddress, paymentMethod) => {
    try {
      const response = await axios.post(
        "/api/orders",
        {
          products: cartItems,
          deliveryAddress,
          paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("user-token")}`,
          },
        }
      );
      setOrders((prevOrders) => [...prevOrders, response.data.orderId]);
      clearCart();
      return response.data.orderId;
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        user,
        cartItems,
        orders,
        isHydrated,
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
