"use client"

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunk to fetch products from API
export const fetchProducts = createAsyncThunk('products/fetch', async () => {
  const res = await fetch('/api/products')
  if (!res.ok) {
    throw new Error('Failed to fetch products')
  }
  const data = await res.json()
  // Return the 'data' array from the response
  return data.data.map(product => ({
    ...product,
    id: product._id // Map _id to id for consistency in the reducer
  }))
})

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    byId: {},
    allIds: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.byId = {}
        state.allIds = []

        // Ensure payload is an array
        if (Array.isArray(action.payload)) {
          action.payload.forEach((p) => {
            if (p.id) { // Check if id exists
              state.byId[p.id] = p
              state.allIds.push(p.id)
            } else {
              console.warn('Product missing id:', p)
            }
          })
        } else {
          console.error('Expected action.payload to be an array, got:', action.payload)
          state.status = 'failed'
          state.error = 'Invalid data format: Expected an array of products'
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  }
})

export default productsSlice.reducer