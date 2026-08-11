import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (data) => api.post('/auth/google', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const foodService = {
  getAll: (params) => api.get('/food', { params }),
  getOne: (id) => api.get(`/food/${id}`),
  getTrending: () => api.get('/food/trending'),
  getMyItems: (params) => api.get('/food/merchant/my', { params }),
  create: (data) => api.post('/food', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/food/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/food/${id}`),
  donate: (id, data) => api.post(`/food/${id}/donate`, data),
};

export const orderService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  getMerchantOrders: (params) => api.get('/orders/merchant', { params }),
  getAllOrders: (params) => api.get('/orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  cancel: (id, data) => api.put(`/orders/${id}/cancel`, data),
};

export const paymentService = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  getMyPayments: () => api.get('/payments/my'),
  getAllPayments: (params) => api.get('/payments', { params }),
};

export const merchantService = {
  getNearby: (params) => api.get('/merchants/nearby', { params }),
  getProfile: (id) => api.get(`/merchants/${id}`),
  getDashboard: () => api.get('/merchants/dashboard'),
  updateProfile: (data) => api.put('/merchants/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const reviewService = {
  create: (data) => api.post('/reviews', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMerchantReviews: (merchantId, params) => api.get(`/reviews/merchant/${merchantId}`, { params }),
  respond: (id, data) => api.put(`/reviews/${id}/respond`, data),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  getMerchants: (params) => api.get('/admin/merchants', { params }),
  verifyMerchant: (id) => api.put(`/admin/merchants/${id}/verify`),
};

