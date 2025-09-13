"use client"

import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import orderReducer from "./slices/ordersSlice";
import productReducer from "./slices/productSlices"
import userReducer from "./slices/userSlice"

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    orders: orderReducer,
    products: productReducer,
    user: userReducer,
  },
});
