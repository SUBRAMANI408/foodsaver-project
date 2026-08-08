import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services';

export const createOrder = createAsyncThunk('orders/create', async (data, { rejectWithValue }) => {
  try {
    const res = await orderService.create(data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create order');
  }
});

export const fetchUserOrders = createAsyncThunk('orders/fetchUser', async (params, { rejectWithValue }) => {
  try {
    const res = await orderService.getMyOrders(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
  }
});

export const fetchMerchantOrders = createAsyncThunk('orders/fetchMerchant', async (params, { rejectWithValue }) => {
  try {
    const res = await orderService.getMerchantOrders(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
  }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, ...data }, { rejectWithValue }) => {
  try {
    const res = await orderService.updateStatus(id, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update order');
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: null,
    cart: [],
    loading: false,
    error: null,
    pagination: null,
  },
  reducers: {
    addToCart: (state, action) => {
      const { item, quantity = 1 } = action.payload;
      const existing = state.cart.find((c) => c._id === item._id);
      if (existing) {
        existing.cartQuantity = Math.min(existing.cartQuantity + quantity, item.availableQuantity);
      } else {
        state.cart.push({ ...item, cartQuantity: quantity });
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((c) => c._id !== action.payload);
    },
    updateCartQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cart.find((c) => c._id === id);
      if (item) item.cartQuantity = quantity;
    },
    clearCart: (state) => { state.cart = []; },
    setCurrentOrder: (state, action) => { state.currentOrder = action.payload; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => { state.loading = true; })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.cart = [];
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMerchantOrders.fulfilled, (state, action) => {
        state.orders = action.payload.data;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const idx = state.orders.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) state.orders[idx] = action.payload;
        if (state.currentOrder?._id === action.payload._id) state.currentOrder = action.payload;
      });
  },
});

export const { addToCart, removeFromCart, updateCartQuantity, clearCart, setCurrentOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer;
