"use client";

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { clearCart } from './cartSlice';
// import { toast } from 'react-toastify'; // Uncomment if using toasts

// Helper function to get the token
const getAuthToken = () => {
  return localStorage.getItem('user-token') || '';
};

// Helper function to parse error response
const parseErrorResponse = async (response) => {
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      return errorData.message || `HTTP error ${response.status}`;
    }
    return `HTTP error ${response.status}: ${response.statusText}`;
  } catch {
    return `HTTP error ${response.status}: Unable to parse error response`;
  }
};

const generateInvoice = async (orderId, token) => {
  try {
    const res = await fetch(`/api/orders/invoice/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId }),
    });

    if (!res.ok) {
      throw new Error(await parseErrorResponse(res));
    }

    const data = await res.json();

    return data.data.invoiceId || null; // Assuming invoiceNumber is the invoiceId
  } catch (error) {
    console.error("Invoice generation failed:", error.message);
    return null;
  }
};

export const downloadInvoice = createAsyncThunk(
  'orders/downloadInvoice',
  async (invoiceId, { rejectWithValue }) => {
    const token = getAuthToken();
    if (!token) {
      return rejectWithValue("No authentication token found");
    }

    try {
      // Fix: Use relative URL to avoid hardcoding localhost (works in prod)
      const res = await fetch(`/api/orders/invoice/pdf/${invoiceId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(await parseErrorResponse(res));
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      return url; // Return the blob URL for download
    } catch (error) {
      console.error("Download invoice failed:", error.message);
      return rejectWithValue(error.message || "Failed to download invoice");
    }
  }
);



export const downloadLatestInvoice = createAsyncThunk(
  'orders/downloadLatestInvoice',
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const orders = state.orders.list; // Assuming your store has orders slice
    const latestOrder = orders[orders.length - 1];

    if (!latestOrder || !latestOrder.invoiceId) {
      return rejectWithValue("No recent order with invoice found. Please place an order first.");
    }

    const invoiceId = latestOrder.invoiceId;
    const token = getAuthToken();
    if (!token) {
      return rejectWithValue("No authentication token found");
    }

    const apiUrl = `/api/orders/invoice/pdf/${invoiceId}`;

    return { url: apiUrl, invoiceId };
  }
);

// Place Order with Invoice Generation (unchanged from previous)
export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (deliveryDetails, { getState, dispatch }, { maxRetries = 2 } = {}) => {
    const state = getState();
    const products = state.cart.items.map(item => ({
      productId: item.productId,
      // productId: item._id,
      variantSku: item.variantSku,
      quantity: item.quantity,
      title: item.name,
      price: item.price,
      imageUrl: item.imageUrl || null,
    }));

    const order = {
      products,
      deliveryAddress: {
        fullName: deliveryDetails.fullName,
        phone: deliveryDetails.phone,
        street: deliveryDetails.street,
        city: deliveryDetails.city,
        state: deliveryDetails.state,
        postalCode: deliveryDetails.postalCode,
        country: deliveryDetails.country,
      },
      paymentMethod: deliveryDetails.paymentMethod,
      paymentId: deliveryDetails.paymentId || null,
      shippingCost: deliveryDetails.shippingCost,
      discountApplied: deliveryDetails.discountApplied,
      totalAmount: deliveryDetails.totalAmount,
    };

    const token = getAuthToken();
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(order),
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Unauthorized: Please log in again");
          } else if (res.status === 429) {
            throw new Error("Too many requests: Please try again later");
          } else if (res.status >= 500 && attempt < maxRetries) {
            continue;
          } else {
            throw new Error(await parseErrorResponse(res));
          }
        }

        const data = await res.json();

        const invoiceId = await generateInvoice(data.data._id, token);
        if (invoiceId) {
          data.invoiceId = invoiceId;
          // toast.success("Invoice generated successfully!");
        } else {
          // toast.warn("Invoice generation in progress, check back later.");
        }

        dispatch(clearCart());
        return data;
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error.message);
        if (attempt === maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw lastError || new Error("Failed to place order after retries");
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    list: [],
    status: 'idle',
    error: null,
    lastErrorTimestamp: null,
    invoiceStatus: 'idle',
    invoiceError: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.lastErrorTimestamp = null;
      state.invoiceError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Place Order (unchanged)
      .addCase(placeOrder.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        // Use invoiceId consistently (matches what placeOrder sets)
        state.list.push({
          ...action.payload,
          invoiceId: action.payload.invoiceId || null, // Changed from invoiceUrl
        });
        state.lastErrorTimestamp = null;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to place order';
        state.lastErrorTimestamp = Date.now();
      })
      // Download Invoice (original - for specific ID)
      .addCase(downloadInvoice.pending, (state) => {
        state.invoiceStatus = 'loading';
        state.invoiceError = null;
      })
      .addCase(downloadInvoice.fulfilled, (state, action) => {
        state.invoiceStatus = 'succeeded';
        state.invoiceError = null;
      })
      .addCase(downloadInvoice.rejected, (state, action) => {
        state.invoiceStatus = 'failed';
        state.invoiceError = action.error.message || 'Failed to download invoice';
      })
      // NEW: Download Latest Invoice (shares same status for simplicity)
      .addCase(downloadLatestInvoice.pending, (state) => {
        state.invoiceStatus = 'loading';
        state.invoiceError = null;
      })
      .addCase(downloadLatestInvoice.fulfilled, (state, action) => {
        state.invoiceStatus = 'succeeded';
        state.invoiceError = null;
      })
      .addCase(downloadLatestInvoice.rejected, (state, action) => {
        state.invoiceStatus = 'failed';
        state.invoiceError = action.error.message || 'Failed to download latest invoice';
      });
  },
});

export const { clearError } = ordersSlice.actions;
export default ordersSlice.reducer;