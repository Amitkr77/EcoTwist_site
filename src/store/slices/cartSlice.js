"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Helper function to normalize ID to string
const normalizeId = (id) => String(id?._id || id);

// Helper function to get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("user-token") || "";
};

// Helper function to enrich cart items with product data
const enrichCartItems = (items, productsById) => {
  if (!items || !Array.isArray(items)) return [];

  return items.map((item) => {
    const id = normalizeId(item.productId);
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Invalid productId for enrichment:", item.productId);
      }
      return {
        ...item,
        productId: "unknown",
        name: item.name || "Product not found",
        price: typeof item.price === "number" ? item.price : 0,
        images: Array.isArray(item.images) ? item.images : ["/product_image.png"],
        description: item.description || "",
        variantName: item.variantName || "",
        quantity: item.quantity || 1,
      };
    }

    // If item already has necessary fields, return as is
    if (
      item.name &&
      typeof item.price === "number" &&
      item.price >= 0 &&
      Array.isArray(item.images) &&
      item.images.length > 0
    ) {
      return { ...item, productId: id, quantity: item.quantity || 1 };
    }

    const product = productsById[id];
    if (!product) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Product not found for enrichment:", id);
      }
      return {
        ...item,
        productId: id,
        name: item.name || "Product not found",
        price: typeof item.price === "number" ? item.price : 0,
        images: Array.isArray(item.images) ? item.images : ["/product_image.png"],
        description: item.description || "",
        variantName: item.variantName || "",
        quantity: item.quantity || 1,
      };
    }

    const variant = product.variants?.find((v) => v.sku === item.variantSku);
    const firstImage = product.images?.[0]?.url || "/product_image.png";

    const enrichedItem = {
      ...item,
      productId: id,
      name: product.name || "Unnamed Product",
      description: product.description || "",
      images: product.images?.map((img) => img.url) || [firstImage],
      price:
        typeof variant?.price === "number"
          ? variant.price
          : typeof product.variants?.[0]?.price === "number"
            ? product.variants[0].price
            : 0,
      variantName: variant?.name || variant?.sku || "",
      stock: product.stock || 999,
      quantity: item.quantity || 1,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("Enriched cart item:", enrichedItem);
    }
    return enrichedItem;
  });
};

// Helper function to save to localStorage safely
const saveToLocalStorage = (cartItems) => {
  try {
    localStorage.setItem(
      "guest-cart",
      JSON.stringify({
        cart: { items: cartItems },
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

// Helper function to load from localStorage with expiration
const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem("guest-cart");
    if (!data) return null;
    const parsed = JSON.parse(data);
    const age = Date.now() - parsed.timestamp;
    if (age > 7 * 24 * 60 * 60 * 1000) {
      // Expire after 7 days
      if (process.env.NODE_ENV === "development") {
        console.warn("Expired guest cart - clearing");
      }
      localStorage.removeItem("guest-cart");
      return null;
    }
    return (
      parsed?.cart?.items?.map((item) => ({
        ...item,
        productId: normalizeId(item.productId),
      })) || null
    );
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
    return null;
  }
};

// Fetch Cart from Backend or LocalStorage
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue, getState }) => {
    const token = getAuthToken();
    const { products: { byId } } = getState();

    if (process.env.NODE_ENV === "development") {
      console.log("Fetching cart - Token exists:", !!token);
    }

    // Always try to load from localStorage first
    const localCartItems = loadFromLocalStorage();

    if (!token) {
      if (process.env.NODE_ENV === "development") {
        console.log("Guest user - loading from localStorage:", localCartItems?.length || 0, "items");
      }
      if (localCartItems && localCartItems.length > 0) {
        const enrichedItems = enrichCartItems(localCartItems, byId);
        return { items: enrichedItems };
      }
      return { items: [] };
    }

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("Authenticated user - fetching from API");
      }
      const res = await fetch("/api/cart", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error("API cart fetch failed:", errorData);

        if (res.status === 401) {
          localStorage.removeItem("user-token");
          if (localCartItems && localCartItems.length > 0) {
            if (process.env.NODE_ENV === "development") {
              console.warn("API failed (401), falling back to local cart");
            }
            const enrichedItems = enrichCartItems(localCartItems, byId);
            return { items: enrichedItems };
          }
        }

        return rejectWithValue(`Failed to fetch cart: ${errorData}`);
      }

      const data = await res.json();
      const cartItems = data.cart?.items?.map((item) => ({
        ...item,
        productId: normalizeId(item.productId),
      })) || [];
      if (process.env.NODE_ENV === "development") {
        console.log("API returned", cartItems.length, "items");
      }

      const enrichedItems = enrichCartItems(cartItems, byId);

      if (enrichedItems.length > 0) {
        saveToLocalStorage(enrichedItems);
      }

      return { items: enrichedItems };
    } catch (error) {
      console.error("Network error fetching cart:", error);

      if (localCartItems && localCartItems.length > 0) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Network error, falling back to local cart");
        }
        const enrichedItems = enrichCartItems(localCartItems, byId);
        return { items: enrichedItems };
      }

      return rejectWithValue(error.message || "Failed to fetch cart");
    }
  },
  { retry: 2 }
);

// Merge Guest Cart into Auth Cart
export const mergeGuestCart = createAsyncThunk(
  "cart/mergeGuestCart",
  async (_, { rejectWithValue, getState }) => {
    const token = getAuthToken();
    if (!token) {
      return rejectWithValue("No authentication token available for merge");
    }

    const localCartItems = loadFromLocalStorage();
    if (!localCartItems || localCartItems.length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.log("No guest cart items to merge");
      }
      return { items: [] };
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Merging", localCartItems.length, "guest items into auth cart");
    }

    try {
      // Ideally batch POST to /api/cart/merge, but keeping loop for compatibility
      for (const item of localCartItems) {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: normalizeId(item.productId),
            variantSku: item.variantSku,
            quantity: item.quantity || 1,
          }),
        });

        if (!res.ok) {
          const errorData = await res.text();
          console.error("Failed to merge item:", item.productId, errorData);
        }
      }

      localStorage.removeItem("guest-cart");
      if (process.env.NODE_ENV === "development") {
        console.log("Guest cart merged and cleared");
      }

      const { products: { byId } } = getState();
      const res = await fetch("/api/cart", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        return rejectWithValue("Failed to refetch cart after merge");
      }

      const data = await res.json();
      const cartItems = data.cart?.items?.map((item) => ({
        ...item,
        productId: normalizeId(item.productId),
      })) || [];
      const enrichedItems = enrichCartItems(cartItems, byId);

      saveToLocalStorage(enrichedItems);

      return { items: enrichedItems };
    } catch (error) {
      console.error("Error merging guest cart:", error);
      return rejectWithValue(error.message || "Failed to merge guest cart");
    }
  },
  { retry: 2 }
);

// Add Item to Cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (productData, { rejectWithValue, getState }) => {
    const token = getAuthToken();
    const { products: { byId } } = getState();

    const id = normalizeId(productData.productId);
    if (process.env.NODE_ENV === "development") {
      console.log("Adding to cart:", { ...productData, productId: id }, "Token:", !!token);
    }

    if (!id || !productData.variantSku) {
      console.error("Missing required product data:", productData);
      return rejectWithValue("Missing product information");
    }

    const product = byId[id];
    if (!product) {
      console.error("Product not found:", id);
      return rejectWithValue("Product not found in store");
    }

    const variant = product.variants?.find((v) => v.sku === productData.variantSku);
    if (!variant) {
      console.error("Variant not found:", productData.variantSku);
      return rejectWithValue("Variant not found");
    }

    const quantity = Math.max(1, parseInt(productData.quantity) || 1);
    if (quantity > (product.stock || 999)) {
      return rejectWithValue("Insufficient stock available");
    }

    const cartItem = {
      productId: id,
      variantSku: productData.variantSku,
      quantity,
      name: product.name || "Unnamed Product",
      description: product.description || "",
      images: product.images?.map((img) => img.url) || ["/product_image.png"],
      price: variant.price || 0,
      variantName: variant.name || variant.sku || "",
      stock: product.stock || 999,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("Created enriched cart item:", cartItem);
    }

    if (!token) {
      if (process.env.NODE_ENV === "development") {
        console.log("Guest user - adding to local cart");
      }
      const localCartItems = loadFromLocalStorage() || [];

      const existingItemIndex = localCartItems.findIndex(
        (item) => normalizeId(item.productId) === id && item.variantSku === cartItem.variantSku
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        updatedItems = [...localCartItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          ...cartItem,
          quantity: updatedItems[existingItemIndex].quantity + cartItem.quantity,
        };
        if (process.env.NODE_ENV === "development") {
          console.log("Updated existing item quantity to:", updatedItems[existingItemIndex].quantity);
        }
      } else {
        updatedItems = [...localCartItems, cartItem];
        if (process.env.NODE_ENV === "development") {
          console.log("Added new item to cart");
        }
      }

      saveToLocalStorage(updatedItems);
      return { items: updatedItems, tempId: id };
    }

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("Authenticated user - calling API");
      }
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: id,
          variantSku: productData.variantSku,
          quantity,
        }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error("API add to cart failed:", errorData);

        if (res.status === 401) {
          localStorage.removeItem("user-token");
          const localCartItems = loadFromLocalStorage() || [];
          const existingItemIndex = localCartItems.findIndex(
            (item) => normalizeId(item.productId) === id && item.variantSku === cartItem.variantSku
          );

          let updatedItems;
          if (existingItemIndex >= 0) {
            updatedItems = [...localCartItems];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              ...cartItem,
              quantity: updatedItems[existingItemIndex].quantity + cartItem.quantity,
            };
          } else {
            updatedItems = [...localCartItems, cartItem];
          }

          saveToLocalStorage(updatedItems);
          return { items: updatedItems, tempId: id };
        }

        return rejectWithValue(errorData);
      }

      const data = await res.json();
      const cartItems = data.cart?.items?.map((item) => ({
        ...item,
        productId: normalizeId(item.productId),
      })) || [];
      if (process.env.NODE_ENV === "development") {
        console.log("API add to cart success, got", cartItems.length, "items");
      }

      const enrichedItems = enrichCartItems(cartItems, byId);
      saveToLocalStorage(enrichedItems);

      return { items: enrichedItems, tempId: id };
    } catch (error) {
      console.error("Network error adding to cart:", error);

      const localCartItems = loadFromLocalStorage() || [];
      const existingItemIndex = localCartItems.findIndex(
        (item) => normalizeId(item.productId) === id && item.variantSku === cartItem.variantSku
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        updatedItems = [...localCartItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          ...cartItem,
          quantity: updatedItems[existingItemIndex].quantity + cartItem.quantity,
        };
      } else {
        updatedItems = [...localCartItems, cartItem];
      }

      saveToLocalStorage(updatedItems);
      return { items: updatedItems, tempId: id };
    }
  },
  { retry: 2 }
);

// Remove Item from Cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ productId, variantSku }, { rejectWithValue, getState }) => {
    const id = normalizeId(productId);
    const token = getAuthToken();
    const { products: { byId } } = getState();

    if (process.env.NODE_ENV === "development") {
      console.log("Removing from cart:", { productId: id, variantSku }, "Token:", !!token);
    }

    if (!token) {
      if (process.env.NODE_ENV === "development") {
        console.log("Guest user - removing from local cart");
      }
      const localCartItems = loadFromLocalStorage() || [];
      const updatedItems = localCartItems.filter(
        (item) => !(normalizeId(item.productId) === id && item.variantSku === variantSku)
      );

      saveToLocalStorage(updatedItems);
      if (process.env.NODE_ENV === "development") {
        console.log("Removed item, now", updatedItems.length, "items in cart");
      }

      return { items: updatedItems, tempId: `${id}-${variantSku}` };
    }

    try {
      const res = await fetch(
        `/api/cart/item?productId=${encodeURIComponent(id)}&variantSku=${encodeURIComponent(variantSku)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.text();
        console.error("API remove from cart failed:", errorData);

        if (res.status === 401) {
          localStorage.removeItem("user-token");
          const localCartItems = loadFromLocalStorage() || [];
          const updatedItems = localCartItems.filter(
            (item) => !(normalizeId(item.productId) === id && item.variantSku === variantSku)
          );

          saveToLocalStorage(updatedItems);
          return { items: updatedItems, tempId: `${id}-${variantSku}` };
        }

        return rejectWithValue(errorData);
      }

      const data = await res.json();
      const cartItems = data.cart?.items?.map((item) => ({
        ...item,
        productId: normalizeId(item.productId),
      })) || [];

      const enrichedItems = enrichCartItems(cartItems, byId);
      saveToLocalStorage(enrichedItems);

      if (process.env.NODE_ENV === "development") {
        console.log("Successfully removed item via API");
      }
      return { items: enrichedItems, tempId: `${id}-${variantSku}` };
    } catch (error) {
      console.error("Network error removing from cart:", error);

      const localCartItems = loadFromLocalStorage() || [];
      const updatedItems = localCartItems.filter(
        (item) => !(normalizeId(item.productId) === id && item.variantSku === variantSku)
      );

      saveToLocalStorage(updatedItems);
      return { items: updatedItems, tempId: `${id}-${variantSku}` };
    }
  },
  { retry: 2 }
);

// Update Cart Item Quantity
export const updateCart = createAsyncThunk(
  "cart/updateCart",
  async ({ productId, variantSku, quantity }, { rejectWithValue, getState, dispatch }) => {
    const id = normalizeId(productId);
    const token = getAuthToken();
    const { products: { byId } } = getState();

    if (process.env.NODE_ENV === "development") {
      console.log("Updating cart quantity:", { productId: id, variantSku, quantity }, "Token:", !!token);
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      return rejectWithValue("Invalid quantity");
    }

    if (qty === 0) {
      return dispatch(removeFromCart({ productId: id, variantSku }));
    }

    const product = byId[id];
    if (product && qty > (product.stock || 999)) {
      return rejectWithValue("Quantity exceeds available stock");
    }

    if (!token) {
      if (process.env.NODE_ENV === "development") {
        console.log("Guest user - updating local cart quantity");
      }
      const localCartItems = loadFromLocalStorage() || [];
      const updatedItems = localCartItems
        .map((item) => {
          if (normalizeId(item.productId) === id && item.variantSku === variantSku) {
            return { ...item, quantity: qty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      saveToLocalStorage(updatedItems);
      if (process.env.NODE_ENV === "development") {
        console.log("Updated quantity, now", updatedItems.length, "items");
      }

      return { items: updatedItems, tempId: `${id}-${variantSku}` };
    }

    try {
      const res = await fetch(`/api/cart/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: id, variantSku, quantity: qty }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error("API update cart failed:", errorData);

        if (res.status === 401) {
          localStorage.removeItem("user-token");
          const localCartItems = loadFromLocalStorage() || [];
          const updatedItems = localCartItems
            .map((item) => {
              if (normalizeId(item.productId) === id && item.variantSku === variantSku) {
                return { ...item, quantity: qty };
              }
              return item;
            })
            .filter((item) => item.quantity > 0);

          saveToLocalStorage(updatedItems);
          return { items: updatedItems, tempId: `${id}-${variantSku}` };
        }

        return rejectWithValue(errorData);
      }

      const data = await res.json();
      const cartItems = data.cart?.items?.map((item) => ({
        ...item,
        productId: normalizeId(item.productId),
      })) || [];

      const enrichedItems = enrichCartItems(cartItems, byId);
      saveToLocalStorage(enrichedItems);

      if (process.env.NODE_ENV === "development") {
        console.log("Successfully updated quantity via API");
      }
      return { items: enrichedItems, tempId: `${id}-${variantSku}` };
    } catch (error) {
      console.error("Network error updating cart:", error);

      const localCartItems = loadFromLocalStorage() || [];
      const updatedItems = localCartItems
        .map((item) => {
          if (normalizeId(item.productId) === id && item.variantSku === variantSku) {
            return { ...item, quantity: qty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      saveToLocalStorage(updatedItems);
      return { items: updatedItems, tempId: `${id}-${variantSku}` };
    }
  },
  { retry: 2 }
);

// Clear Cart
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    const token = getAuthToken();

    if (process.env.NODE_ENV === "development") {
      console.log("Clearing cart - Token:", !!token);
    }

    if (!token) {
      if (process.env.NODE_ENV === "development") {
        console.log("Guest user - clearing local storage");
      }
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
        console.error("API clear cart failed:", errorData);

        if (res.status === 401) {
          localStorage.removeItem("user-token");
        }

        localStorage.removeItem("guest-cart");
        return { items: [] };
      }

      const data = await res.json();
      if (process.env.NODE_ENV === "development") {
        console.log("Successfully cleared cart via API");
      }

      localStorage.removeItem("guest-cart");
      return data.cart || { items: [] };
    } catch (error) {
      console.error("Network error clearing cart:", error);
      localStorage.removeItem("guest-cart");
      return { items: [] };
    }
  },
  { retry: 2 }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    status: "idle",
    totalPrice: 0,
    totalQuantity: 0,
    error: null,
    isGuestCart: false,
    lastUpdated: null,
  },
  reducers: {
    resetError: (state) => {
      state.error = null;
      state.status = "idle";
    },
    setGuestCartFlag: (state, action) => {
      state.isGuestCart = action.payload;
    },
    refreshCartItems: (state, action) => {
      const { items, byId } = action.payload;
      state.items = enrichCartItems(items || [], byId || {});
      state.totalPrice = state.items.reduce(
        (total, item) => total + (item.price || 0) * (item.quantity || 0),
        0
      );
      state.totalQuantity = state.items.reduce(
        (total, item) => total + (item.quantity || 0),
        0
      );
      state.lastUpdated = Date.now();
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
        state.totalPrice = state.items.reduce(
          (total, item) => total + (typeof item.price === "number" ? item.price : 0) * (item.quantity || 0),
          0
        );
        state.totalQuantity = state.items.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
        state.error = null;
        state.isGuestCart = !getAuthToken();
        state.lastUpdated = Date.now();
        if (process.env.NODE_ENV === "development") {
          console.log("Cart fetched successfully:", state.items.length, "items");
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch cart";
        state.isGuestCart = !getAuthToken();
        console.error("Cart fetch failed:", action.payload);
      })
      // Add to Cart
      .addCase(addToCart.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        const { productId, variantSku, quantity } = action.meta.arg;
        const id = normalizeId(productId);
        const existingItemIndex = state.items.findIndex(
          (item) => normalizeId(item.productId) === id && item.variantSku === variantSku
        );
        if (existingItemIndex >= 0) {
          state.items[existingItemIndex].quantity += quantity || 1;
        } else {
          state.items.push({
            productId: id,
            variantSku,
            quantity: quantity || 1,
            tempId: action.payload?.tempId,
          });
        }
        state.totalPrice = state.items.reduce(
          (total, item) => total + (typeof item.price === "number" ? item.price : 0) * (item.quantity || 0),
          0
        );
        state.totalQuantity = state.items.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.totalPrice = state.items.reduce(
          (total, item) => total + (typeof item.price === "number" ? item.price : 0) * (item.quantity || 0),
          0
        );
        state.totalQuantity = state.items.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
        state.error = null;
        state.isGuestCart = !getAuthToken();
        state.lastUpdated = Date.now();
        if (process.env.NODE_ENV === "development") {
          console.log("Item added to cart successfully");
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to add to cart";
        state.isGuestCart = !getAuthToken();
        // Rollback optimistic
        const tempId = action.payload?.tempId;
        state.items = state.items.filter((item) => item.tempId !== tempId);
        state.totalPrice = state.items.reduce(
          (total, item) => total + (typeof item.price === "number" ? item.price : 0) * (item.quantity || 0),
          0
        );
        state.totalQuantity = state.items.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
        console.error("Add to cart failed:", action.payload);
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        const { productId, variantSku } = action.meta.arg;
        const id = normalizeId(productId);
        state.items = state.items.filter(
          (item) => !(normalizeId(item.productId) === id && item.variantSku === variantSku)
        );
        state.totalPrice = state.items.reduce(
          (total, item) => total + (typeof item.price === "number" ? item.price : 0) * (item.quantity || 0),
          0
        );
        state.totalQuantity = state.items.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.totalPrice = state.items.reduce(
          (total, item) => total + (typeof item.price === "number" ? item.price : 0) * (item.quantity || 0),
          0
        );
        state.totalQuantity = state.items.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
        state.error = null;
        state.isGuestCart = !getAuthToken();
        state.lastUpdated = Date.now();
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to remove item";
        state.isGuestCart = !getAuthToken();
        // Rollback: refetch or keep local
        console.error("Remove from cart failed:", action.payload);
      })
      // Update Cart
      .addCase(updateCart.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        const { productId, variantSku, quantity } = action.meta.arg;
        const id = normalizeId(productId);
        state.items = state.items.map((item) =>
          normalizeId(item.productId) === id && item.variantSku === variantSku
            ? { ...item, quantity }
            : item
        ).filter((item) => item.quantity > 0);
        state.totalPrice = state.items.reduce(
          (total, item) => total + (typeof item.price === "number" ? item.price : 0) * (item.quantity || 0),
          0
        );
        state.totalQuantity = state.items.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
      })
      .addCase(updateCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.totalPrice = state.items.reduce(
          (total, item) => total + (typeof item.price === "number" ? item.price : 0) * (item.quantity || 0),
          0
        );
        state.totalQuantity = state.items.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
        state.error = null;
        state.isGuestCart = !getAuthToken();
        state.lastUpdated = Date.now();
      })
      .addCase(updateCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update item";
        state.isGuestCart = !getAuthToken();
        // Rollback: refetch or keep local
        console.error("Update cart failed:", action.payload);
      })
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.items = [];
        state.totalPrice = 0;
        state.totalQuantity = 0;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.status = "succeeded";
        state.items = [];
        state.totalPrice = 0;
        state.totalQuantity = 0;
        state.error = null;
        state.isGuestCart = !getAuthToken();
        state.lastUpdated = Date.now();
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to clear cart";
        state.isGuestCart = !getAuthToken();
        console.error("Clear cart failed:", action.payload);
      })
      // Merge Guest Cart
      .addCase(mergeGuestCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.totalPrice = state.items.reduce(
          (total, item) => total + (typeof item.price === "number" ? item.price : 0) * (item.quantity || 0),
          0
        );
        state.totalQuantity = state.items.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
        state.error = null;
        state.isGuestCart = false;
        state.lastUpdated = Date.now();
      })
      .addCase(mergeGuestCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to merge guest cart";
        console.error("Merge guest cart failed:", action.payload);
      });
  },
});

export const { resetError, setGuestCartFlag, refreshCartItems } = cartSlice.actions;
export default cartSlice.reducer;