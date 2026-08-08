import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services';

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.login(data);
    const { data: user, accessToken, refreshToken, role } = res.data;
    localStorage.setItem('savebite_token', accessToken);
    localStorage.setItem('savebite_refresh_token', refreshToken);
    localStorage.setItem('savebite_role', data.role || 'user');
    return { user, role: data.role || 'user' };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.register(data);
    const { data: user, accessToken, refreshToken } = res.data;
    localStorage.setItem('savebite_token', accessToken);
    localStorage.setItem('savebite_refresh_token', refreshToken);
    localStorage.setItem('savebite_role', data.role || 'user');
    return { user, role: data.role || 'user', otp: res.data.otp };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const res = await authService.getMe();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
  } catch {}
  localStorage.removeItem('savebite_token');
  localStorage.removeItem('savebite_refresh_token');
  localStorage.removeItem('savebite_role');
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    // In a real app, you would call authService.updateProfile(data)
    return data;
  } catch (err) {
    return rejectWithValue('Update failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    role: localStorage.getItem('savebite_role') || null,
    isAuthenticated: !!localStorage.getItem('savebite_token'),
    loading: false,
    error: null,
    initialized: false,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setUser: (state, action) => { state.user = action.payload; },
    setInitialized: (state) => { state.initialized = true; },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getMe
      .addCase(getMe.pending, (state) => { state.loading = true; })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.initialized = true;
        localStorage.removeItem('savebite_token');
        localStorage.removeItem('savebite_refresh_token');
        localStorage.removeItem('savebite_role');
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.initialized = false;
      });
  },
});

export const { clearError, setUser, setInitialized } = authSlice.actions;
export default authSlice.reducer;
