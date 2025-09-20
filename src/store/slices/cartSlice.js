"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Helper function to get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("user-token") || "";
};

// Helper function to enrich cart items with product data
const enrichCartItems = (items, productsById) => {
  if (!items || !Array.isArray(items)) return [];
  
  return items.map(item => {
    // If item already has all the necessary fields, return as is
    if (item.name && typeof item.price === 'number' && item.price >= 0 && 
        (Array.isArray(item.images) && item.images.length > 0)) {
      return { ...item, quantity: item.quantity || 1 };
    }

    const product = productsById[item.productId];
    if (!product) {
      console.warn("Product not found for enrichment:", item.productId);
      return {
        ...item,
        name: item.name || "Product not found",
        price: typeof item.price === 'number' ? item.price : 0,
        images: Array.isArray(item.images) ? item.images : ["/product_image.png"],
        description: item.description || "",
        quantity: item.quantity || 1,
      };
    }

    const variant = product.variants?.find(v => v.sku === item.variantSku);
    const firstImage = product.images?.[0]?.url || "/product_image.png";

    const enrichedItem = {
      ...item,
      name: product.name || "Unnamed Product",
      description: product.description || "",
      images: product.images?.map(img => img.url) || [firstImage],
      price: typeof variant?.price === 'number' ? variant.price : 
             (typeof product.variants?.[0]?.price === 'number' ? product.variants[0].price : 0),
      variantName: variant?.name || variant?.sku || "",
      stock: product.stock || 999,
      quantity: item.quantity || 1,
    };

    console.log("Enriched cart item:", enrichedItem);
    return enrichedItem;
  });
};

// Helper function to save to localStorage safely
const saveToLocalStorage = (cartItems) => {
  try {
    localStorage.setItem("guest-cart", JSON.stringify({ 
      cart: { items: cartItems },
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

// Helper function to load from localStorage safely
const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem("guest-cart");
    if (!data) return null;
    const parsed = JSON.parse(data);
    return parsed?.cart?.items || null;
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
    
    console.log("Fetching cart - Token exists:", !!token);
    
    // Always try to load from localStorage first (for both guest and fallback)
    const localCartItems = loadFromLocalStorage();
    
    if (!token) {
      // Guest user - return enriched local cart
      console.log("Guest user - loading from localStorage:", localCartItems?.length || 0, "items");
      if (localCartItems && localCartItems.length > 0) {
        const enrichedItems = enrichCartItems(localCartItems, byId);
        return { items: enrichedItems };
      }
      // Empty guest cart
      return { items: [] };
    }

    try {
      console.log("Authenticated user - fetching from API");
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
        
        // If API fails, fallback to localStorage
        if (localCartItems && localCartItems.length > 0) {
          console.warn("API failed, falling back to local cart");
          const enrichedItems = enrichCartItems(localCartItems, byId);
          return { items: enrichedItems };
        }
        
        return rejectWithValue(`Failed to fetch cart: ${errorData}`);
      }

      const data = await res.json();
      const cartItems = data.cart?.items || [];
      console.log("API returned", cartItems.length, "items");
      
      // Enrich items with product data if not already present
      const enrichedItems = enrichCartItems(cartItems, byId);
      
      // Also save to localStorage as backup
      if (enrichedItems.length > 0) {
        saveToLocalStorage(enrichedItems);
      }
      
      return { items: enrichedItems };
    } catch (error) {
      console.error("Network error fetching cart:", error);
      
      // Fallback to localStorage on any error
      if (localCartItems && localCartItems.length > 0) {
        console.warn("Network error, falling back to local cart");
        const enrichedItems = enrichCartItems(localCartItems, byId);
        return { items: enrichedItems };
      }
      
      return rejectWithValue(error.message || "Failed to fetch cart");
    }
  }
);

// New Thunk: Merge Guest Cart into Auth Cart after Login
export const mergeGuestCart = createAsyncThunk(
  "cart/mergeGuestCart",
  async (_, { rejectWithValue, getState }) => {
    const token = getAuthToken();
    if (!token) {
      return rejectWithValue("No authentication token available for merge");
    }

    const localCartItems = loadFromLocalStorage();
    if (!localCartItems || localCartItems.length === 0) {
      console.log("No guest cart items to merge");
      return { items: [] }; // Nothing to merge
    }

    console.log("Merging", localCartItems.length, "guest items into auth cart");

    try {
      // Add each guest item to the API cart
      for (const item of localCartItems) {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: item.productId,
            variantSku: item.variantSku,
            quantity: item.quantity || 1,
          }),
        });

        if (!res.ok) {
          const errorData = await res.text();
          console.error("Failed to merge item:", item.productId, errorData);
          // Continue with other items even if one fails
        }
      }

      // Clear guest cart after merge
      localStorage.removeItem("guest-cart");
      console.log("Guest cart merged and cleared");

      // Refetch the updated auth cart
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
      const cartItems = data.cart?.items || [];
      const enrichedItems = enrichCartItems(cartItems, byId);

      // Save backup
      saveToLocalStorage(enrichedItems);

      return { items: enrichedItems };
    } catch (error) {
      console.error("Error merging guest cart:", error);
      return rejectWithValue(error.message || "Failed to merge guest cart");
    }
  }
);

// Add Item to Cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (productData, { rejectWithValue, getState, dispatch }) => {
    const token = getAuthToken();
    const { products: { byId } } = getState();
    
    console.log("Adding to cart:", productData, "Token:", !!token);
    
    // Validate required fields
    if (!productData.productId || !productData.variantSku) {
      console.error("Missing required product data:", productData);
      return rejectWithValue("Missing product information");
    }

    const product = byId[productData.productId];
    if (!product) {
      console.error("Product not found:", productData.productId);
      return rejectWithValue("Product not found in store");
    }

    const variant = product.variants?.find(v => v.sku === productData.variantSku);
    if (!variant) {
      console.error("Variant not found:", productData.variantSku);
      return rejectWithValue("Variant not found");
    }

    // Create enriched cart item
    const cartItem = {
      productId: productData.productId,
      variantSku: productData.variantSku,
      quantity: productData.quantity || 1,
      name: product.name || "Unnamed Product",
      description: product.description || "",
      images: product.images?.map(img => img.url) || [product.images?.[0]?.url || "/product_image.png"],
      price: variant.price || 0,
      variantName: variant.name || variant.sku || "",
      stock: product.stock || 999,
    };

    console.log("Created enriched cart item:", cartItem);

    if (!token) {
      // Guest user - handle locally
      console.log("Guest user - adding to local cart");
      const localCartItems = loadFromLocalStorage() || [];
      
      // Check if item already exists
      const existingItemIndex = localCartItems.findIndex(
        item => item.productId === cartItem.productId && item.variantSku === cartItem.variantSku
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems = [...localCartItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          ...cartItem,
          quantity: updatedItems[existingItemIndex].quantity + cartItem.quantity
        };
        console.log("Updated existing item quantity to:", updatedItems[existingItemIndex].quantity);
      } else {
        // Add new item
        updatedItems = [...localCartItems, cartItem];
        console.log("Added new item to cart");
      }

      // Save to localStorage
      saveToLocalStorage(updatedItems);
      
      // Return the updated cart
      return { items: updatedItems };
    }

    try {
      console.log("Authenticated user - calling API");
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: productData.productId,
          variantSku: productData.variantSku,
          quantity: productData.quantity || 1,
        }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error("API add to cart failed:", errorData);
        
        // Fallback to local storage for offline support
        const localCartItems = loadFromLocalStorage() || [];
        const existingItemIndex = localCartItems.findIndex(
          item => item.productId === cartItem.productId && item.variantSku === cartItem.variantSku
        );

        let updatedItems;
        if (existingItemIndex >= 0) {
          updatedItems = [...localCartItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            ...cartItem,
            quantity: updatedItems[existingItemIndex].quantity + cartItem.quantity
          };
        } else {
          updatedItems = [...localCartItems, cartItem];
        }

        saveToLocalStorage(updatedItems);
        return { items: updatedItems };
      }

      const data = await res.json();
      const cartItems = data.cart?.items || [];
      console.log("API add to cart success, got", cartItems.length, "items");
      
      // Enrich with product data
      const enrichedItems = enrichCartItems(cartItems, byId);
      
      // Save to localStorage as backup
      saveToLocalStorage(enrichedItems);
      
      return { items: enrichedItems };
    } catch (error) {
      console.error("Network error adding to cart:", error);
      
      // Fallback to local storage
      const localCartItems = loadFromLocalStorage() || [];
      const existingItemIndex = localCartItems.findIndex(
        item => item.productId === cartItem.productId && item.variantSku === cartItem.variantSku
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        updatedItems = [...localCartItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          ...cartItem,
          quantity: updatedItems[existingItemIndex].quantity + cartItem.quantity
        };
      } else {
        updatedItems = [...localCartItems, cartItem];
      }

      saveToLocalStorage(updatedItems);
      return { items: updatedItems };
    }
  }
);

// Remove Item from Cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ productId, variantSku }, { rejectWithValue, getState }) => {
    const token = getAuthToken();
    const { products: { byId } } = getState();
    
    console.log("Removing from cart:", { productId, variantSku }, "Token:", !!token);
    
    if (!token) {
      // Guest user - handle locally
      console.log("Guest user - removing from local cart");
      const localCartItems = loadFromLocalStorage() || [];
      const updatedItems = localCartItems.filter(
        (item) => !(item.productId === productId && item.variantSku === variantSku)
      );
      
      saveToLocalStorage(updatedItems);
      console.log("Removed item, now", updatedItems.length, "items in cart");
      
      return { items: updatedItems };
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
        console.error("API remove from cart failed:", errorData);
        
        // Fallback to local storage
        const localCartItems = loadFromLocalStorage() || [];
        const updatedItems = localCartItems.filter(
          (item) => !(item.productId === productId && item.variantSku === variantSku)
        );
        
        saveToLocalStorage(updatedItems);
        return { items: updatedItems };
      }

      const data = await res.json();
      const cartItems = data.cart?.items || [];
      
      // Enrich with product data
      const enrichedItems = enrichCartItems(cartItems, byId);
      
      // Save to localStorage as backup
      saveToLocalStorage(enrichedItems);
      
      console.log("Successfully removed item via API");
      return { items: enrichedItems };
    } catch (error) {
      console.error("Network error removing from cart:", error);
      
      // Fallback to local storage
      const localCartItems = loadFromLocalStorage() || [];
      const updatedItems = localCartItems.filter(
        (item) => !(item.productId === productId && item.variantSku === variantSku)
      );
      
      saveToLocalStorage(updatedItems);
      return { items: updatedItems };
    }
  }
);

// Update Cart Item Quantity
export const updateCart = createAsyncThunk(
  "cart/updateCart",
  async ({ productId, variantSku, quantity }, { rejectWithValue, getState }) => {
    const token = getAuthToken();
    const { products: { byId } } = getState();
    
    console.log("Updating cart quantity:", { productId, variantSku, quantity }, "Token:", !!token);
    
    if (quantity < 0) {
      return rejectWithValue("Quantity cannot be negative");
    }

    if (quantity === 0) {
      // Use removeFromCart for quantity 0
      return dispatch(removeFromCart({ productId, variantSku }));
    }

    if (!token) {
      // Guest user - handle locally
      console.log("Guest user - updating local cart quantity");
      const localCartItems = loadFromLocalStorage() || [];
      const updatedItems = localCartItems.map((item) => {
        if (item.productId === productId && item.variantSku === variantSku) {
          return { ...item, quantity };
        }
        return item;
      }).filter(item => item.quantity > 0);
      
      saveToLocalStorage(updatedItems);
      console.log("Updated quantity, now", updatedItems.length, "items");
      
      return { items: updatedItems };
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
        console.error("API update cart failed:", errorData);
        
        // Fallback to local storage
        const localCartItems = loadFromLocalStorage() || [];
        const updatedItems = localCartItems.map((item) => {
          if (item.productId === productId && item.variantSku === variantSku) {
            return { ...item, quantity };
          }
          return item;
        }).filter(item => item.quantity > 0);
        
        saveToLocalStorage(updatedItems);
        return { items: updatedItems };
      }

      const data = await res.json();
      const cartItems = data.cart?.items || [];
      
      // Enrich with product data
      const enrichedItems = enrichCartItems(cartItems, byId);
      
      // Save to localStorage as backup
      saveToLocalStorage(enrichedItems);
      
      console.log("Successfully updated quantity via API");
      return { items: enrichedItems };
    } catch (error) {
      console.error("Network error updating cart:", error);
      
      // Fallback to local storage
      const localCartItems = loadFromLocalStorage() || [];
      const updatedItems = localCartItems.map((item) => {
        if (item.productId === productId && item.variantSku === variantSku) {
          return { ...item, quantity };
        }
        return item;
      }).filter(item => item.quantity > 0);
      
      saveToLocalStorage(updatedItems);
      return { items: updatedItems };
    }
  }
);

// Clear Cart
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    const token = getAuthToken();
    
    console.log("Clearing cart - Token:", !!token);
    
    if (!token) {
      // Guest user - clear local storage
      console.log("Guest user - clearing local storage");
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
        
        // Fallback - clear local storage
        localStorage.removeItem("guest-cart");
        return { items: [] };
      }

      const data = await res.json();
      console.log("Successfully cleared cart via API");
      
      // Also clear localStorage
      localStorage.removeItem("guest-cart");
      
      return data.cart || { items: [] };
    } catch (error) {
      console.error("Network error clearing cart:", error);
      
      // Fallback - clear local storage
      localStorage.removeItem("guest-cart");
      return { items: [] };
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
    isGuestCart: false,
  },
  reducers: {
    resetError: (state) => {
      state.error = null;
      state.status = "idle";
    },
    setGuestCartFlag: (state, action) => {
      state.isGuestCart = action.payload;
    },
    // Add this reducer to manually refresh cart after guest actions
    refreshCartItems: (state, action) => {
      const { products: { byId } } = action.meta || {};
      state.items = enrichCartItems(action.payload.items || [], byId || {});
      state.totalPrice = state.items.reduce(
        (total, item) => total + (item.price || 0) * (item.quantity || 0),
        0
      );
      state.totalQuantity = state.items.reduce(
        (total, item) => total + (item.quantity || 0),
        0
      );
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
        state.totalPrice = action.payload.items.reduce(
          (total, item) => total + (typeof item.price === 'number' ? item.price : 0) * (item.quantity || 0),
          0
        );
        state.totalQuantity = action.payload.items.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
        state.error = null;
        state.isGuestCart = !getAuthToken();
        console.log("Cart fetched successfully:", state.items.length, "items");
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch cart";
        state.isGuestCart = !getAuthToken();
        console.error("Cart fetch failed:", action.payload);
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.totalPrice = action.payload.items.reduce(
          (total, item) => total + (typeof item.price === 'number' ? item.price : 0) * (item.quantity || 0),
          0
        );
        state.totalQuantity = action.payload.items.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
        state.error = null;
        state.isGuestCart = !getAuthToken();
        console.log("Item added to cart successfully");
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to add to cart";
        state.isGuestCart = !getAuthToken();
        console.error("Add to cart failed:", action.payload);
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.totalPrice = action.payload.items.reduce(
          (total, item) => total + (typeof item.price === 'number' ? item.price : 0) * (item.quantity || 0),
          0
        );
        state.totalQuantity = action.payload.items.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
        state.error = null;
        state.isGuestCart = !getAuthToken();
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to remove item";
        state.isGuestCart = !getAuthToken();
      })
      // Update Cart
      .addCase(updateCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.totalPrice = action.payload.items.reduce(
          (total, item) => total + (typeof item.price === 'number' ? item.price : 0) * (item.quantity || 0),
          0
        );
        state.totalQuantity = action.payload.items.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
        state.error = null;
        state.isGuestCart = !getAuthToken();
      })
      .addCase(updateCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update item";
        state.isGuestCart = !getAuthToken();
      })
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = [];
        state.totalPrice = 0;
        state.totalQuantity = 0;
        state.error = null;
        state.isGuestCart = !getAuthToken();
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to clear cart";
        state.isGuestCart = !getAuthToken();
      })
      // Merge Guest Cart
      .addCase(mergeGuestCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.totalPrice = action.payload.items.reduce(
          (total, item) => total + (typeof item.price === 'number' ? item.price : 0) * (item.quantity || 0),
          0
        );
        state.totalQuantity = action.payload.items.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
        state.error = null;
        state.isGuestCart = false;  // No longer guest after merge
      })
      .addCase(mergeGuestCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to merge guest cart";
      });
  },
});

export const { resetError, setGuestCartFlag, refreshCartItems } = cartSlice.actions;
export default cartSlice.reducer;