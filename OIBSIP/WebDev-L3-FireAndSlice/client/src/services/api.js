import { mockService } from './mockService';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

// Determines if running in a pure static host where no Node/Express server exists
const isStaticHost = () => {
  if (typeof window === 'undefined') return false;
  const { hostname, protocol } = window.location;
  return (
    hostname.includes('github.io') ||
    protocol === 'file:' ||
    window.__FORCE_MOCK_ENGINE__ === true
  );
};

// Dispatcher to the Mock Service based on endpoint & method
async function routeToMockEngine(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body || {};

  // Normalize endpoint URL (remove query strings for path matching)
  const [cleanPath, queryString] = endpoint.split('?');
  const params = new URLSearchParams(queryString || '');

  // 1. Auth routes
  if (cleanPath === '/auth/login' && method === 'POST') {
    return mockService.login(body);
  }
  if (cleanPath === '/admin/login' && method === 'POST') {
    return mockService.adminLogin(body);
  }
  if (cleanPath === '/auth/register' && method === 'POST') {
    return mockService.register(body);
  }
  if (cleanPath === '/auth/forgot-password' && method === 'POST') {
    return mockService.forgotPassword(body.email);
  }
  if (cleanPath === '/auth/reset-password' && method === 'POST') {
    return mockService.resetPassword(body);
  }
  if (cleanPath === '/auth/verify-email' && method === 'GET') {
    return mockService.verifyEmail(params.get('token'));
  }
  if (cleanPath === '/auth/me' && method === 'GET') {
    return mockService.getMe();
  }
  if (cleanPath === '/admin/me' && method === 'GET') {
    return mockService.getAdminProfile();
  }

  // 2. Pizzas & Menu
  if (cleanPath === '/pizzas/menu' && method === 'GET') {
    return mockService.getMenu();
  }

  // 3. Inventory
  if (cleanPath.startsWith('/inventory/category/') && method === 'GET') {
    const category = cleanPath.split('/inventory/category/')[1];
    return mockService.getInventory(category);
  }
  if (cleanPath === '/inventory' && method === 'GET') {
    return mockService.getInventory();
  }
  if (cleanPath.startsWith('/inventory/') && method === 'PUT') {
    const id = cleanPath.split('/inventory/')[1];
    return mockService.updateInventoryItem(id, body);
  }

  // 4. Orders
  if (cleanPath === '/orders/create-order' && method === 'POST') {
    return mockService.createRazorpayOrder(body.amount);
  }
  if (cleanPath === '/orders/verify-payment' && method === 'POST') {
    return mockService.verifyPayment(body);
  }
  if (cleanPath === '/orders/user' && method === 'GET') {
    return mockService.getUserOrders();
  }
  if (cleanPath === '/orders' && method === 'GET') {
    return mockService.getAllOrders();
  }
  if (cleanPath === '/orders' && method === 'POST') {
    return mockService.createOrder(body);
  }
  if (cleanPath.match(/^\/orders\/[^/]+\/status$/) && method === 'PUT') {
    const parts = cleanPath.split('/');
    const orderId = parts[2];
    return mockService.updateOrderStatus(orderId, body.status);
  }
  if (cleanPath.match(/^\/orders\/[^/]+$/) && method === 'GET') {
    const orderId = cleanPath.split('/orders/')[1];
    return mockService.getOrderById(orderId);
  }

  // Generic fallback if unknown
  return { success: true, message: 'Processed via Mock Engine' };
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

  const parsedBody = options.body && typeof options.body === 'string'
    ? (() => { try { return JSON.parse(options.body); } catch (e) { return {}; } })()
    : (options.body || {});

  const requestOptions = {
    ...options,
    body: parsedBody,
  };

  // If on static deployment (e.g. GitHub Pages), skip doomed network calls directly to mock engine
  if (isStaticHost()) {
    try {
      return await routeToMockEngine(endpoint, requestOptions);
    } catch (mockErr) {
      throw new ApiError(mockErr.message || 'Operation failed', 400, null);
    }
  }

  // Otherwise, attempt real backend network request
  const fetchConfig = {
    ...options,
    headers,
  };

  if (requestOptions.body && Object.keys(requestOptions.body).length > 0 && options.method !== 'GET') {
    fetchConfig.body = JSON.stringify(requestOptions.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, fetchConfig);
    const contentType = response.headers.get('content-type') || '';

    // If server returned an HTML page (like 404/502/503 HTML or SPA fallback index.html)
    if (contentType.includes('text/html')) {
      console.warn(`[FIRE & SLICE] Received HTML from ${API_BASE}${endpoint}. Seamlessly falling back to Mock Engine.`);
      return await routeToMockEngine(endpoint, requestOptions);
    }

    // Safely parse JSON
    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      console.warn(`[FIRE & SLICE] Non-JSON payload from ${API_BASE}${endpoint}. Falling back to Mock Engine.`);
      return await routeToMockEngine(endpoint, requestOptions);
    }

    if (!response.ok) {
      // If 404 Not Found, try fallback
      if (response.status === 404) {
        return await routeToMockEngine(endpoint, requestOptions);
      }
      throw new ApiError(data.message || 'Request failed', response.status, data);
    }

    return data;
  } catch (networkError) {
    // If it's an intentional API business error (e.g. 401 unauthorized with message), propagate it
    if (networkError instanceof ApiError) {
      throw networkError;
    }

    // Server offline or connection refused -> fallback to mock engine seamlessly
    console.warn(`[FIRE & SLICE] Server offline (${networkError.message}). Operating in Standalone Mock Mode.`);
    try {
      return await routeToMockEngine(endpoint, requestOptions);
    } catch (mockErr) {
      throw new ApiError(mockErr.message || 'Operation failed', 400, null);
    }
  }
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
  forgotPassword: (data) => api.post('/auth/forgot-password', typeof data === 'string' ? { email: data } : data),
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