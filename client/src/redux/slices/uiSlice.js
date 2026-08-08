import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode: localStorage.getItem('savebite_theme') === 'dark',
    sidebarOpen: true,
    mobileSidebarOpen: false,
    notifications: [],
    unreadCount: 0,
    searchQuery: '',
    activeModal: null,
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('savebite_theme', state.darkMode ? 'dark' : 'light');
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    toggleMobileSidebar: (state) => { state.mobileSidebarOpen = !state.mobileSidebarOpen; },
    closeMobileSidebar: (state) => { state.mobileSidebarOpen = false; },
    setSearchQuery: (state, action) => { state.searchQuery = action.payload; },
    setActiveModal: (state, action) => { state.activeModal = action.payload; },
    closeModal: (state) => { state.activeModal = null; },
    setNotifications: (state, action) => {
      state.notifications = action.payload.data;
      state.unreadCount = action.payload.unreadCount;
    },
    markNotificationRead: (state, action) => {
      const n = state.notifications.find((n) => n._id === action.payload);
      if (n && !n.isRead) {
        n.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
});

export const {
  toggleDarkMode, toggleSidebar, toggleMobileSidebar, closeMobileSidebar,
  setSearchQuery, setActiveModal, closeModal, setNotifications, markNotificationRead, addNotification,
} = uiSlice.actions;
export default uiSlice.reducer;
