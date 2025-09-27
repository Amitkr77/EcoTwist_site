"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Utility to retrieve and validate token, extracting userId
const getAuthToken = () => {
  // First check localStorage
  let token = localStorage.getItem("user-token");
  // If not found in localStorage, check cookies
  if (!token) {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(cookie => cookie.startsWith('user-token='));

    if (tokenCookie) {
      token = tokenCookie.split('=')[1];
    }
  }

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const decoded = jwtDecode(token);

    const currentTime = Date.now() / 1000;
    if (decoded.exp && decoded.exp < currentTime) {
      // Remove token from both localStorage and cookies if expired
      localStorage.removeItem("user-token");
      document.cookie = "user-token=; Max-Age=0"; // Remove from cookies
      throw new Error("Token has expired");
    }

    // Check for 'id' instead of 'sub' or 'userId'
    const userId = decoded.id;
    if (!userId) {
      throw new Error("Invalid token: userId not found");
    }

    return { token, userId };
  } catch (error) {
    throw new Error("Invalid token: " + error.message);
  }
};

// Utility to handle API errors consistently
const handleApiError = (error, defaultMessage) => {
  return error.message || error.response?.data?.message || defaultMessage;
};

// Thunks
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { token, userId } = getAuthToken();
      const response = await axios.get(`/api/user/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200 && response.data.user) {
        return response.data.user;
      }
      return rejectWithValue("User data not found");
    } catch (error) {
      return rejectWithValue(handleApiError(error, "Failed to fetch user"));
    }
  }
);

export const updateAccountInfo = createAsyncThunk(
  "user/updateAccountInfo",
  async (accountInfo, { rejectWithValue }) => {
    if (!accountInfo) return rejectWithValue("Invalid account information");
    try {
      const { token, userId } = getAuthToken();
      const response = await axios.put(
        `/api/user/profile/${userId}`,
        accountInfo,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.user;
    } catch (error) {
      return rejectWithValue(handleApiError(error, "Failed to update account"));
    }
  }
);

export const addAddress = createAsyncThunk(
  "user/addAddress",
  async (address, { rejectWithValue }) => {
    if (!address) return rejectWithValue("Invalid address");
    try {
      const { token, userId } = getAuthToken();
      const response = await axios.post(
        `/api/address/${userId}`,
        address,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.address;
    } catch (error) {
      return rejectWithValue(handleApiError(error, "Failed to add address"));
    }
  }
);

export const updateAddress = createAsyncThunk(
  "user/updateAddress",
  async ({ addressId, addressData }, { rejectWithValue }) => {
    if (!addressId || !addressData) return rejectWithValue("Invalid address ID or data");
    try {
      const { token } = getAuthToken();
      const response = await axios.put(
        `/api/address/${addressId}`,
        addressData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.address;
    } catch (error) {
      return rejectWithValue(handleApiError(error, "Failed to update address"));
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "user/deleteAddress",
  async (addressId, { rejectWithValue }) => {
    if (!addressId) return rejectWithValue("Invalid addressId");
    try {
      const { token } = getAuthToken();
      const response = await axios.delete(`/api/address/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.id;
    } catch (error) {
      return rejectWithValue(handleApiError(error, "Failed to delete address"));
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  "user/setDefaultAddress",
  async (addressId, { rejectWithValue }) => {
    if (!addressId) return rejectWithValue("Invalid addressId");
    try {
      const { token, userId } = getAuthToken();
      const response = await axios.put(
        `/api/user/address/${userId}/default`,
        { addressId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.user.addresses;
    } catch (error) {
      return rejectWithValue(handleApiError(error, "Failed to set default address"));
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "user/addToWishlist",
  async (productId, { rejectWithValue }) => {
    if (!productId) return rejectWithValue("Invalid productId");
    try {
      const { token } = getAuthToken();
      const response = await axios.post(
        `/api/wishlist`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.wishlist.items;
    } catch (error) {
      return rejectWithValue(handleApiError(error, "Failed to add to wishlist"));
    }
  }
);

export const fetchWishlist = createAsyncThunk(
  "user/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const { token } = getAuthToken();
      const response = await axios.get(`/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.wishlist.items;
    } catch (error) {
      return rejectWithValue(handleApiError(error, "Failed to fetch wishlist"));
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "user/removeFromWishlist",
  async (productId, { rejectWithValue }) => {
    if (!productId) return rejectWithValue("Invalid productId");
    try {
      const { token } = getAuthToken();
      const response = await axios.delete(`/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.wishlist.items;
    } catch (error) {
      return rejectWithValue(handleApiError(error, "Failed to remove from wishlist"));
    }
  }
);

const initialState = {
  profile: {},
  wishlist: [],
  status: "idle",
  error: null,
};

// Utility to handle async state transitions
const handleAsyncState = (builder, action, fulfilledHandler) => {
  builder
    .addCase(action.pending, (state) => {
      state.status = "loading";
      state.error = null;
    })
    .addCase(action.fulfilled, (state, action) => {
      state.status = "succeeded";
      fulfilledHandler(state, action);
    })
    .addCase(action.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Unknown error";
      if (action.payload.includes("token")) {
        state.profile = {};
        state.wishlist = [];
        localStorage.removeItem("user-token");
      }
    });
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserData(state) {
      state.profile = {};
      state.wishlist = [];
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("user-token");
    },
    updateWishlist(state, action) {
      state.wishlist = Array.isArray(action.payload) ? action.payload : state.wishlist;
    },
  },
  extraReducers: (builder) => {
    handleAsyncState(builder, fetchUserProfile, (state, action) => {
      state.profile = action.payload || {};
      state.wishlist = action.payload?.wishlist?.items || [];
    });
    handleAsyncState(builder, updateAccountInfo, (state, action) => {
      state.profile = action.payload || {};
    });
    handleAsyncState(builder, addAddress, (state, action) => {
      const existing = Array.isArray(state.profile.addresses)
        ? state.profile.addresses
        : [];
      state.profile.addresses = [...existing, action.payload];
    });
    handleAsyncState(builder, updateAddress, (state, action) => {
      state.profile.addresses = state.profile.addresses?.map((addr) =>
        addr._id === action.payload._id ? action.payload : addr
      );
    });
    handleAsyncState(builder, deleteAddress, (state, action) => {
      state.profile.addresses = state.profile.addresses?.filter(
        (addr) => addr._id !== action.payload
      );
    });
    handleAsyncState(builder, setDefaultAddress, (state, action) => {
      state.profile = { ...state.profile, addresses: action.payload || [] };
    });
    handleAsyncState(builder, addToWishlist, (state, action) => {
      state.wishlist = action.payload || [];
    });
    handleAsyncState(builder, removeFromWishlist, (state, action) => {
      state.wishlist = action.payload || [];
    });
  },
});

export const { clearUserData, updateWishlist } = userSlice.actions;
export default userSlice.reducer;