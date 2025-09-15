"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Helper function to get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("user-token") || "";
};

// Fetch Cart from Backend
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    const token = getAuthToken();
    if (!token) {
      // Optionally return local storage cart for guest users
      const localCart = JSON.parse(localStorage.getItem("guest-cart") || "{}");
      return localCart.cart || { items: [] }; // Return empty cart instead of rejecting
    }
    try {
      const res = await fetch("/api/cart", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error("Fetch cart error:", errorData);
        return rejectWithValue(`Failed to fetch cart: ${errorData}`);
      }

      const data = await res.json();
      return data.cart || { items: [] }; // Ensure empty cart is handled
    } catch (error) {
      console.error("Fetch cart error:", error);
      return rejectWithValue(error.message || "Failed to fetch cart");
    }
  }
);

// Add Item to Cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (product, { rejectWithValue }) => {
    const token = getAuthToken();
    if (!token) {
      // Update local storage for guest users
      const localCart = JSON.parse(localStorage.getItem("guest-cart") || "{}");
      const updatedCart = {
        items: [
          ...(localCart.cart?.items || []),
          { ...product, quantity: product.quantity || 1 },
        ],
      };
      localStorage.setItem("guest-cart", JSON.stringify({ cart: updatedCart }));
      return updatedCart;
    }
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error("Add to cart error:", errorData);
        return rejectWithValue(`Failed to add to cart: ${errorData}`);
      }
      const data = await res.json();
      return data.cart || { items: [] };
    } catch (error) {
      console.error("Add to cart error:", error);
      return rejectWithValue(error.message || "Failed to add to cart");
    }
  }
);

// Remove Item from Cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ productId, variantSku }, { rejectWithValue }) => {
    const token = getAuthToken();
    if (!token) {
      const localCart = JSON.parse(localStorage.getItem("guest-cart") || "{}");
      const updatedItems = (localCart.cart?.items || []).filter(
        (item) => !(item.productId === productId && item.variantSku === variantSku)
      );
      const updatedCart = { items: updatedItems };
      localStorage.setItem("guest-cart", JSON.stringify({ cart: updatedCart }));
      return updatedCart;
    }
    try {
      const res = await fetch(
        `/api/cart?productId=${productId}&variantSku=${variantSku}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        const errorData = await res.text();
        console.error("Remove from cart error:", errorData);
        return rejectWithValue(`Failed to remove item: ${errorData}`);
      }
      const data = await res.json();
      return data.cart || { items: [] };
    } catch (error) {
      console.error("Remove from cart error:", error);
      return rejectWithValue(error.message || "Failed to remove item");
    }
  }
);

// Update Cart Item Quantity
export const updateCart = createAsyncThunk(
  "cart/updateCart",
  async ({ productId, variantSku, quantity }, { rejectWithValue }) => {
    const token = getAuthToken();
    if (!token) {
      const localCart = JSON.parse(localStorage.getItem("guest-cart") || "{}");
      const updatedItems = (localCart.cart?.items || []).map((item) =>
        item.productId === productId && item.variantSku === variantSku
          ? { ...item, quantity }
          : item
      );
      const updatedCart = { items: updatedItems };
      localStorage.setItem("guest-cart", JSON.stringify({ cart: updatedCart }));
      return updatedCart;
    }
    try {
      const res = await fetch(`/api/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, variantSku, quantity }),
      });
      if (!res.ok) {
        const errorData = await res.text();
        console.error("Update cart error:", errorData);
        return rejectWithValue(`Failed to update item: ${errorData}`);
      }
      const data = await res.json();
      return data.cart || { items: [] };
    } catch (error) {
      console.error("Update cart error:", error);
      return rejectWithValue(error.message || "Failed to update item");
    }
  }
);

// Clear Cart
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    const token = getAuthToken();
    if (!token) {
      localStorage.removeItem("guest-cart");
      return { items: [] };
    }
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.text();
        console.error("Clear cart error:", errorData);
        return rejectWithValue(`Failed to clear cart: ${errorData}`);
      }
      const data = await res.json();
      return data.cart || { items: [] };
    } catch (error) {
      console.error("Clear cart error:", error);
      return rejectWithValue(error.message || "Failed to clear cart");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    status: "idle",
    totalPrice: 0,
    totalQuantity: 0,
    error: null,
  },
  reducers: {
    resetError: (state) => {
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.totalPrice = action.payload.items
          ? action.payload.items.reduce(
              (total, item) => total + (item.price || 0) * (item.quantity || 0),
              0
            )
          : 0;
        state.totalQuantity = action.payload.items
          ? action.payload.items.reduce(
              (total, item) => total + (item.quantity || 0),
              0
            )
          : 0;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch cart";
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.totalPrice = action.payload.items
          ? action.payload.items.reduce(
              (total, item) => total + (item.price || 0) * (item.quantity || 0),
              0
            )
          : 0;
        state.totalQuantity = action.payload.items
          ? action.payload.items.reduce(
              (total, item) => total + (item.quantity || 0),
              0
            )
          : 0;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to add to cart";
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.totalPrice = action.payload.items
          ? action.payload.items.reduce(
              (total, item) => total + (item.price || 0) * (item.quantity || 0),
              0
            )
          : 0;
        state.totalQuantity = action.payload.items
          ? action.payload.items.reduce(
              (total, item) => total + (item.quantity || 0),
              0
            )
          : 0;
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to remove item";
      })
      // Update Cart
      .addCase(updateCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.totalPrice = action.payload.items
          ? action.payload.items.reduce(
              (total, item) => total + (item.price || 0) * (item.quantity || 0),
              0
            )
          : 0;
        state.totalQuantity = action.payload.items
          ? action.payload.items.reduce(
              (total, item) => total + (item.quantity || 0),
              0
            )
          : 0;
        state.error = null;
      })
      .addCase(updateCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update item";
      })
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.status = "succeeded";
        state.items = [];
        state.totalPrice = 0;
        state.totalQuantity = 0;
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to clear cart";
      });
  },
});

export const { resetError } = cartSlice.actions;
export default cartSlice.reducer;