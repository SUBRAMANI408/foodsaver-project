import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchCommunityPosts = createAsyncThunk(
  'merchantCommunity/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/community/posts');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const fetchMerchantDirectory = createAsyncThunk(
  'merchantCommunity/fetchDirectory',
  async (nearby = false, { rejectWithValue }) => {
    try {
      const response = await api.get(`/community/directory${nearby ? '?nearby=true' : ''}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch merchant directory');
    }
  }
);

export const createCommunityPost = createAsyncThunk(
  'merchantCommunity/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await api.post('/community/posts', postData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const sendFoodRequest = createAsyncThunk(
  'merchantCommunity/sendRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await api.post('/community/requests', requestData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send request');
    }
  }
);

export const fetchReceivedRequests = createAsyncThunk(
  'merchantCommunity/fetchReceivedRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/community/requests/received');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch received requests');
    }
  }
);

export const fetchSentRequests = createAsyncThunk(
  'merchantCommunity/fetchSentRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/community/requests/sent');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sent requests');
    }
  }
);

export const updateRequestStatus = createAsyncThunk(
  'merchantCommunity/updateRequestStatus',
  async ({ requestId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/community/requests/${requestId}/status`, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update request');
    }
  }
);

export const completeRequest = createAsyncThunk(
  'merchantCommunity/completeRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/community/requests/${requestId}/complete`);
      return response.data.data; // usually returns the updated post or request
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete transfer');
    }
  }
);

const initialState = {
  posts: [],
  receivedRequests: [],
  sentRequests: [],
  merchantDirectory: [],
  loading: false,
  error: null,
};

const merchantCommunitySlice = createSlice({
  name: 'merchantCommunity',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchCommunityPosts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCommunityPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchCommunityPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Directory
      .addCase(fetchMerchantDirectory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMerchantDirectory.fulfilled, (state, action) => {
        state.loading = false;
        state.merchantDirectory = action.payload;
      })
      .addCase(fetchMerchantDirectory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Post
      .addCase(createCommunityPost.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createCommunityPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createCommunityPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Received Requests
      .addCase(fetchReceivedRequests.pending, (state) => { state.loading = true; })
      .addCase(fetchReceivedRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.receivedRequests = action.payload;
      })
      .addCase(fetchReceivedRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Sent Requests
      .addCase(fetchSentRequests.pending, (state) => { state.loading = true; })
      .addCase(fetchSentRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.sentRequests = action.payload;
      })
      .addCase(fetchSentRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Request Status
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const index = state.receivedRequests.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.receivedRequests[index] = action.payload;
        }
      })
      
      // Complete Request
      .addCase(completeRequest.fulfilled, (state, action) => {
        const index = state.receivedRequests.findIndex(r => r._id === action.payload.request._id);
        if (index !== -1) {
          state.receivedRequests[index] = action.payload.request;
        }
        // Also update post if returned
        if (action.payload.post) {
          const postIndex = state.posts.findIndex(p => p._id === action.payload.post._id);
          if (postIndex !== -1) {
            state.posts[postIndex] = action.payload.post;
          }
        }
      });
  }
});

export const { clearError } = merchantCommunitySlice.actions;
export default merchantCommunitySlice.reducer;
