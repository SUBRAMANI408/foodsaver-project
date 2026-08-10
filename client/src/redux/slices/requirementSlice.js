import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const requirementService = {
  // NGO
  createRequirement: (data) => api.post('/requirements', data),
  getMyRequirements: (params) => api.get('/requirements/my', { params }),
  acceptSponsorship: (reqId, sponsId) => api.put(`/requirements/${reqId}/sponsorships/${sponsId}/accept`),
  rejectSponsorship: (reqId, sponsId, data) => api.put(`/requirements/${reqId}/sponsorships/${sponsId}/reject`, data),
  cancelRequirement: (id) => api.delete(`/requirements/${id}`),
  getRequirement: (id) => api.get(`/requirements/${id}`),
  // Merchant
  getNearbyRequirements: (params) => api.get('/requirements/nearby', { params }),
  submitSponsorship: (reqId, data) => api.post(`/requirements/${reqId}/sponsor`, data),
  editSponsorship: (reqId, data) => api.put(`/requirements/${reqId}/sponsor/edit`, data),
  getMySponsorships: (params) => api.get('/requirements/my-sponsorships', { params }),
};

export const fetchMyRequirements = createAsyncThunk(
  'requirements/fetchMy',
  async (params, { rejectWithValue }) => {
    try {
      const res = await requirementService.getMyRequirements(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch');
    }
  }
);

export const fetchNearbyRequirements = createAsyncThunk(
  'requirements/fetchNearby',
  async (params, { rejectWithValue }) => {
    try {
      const res = await requirementService.getNearbyRequirements(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch nearby');
    }
  }
);

export const createRequirementThunk = createAsyncThunk(
  'requirements/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await requirementService.createRequirement(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create');
    }
  }
);

export const submitSponsorshipThunk = createAsyncThunk(
  'requirements/sponsor',
  async ({ reqId, data }, { rejectWithValue }) => {
    try {
      const res = await requirementService.submitSponsorship(reqId, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to submit');
    }
  }
);

export const editSponsorshipThunk = createAsyncThunk(
  'requirements/editSponsor',
  async ({ reqId, data }, { rejectWithValue }) => {
    try {
      const res = await requirementService.editSponsorship(reqId, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update');
    }
  }
);

export const acceptSponsorshipThunk = createAsyncThunk(
  'requirements/accept',
  async ({ reqId, sponsId }, { rejectWithValue }) => {
    try {
      const res = await requirementService.acceptSponsorship(reqId, sponsId);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to accept');
    }
  }
);

export const rejectSponsorshipThunk = createAsyncThunk(
  'requirements/reject',
  async ({ reqId, sponsId, reason }, { rejectWithValue }) => {
    try {
      const res = await requirementService.rejectSponsorship(reqId, sponsId, { reason });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to reject');
    }
  }
);

export const fetchMySponsorships = createAsyncThunk(
  'requirements/mySpons',
  async (params, { rejectWithValue }) => {
    try {
      const res = await requirementService.getMySponsorships(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch sponsorships');
    }
  }
);

const requirementSlice = createSlice({
  name: 'requirements',
  initialState: {
    myRequirements: [],
    nearbyRequirements: [],
    mySponsorships: [],
    loading: false,
    error: null,
    successMsg: null,
  },
  reducers: {
    clearMsg: (state) => { state.error = null; state.successMsg = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchMyRequirements.pending, pending)
      .addCase(fetchMyRequirements.fulfilled, (state, action) => {
        state.loading = false;
        state.myRequirements = action.payload;
      })
      .addCase(fetchMyRequirements.rejected, rejected)

      .addCase(fetchNearbyRequirements.pending, pending)
      .addCase(fetchNearbyRequirements.fulfilled, (state, action) => {
        state.loading = false;
        state.nearbyRequirements = action.payload;
      })
      .addCase(fetchNearbyRequirements.rejected, rejected)

      .addCase(createRequirementThunk.pending, pending)
      .addCase(createRequirementThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.myRequirements.unshift(action.payload);
        state.successMsg = 'Food requirement created & merchants notified!';
      })
      .addCase(createRequirementThunk.rejected, rejected)

      .addCase(submitSponsorshipThunk.pending, pending)
      .addCase(submitSponsorshipThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMsg = 'Sponsorship offer submitted!';
        state.nearbyRequirements = state.nearbyRequirements.map((r) =>
          r._id === action.payload.requirement ? { ...r, alreadySponsored: true } : r
        );
      })
      .addCase(submitSponsorshipThunk.rejected, rejected)

      .addCase(editSponsorshipThunk.pending, pending)
      .addCase(editSponsorshipThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMsg = 'Sponsorship updated!';
      })
      .addCase(editSponsorshipThunk.rejected, rejected)

      .addCase(acceptSponsorshipThunk.pending, pending)
      .addCase(acceptSponsorshipThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMsg = 'Sponsorship accepted! Chat is now enabled.';
        const updated = action.payload.requirement;
        state.myRequirements = state.myRequirements.map((r) =>
          r._id === updated._id ? { ...r, ...updated } : r
        );
      })
      .addCase(acceptSponsorshipThunk.rejected, rejected)

      .addCase(rejectSponsorshipThunk.pending, pending)
      .addCase(rejectSponsorshipThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMsg = 'Sponsorship rejected.';
      })
      .addCase(rejectSponsorshipThunk.rejected, rejected)

      .addCase(fetchMySponsorships.pending, pending)
      .addCase(fetchMySponsorships.fulfilled, (state, action) => {
        state.loading = false;
        state.mySponsorships = action.payload;
      })
      .addCase(fetchMySponsorships.rejected, rejected);
  },
});

export const { clearMsg } = requirementSlice.actions;
export default requirementSlice.reducer;
