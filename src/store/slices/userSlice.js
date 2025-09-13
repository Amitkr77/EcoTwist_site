"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Existing thunks (fetchUserProfile, updateAccountInfo, addAddress, deleteAddress, setDefaultAddress, addToWishlist) remain unchanged
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("user-token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      const response = await axios.get(`/api/user/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200 && response.data.user) {
        return response.data.user;
      }
      return rejectWithValue("User data not found");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user");
    }
  }
);

export const updateAccountInfo = createAsyncThunk(
  "user/updateAccountInfo",
  async ({ userId, accountInfo }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("user-token");
      const response = await axios.put(
        `/api/user/profile/${userId}`,
        accountInfo,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update account");
    }
  }
);

export const addAddress = createAsyncThunk(
  "user/addAddress",
  async ({ userId, address }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("user-token");
      const response = await axios.post(
        `/api/user/address/${userId}`,
        address,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.user.addresses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add address");
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "user/deleteAddress",
  async ({ userId, addressId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("user-token");
      const response = await axios.delete(`/api/user/address/${userId}/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.user.addresses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete address");
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  "user/setDefaultAddress",
  async ({ userId, addressId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("user-token");
      const response = await axios.put(
        `/api/user/address/${userId}/default`,
        { addressId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.user.addresses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to set default address");
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "user/addToWishlist",
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("user-token");
      const response = await axios.post(
        `/api/user/wishlist/${userId}`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.wishlist.items;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add to wishlist");
    }
  }
);

// New thunk for removing from wishlist
export const removeFromWishlist = createAsyncThunk(
  "user/removeFromWishlist",
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("user-token");
      const response = await axios.delete(`/api/user/wishlist/${userId}/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.wishlist.items; // Assume backend returns updated wishlist
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove from wishlist");
    }
  }
);

const initialState = {
  profile: {},
  wishlist: [],
  status: "idle",
  error: null,
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
    },
    updateWishlist(state, action) {
      state.wishlist = Array.isArray(action.payload) ? action.payload : state.wishlist;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload || {};
        state.wishlist = action.payload?.wishlist?.items || [];
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unknown error";
      })
      .addCase(updateAccountInfo.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateAccountInfo.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload || {};
      })
      .addCase(updateAccountInfo.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unknown error";
      })
      .addCase(addAddress.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile.addresses = action.payload || [];
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unknown error";
      })
      .addCase(deleteAddress.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile.addresses = action.payload || [];
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unknown error";
      })
      .addCase(setDefaultAddress.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile.addresses = action.payload || [];
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unknown error";
      })
      .addCase(addToWishlist.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.wishlist = action.payload || [];
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unknown error";
      })
      .addCase(removeFromWishlist.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.wishlist = action.payload || [];
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unknown error";
      });
  },
});

export const { clearUserData, updateWishlist } = userSlice.actions;
export default userSlice.reducer;