import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { foodService } from '../../services';

export const fetchFoodItems = createAsyncThunk('food/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await foodService.getAll(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch food');
  }
});

export const fetchTrending = createAsyncThunk('food/fetchTrending', async (_, { rejectWithValue }) => {
  try {
    const res = await foodService.getTrending();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch trending');
  }
});

export const fetchMerchantFood = createAsyncThunk('food/fetchMerchant', async (params, { rejectWithValue }) => {
  try {
    const res = await foodService.getMyItems(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch merchant food');
  }
});

export const createFoodItem = createAsyncThunk('food/create', async (data, { rejectWithValue }) => {
  try {
    const res = await foodService.create(data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create food item');
  }
});

export const deleteFoodItem = createAsyncThunk('food/delete', async (id, { rejectWithValue }) => {
  try {
    await foodService.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete food item');
  }
});

const foodSlice = createSlice({
  name: 'food',
  initialState: {
    items: [],
    trending: [],
    merchantItems: [],
    selectedItem: null,
    pagination: null,
    loading: false,
    error: null,
    filters: {
      category: '',
      minPrice: '',
      maxPrice: '',
      minDiscount: '',
      search: '',
      radius: 10,
      sort: '-createdAt',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFoodItems.pending, (state) => { state.loading = true; })
      .addCase(fetchFoodItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchFoodItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTrending.fulfilled, (state, action) => {
        state.trending = action.payload;
      })
      .addCase(fetchMerchantFood.pending, (state) => { state.loading = true; })
      .addCase(fetchMerchantFood.fulfilled, (state, action) => {
        state.loading = false;
        state.merchantItems = action.payload.data;
      })
      .addCase(fetchMerchantFood.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createFoodItem.fulfilled, (state, action) => {
        state.merchantItems.unshift(action.payload);
      })
      .addCase(deleteFoodItem.fulfilled, (state, action) => {
        state.merchantItems = state.merchantItems.filter((i) => i._id !== action.payload);
      });
  },
});

export const { setFilters, setSelectedItem, clearError } = foodSlice.actions;
export default foodSlice.reducer;
