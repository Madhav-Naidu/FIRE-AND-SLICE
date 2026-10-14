const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && !options.skipAuth) {
    headers.Authorization = `Bearer ${token}`;
  } else if (adminToken && options.useAdminAuth) {
    headers.Authorization = `Bearer ${adminToken}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || 'Request failed', response.status, data);
  }

  return data;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
};

export const pizzaApi = {
  getMenu: () => api.get('/pizzas/menu'),
  getInventoryByCategory: (category) => api.get(`/inventory/category/${category}`),
};

export const orderApi = {
  createOrder: (data) => api.post('/orders', data),
  createRazorpayOrder: (amount) => api.post('/orders/create-order', { amount }),
  verifyPayment: (data) => api.post('/orders/verify-payment', data),
  getUserOrders: () => api.get('/orders/user'),
  getOrder: (id) => api.get(`/orders/${id}`),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getAllOrders: () => api.get('/orders'),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

export const inventoryApi = {
  getAll: () => api.get('/inventory'),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  getByCategory: (category) => api.get(`/inventory/category/${category}`),
};

export const adminApi = {
  login: (data) => api.post('/admin/login', data),
  getProfile: () => api.get('/admin/me', { useAdminAuth: true }),
};

export { ApiError };