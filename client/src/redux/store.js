import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import foodReducer from './slices/foodSlice';
import orderReducer from './slices/orderSlice';
import uiReducer from './slices/uiSlice';
import requirementReducer from './slices/requirementSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    food: foodReducer,
    orders: orderReducer,
    ui: uiReducer,
    requirements: requirementReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['orders/addToCart'],
      },
    }),
});

export default store;

