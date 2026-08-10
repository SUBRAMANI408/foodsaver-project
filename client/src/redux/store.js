import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import foodReducer from './slices/foodSlice';
import orderReducer from './slices/orderSlice';
import uiReducer from './slices/uiSlice';
import requirementReducer from './slices/requirementSlice';
import chatReducer from './slices/chatSlice';
import merchantCommunityReducer from './slices/merchantCommunitySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    food: foodReducer,
    orders: orderReducer,
    ui: uiReducer,
    requirements: requirementReducer,
    chat: chatReducer,
    merchantCommunity: merchantCommunityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['orders/addToCart'],
      },
    }),
});

export default store;

