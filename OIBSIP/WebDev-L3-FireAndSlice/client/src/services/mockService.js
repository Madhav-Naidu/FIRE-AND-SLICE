// ============================================================================
// FIRE & SLICE ? Offline / Static Deployment Mock Engine
// Powers GitHub Pages and zero-backend demonstration mode with 100% fidelity
// ============================================================================

const STORAGE_KEYS = {
  USERS: 'fs_mock_users',
  CURRENT_USER: 'fs_mock_current_user',
  ORDERS: 'fs_mock_orders',
  INVENTORY: 'fs_mock_inventory',
};

const DEFAULT_DEMO_USER = {
  _id: 'usr_demo_marco',
  name: 'Marco Bellini',
  email: 'demo@fireandslice.com',
  role: 'customer',
  isVerified: true,
  createdAt: new Date().toISOString(),
};

const DEFAULT_ADMIN_USER = {
  _id: 'admin_root_01',
  username: 'admin',
  email: 'admin@fireandslice.com',
  role: 'superadmin',
};

const INITIAL_INVENTORY = [
  // Bases
  { _id: 'inv_base_1', category: 'base', name: '72h Neapolitan Biga', stock: 84, unit: 'crusts', threshold: 25, price: 60 },
  { _id: 'inv_base_2', category: 'base', name: 'Thin Crust', stock: 65, unit: 'crusts', threshold: 20, price: 50 },
  { _id: 'inv_base_3', category: 'base', name: 'Regular Crust', stock: 70, unit: 'crusts', threshold: 20, price: 60 },
  { _id: 'inv_base_4', category: 'base', name: 'Thick Crust', stock: 45, unit: 'crusts', threshold: 20, price: 70 },
  { _id: 'inv_base_5', category: 'base', name: 'Cheese Burst', stock: 32, unit: 'crusts', threshold: 15, price: 100 },
  { _id: 'inv_base_6', category: 'base', name: 'Wheat Crust', stock: 40, unit: 'crusts', threshold: 20, price: 80 },

  // Sauces
  { _id: 'inv_sauce_1', category: 'sauce', name: 'San Marzano DOP', stock: 42, unit: 'litres', threshold: 15, price: 30 },
  { _id: 'inv_sauce_2', category: 'sauce', name: 'Marinara', stock: 55, unit: 'litres', threshold: 20, price: 20 },
  { _id: 'inv_sauce_3', category: 'sauce', name: 'Pesto', stock: 28, unit: 'litres', threshold: 12, price: 30 },
  { _id: 'inv_sauce_4', category: 'sauce', name: 'BBQ', stock: 35, unit: 'litres', threshold: 15, price: 25 },
  { _id: 'inv_sauce_5', category: 'sauce', name: 'Alfredo', stock: 24, unit: 'litres', threshold: 10, price: 35 },
  { _id: 'inv_sauce_6', category: 'sauce', name: 'Spicy Red', stock: 38, unit: 'litres', threshold: 15, price: 25 },

  // Cheeses
  { _id: 'inv_cheese_1', category: 'cheese', name: 'Fior di Latte Mozzarella', stock: 60, unit: 'kg', threshold: 20, price: 40 },
  { _id: 'inv_cheese_2', category: 'cheese', name: 'Mozzarella', stock: 75, unit: 'kg', threshold: 25, price: 40 },
  { _id: 'inv_cheese_3', category: 'cheese', name: 'Cheddar', stock: 45, unit: 'kg', threshold: 15, price: 45 },
  { _id: 'inv_cheese_4', category: 'cheese', name: 'Parmesan', stock: 35, unit: 'kg', threshold: 15, price: 50 },
  { _id: 'inv_cheese_5', category: 'cheese', name: 'Vegan Cheese', stock: 22, unit: 'kg', threshold: 10, price: 60 },

  // Vegetables
  { _id: 'inv_veg_1', category: 'vegetable', name: 'Fire-Roasted Peppers', stock: 35, unit: 'kg', threshold: 10, price: 15 },
  { _id: 'inv_veg_2', category: 'vegetable', name: 'Onions', stock: 65, unit: 'kg', threshold: 25, price: 10 },
  { _id: 'inv_veg_3', category: 'vegetable', name: 'Tomatoes', stock: 58, unit: 'kg', threshold: 20, price: 10 },
  { _id: 'inv_veg_4', category: 'vegetable', name: 'Mushrooms', stock: 42, unit: 'kg', threshold: 15, price: 20 },
  { _id: 'inv_veg_5', category: 'vegetable', name: 'Olives', stock: 30, unit: 'kg', threshold: 12, price: 15 },
  { _id: 'inv_veg_6', category: 'vegetable', name: 'Jalapeños', stock: 26, unit: 'kg', threshold: 10, price: 15 },
  { _id: 'inv_veg_7', category: 'vegetable', name: 'Corn', stock: 48, unit: 'kg', threshold: 15, price: 10 },
  { _id: 'inv_veg_8', category: 'vegetable', name: 'Spinach', stock: 25, unit: 'kg', threshold: 10, price: 15 },
];

const INITIAL_ORDERS = [
  {
    _id: 'ord_10248',
    orderNumber: 'FS-10248',
    customerName: 'Marco Bellini',
    customerEmail: 'demo@fireandslice.com',
    phone: '+91 98201 54321',
    deliveryAddress: 'Via Vesuvio 12, Downtown Flagship',
    status: 'In Kitchen',
    totalPrice: 870,
    totalAmount: 870,
    paymentMethod: 'UPI Instant',
    paymentStatus: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    items: [
      { name: 'Fire Margherita', size: 'Personal (8")', quantity: 1, price: 420, crust: '72h Biga' },
      { name: 'Smoked Paneer', size: 'Medium (11")', quantity: 1, price: 450, crust: '72h Biga' },
    ],
  },
  {
    _id: 'ord_10249',
    orderNumber: 'FS-10249',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav@fireandslice.com',
    phone: '+91 98112 33445',
    deliveryAddress: 'Flat 402, Artisan Heights',
    status: 'Order Received',
    totalPrice: 799,
    totalAmount: 799,
    paymentMethod: 'Card on Arrival',
    paymentStatus: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    items: [
      { name: 'Chicken Peri-Peri', size: 'Large (14")', quantity: 1, price: 799, crust: 'Cheese Burst' },
    ],
  },
  {
    _id: 'ord_10247',
    orderNumber: 'FS-10247',
    customerName: 'Devika Nair',
    customerEmail: 'devika@fireandslice.com',
    phone: '+91 97654 11223',
    deliveryAddress: 'Villa 18, Palm Meadows',
    status: 'Sent to Delivery',
    totalPrice: 1120,
    totalAmount: 1120,
    paymentMethod: 'UPI Instant',
    paymentStatus: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    items: [
      { name: 'Farmhouse Fire', size: 'Medium (11")', quantity: 2, price: 998, crust: 'Neapolitan' },
      { name: 'Truffle Garlic Knots', size: 'Personal', quantity: 1, price: 122 },
    ],
  },
];

const INITIAL_PIZZAS = [
  {
    _id: 'pizza-margherita',
    name: 'Fire Margherita',
    description: 'San Marzano DOP tomato pulp, fior di latte mozzarella, aromatic hand-torn basil, cold-pressed EVOO.',
    categories: ['signature', 'veg', 'cheese'],
    badge: 'PURE VEG',
    price: 299,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbDCt--g1Hho1ldUPTrR3sQ9zTmh9eDtSDGpxq1mqM5JbQVoQCOvFU5dUWCeBTJbeke9V5wjTVpAE1Vm5Qn8UTZTzZ1bByhxf52AP8pkp3uRjq-ATRg0bD6nV4lVRKS4hMRl1kjDXTBDa-uiSJHXb5yX-T1Y4AQE_NLZDDGqa3foUQCbjimSJP12E1QETihH9G07WV_aQpJOjP20BQDnRZXJQjlNxGWB9Bz5PYReDr0z-S88UYk5lfuQ',
    prices: { Personal: 299, Medium: 469, Large: 649 },
  },
  {
    _id: 'pizza-paneer',
    name: 'Smoked Paneer',
    description: 'Smoked artisanal cottage cheese, fire-roasted sweet peppers, caramelized shallots, smoked scamorza cheese blend.',
    categories: ['signature', 'veg', 'spicy'],
    badge: 'PURE VEG',
    price: 349,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqCX8SgCC4Cbp2atb-HmXV0HeY2pACfUf8nJRCKwQS1joYvGOSWdWLD9_uC-WYVgcCuXxmjhy_oG-cWZ143r7b417qf4RLXD8t-6FL9aC0e40kICMi3KVcRp9LtDIcrnjfRfLoxFuFUz-oyGHrJs8n2EcglGQlkRF94y2Fnkho_Xt-k0yGXYg1pml9Sg3qxhbcvgna9YpkyQBJYCw6HBOMaG8sRHK4izgmsvTef44dllGUxnzXp8EF1A',
    prices: { Personal: 349, Medium: 529, Large: 719 },
  },
  {
    _id: 'pizza-farmhouse',
    name: 'Farmhouse Fire',
    description: 'Wild cremini mushrooms, charred bell peppers, charred sweet corn, sun-ripened olives, crushed thyme.',
    categories: ['signature', 'veg'],
    badge: 'PURE VEG',
    price: 329,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-thnkd6HsTEdrSv_GPk78auySX7Z5uXtZ1ZoduCRhZ5vLiqFU8-jHoi5G3q0bfTWDe-rNX88cvUrh_F8B0ZxwdAJg_CQRC-1tj0rZkg06A_FFOcCAoqcLfNZmQM6-r-GS1boGl3bT2dVfxcDLZUA2XN05P6-q6VLLLIyJVlOP-XT5RvxcGT1Mm5C2vm1pwgtey-_YrmZdD1r3xIj4kTEf2sGHyA9-3AvioDHOZssn3HEoUDFFjNJXeQ',
    prices: { Personal: 329, Medium: 499, Large: 689 },
  },
  {
    _id: 'pizza-periperi',
    name: 'Chicken Peri-Peri',
    description: "Oak flame-grilled spiced chicken breast, fire-roasted jalapeños, smoked mozzarella, house bird's-eye chili emulsion.",
    categories: ['signature', 'spicy'],
    badge: 'NON-VEG',
    price: 379,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc3pHvT54uCaepwbIuV6zaCZtDtvc2Za4g6hu3Nrg5khrggzkLwEJ8XCQ0qkgKjSBtnBMYEEOhU1w_xGxKoIxhV-_mmlMAI9yMrrau5J1dqLpOstB7kQjb8JwzN0rQGXGluriCYztNqfzNkIa1T1ex2ilJwPaAW10J5h0xCCCXby2SyTJ1xCaDocEM69tC1gYKzVmp1SOlV3DUnJ8YrD3t_9eG9mf0oQwnyzAaNXl2lya9Tl3rPZAJDQ',
    prices: { Personal: 379, Medium: 579, Large: 799 },
  },
];

function getStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

export const mockService = {
  // ----------------------------------------------------
  // AUTHENTICATION
  // ----------------------------------------------------
  login: async ({ email, password }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = getStored(STORAGE_KEYS.USERS, [DEFAULT_DEMO_USER]);

    // Demo patron account login
    if (cleanEmail === 'demo@fireandslice.com') {
      const user = DEFAULT_DEMO_USER;
      setStored(STORAGE_KEYS.CURRENT_USER, user);
      return {
        token: 'fs_mock_jwt_token_patron_' + Date.now(),
        user,
      };
    }

    // Check existing stored user
    const existing = users.find((u) => (u.email || '').toLowerCase() === cleanEmail);
    if (existing) {
      setStored(STORAGE_KEYS.CURRENT_USER, existing);
      return {
        token: 'fs_mock_jwt_token_' + Date.now(),
        user: existing,
      };
    }

    // Auto-create patron account for reviewer / evaluator email
    const namePart = cleanEmail.split('@')[0] || 'Chef';
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const newUser = {
      _id: 'usr_' + Date.now(),
      name: formattedName,
      email: cleanEmail,
      role: 'customer',
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    setStored(STORAGE_KEYS.CURRENT_USER, newUser);

    return {
      token: 'fs_mock_jwt_token_' + Date.now(),
      user: newUser,
    };
  },

  adminLogin: async ({ username, password }) => {
    const cleanUsername = (username || '').trim().toLowerCase();
    if (cleanUsername === 'admin' || cleanUsername === 'admin@fireandslice.com') {
      return {
        token: 'fs_mock_admin_token_' + Date.now(),
        admin: DEFAULT_ADMIN_USER,
      };
    }

    // Friendly demo fallback: accept if starts with admin
    if (cleanUsername.includes('admin')) {
      return {
        token: 'fs_mock_admin_token_' + Date.now(),
        admin: {
          ...DEFAULT_ADMIN_USER,
          username: cleanUsername,
        },
      };
    }

    throw new Error('Invalid credentials. Use admin / admin123');
  },

  register: async ({ name, email, password }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = getStored(STORAGE_KEYS.USERS, [DEFAULT_DEMO_USER]);

    const newUser = {
      _id: 'usr_' + Date.now(),
      name: name || cleanEmail.split('@')[0] || 'Patron',
      email: cleanEmail,
      role: 'customer',
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    setStored(STORAGE_KEYS.CURRENT_USER, newUser);

    return {
      token: 'fs_mock_jwt_token_' + Date.now(),
      user: newUser,
    };
  },

  forgotPassword: async (email) => {
    return {
      success: true,
      message: `Password reset instructions dispatched to ${email || 'your email'}`,
    };
  },

  resetPassword: async ({ token, password }) => {
    return {
      success: true,
      message: 'Password updated successfully. You can now sign in.',
    };
  },

  verifyEmail: async (token) => {
    return {
      success: true,
      message: 'Email credentials successfully verified',
    };
  },

  getMe: async () => {
    const current = getStored(STORAGE_KEYS.CURRENT_USER, null);
    if (current) return current;
    const token = localStorage.getItem('token');
    if (token) return DEFAULT_DEMO_USER;
    throw new Error('Unauthenticated');
  },

  getAdminProfile: async () => {
    return DEFAULT_ADMIN_USER;
  },

  // ----------------------------------------------------
  // PIZZA MENU & INGREDIENTS
  // ----------------------------------------------------
  getMenu: async () => {
    return INITIAL_PIZZAS;
  },

  getInventory: async (category) => {
    const inventory = getStored(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    if (!category) return inventory;
    return inventory.filter((item) => item.category === category);
  },

  updateInventoryItem: async (id, data) => {
    const inventory = getStored(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    const updated = inventory.map((item) =>
      item._id === id ? { ...item, ...data } : item
    );
    setStored(STORAGE_KEYS.INVENTORY, updated);
    return updated.find((item) => item._id === id) || { _id: id, ...data };
  },

  // ----------------------------------------------------
  // ORDERS & LIVE TRACKING
  // ----------------------------------------------------
  createOrder: async (orderPayload) => {
    const orders = getStored(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const currentUser = getStored(STORAGE_KEYS.CURRENT_USER, DEFAULT_DEMO_USER);

    const newOrder = {
      _id: 'ord_' + Date.now(),
      orderNumber: 'FS-' + Math.floor(10000 + Math.random() * 90000),
      customerName: currentUser?.name || 'Marco Bellini',
      customerEmail: currentUser?.email || 'demo@fireandslice.com',
      phone: orderPayload.phone || '+91 98201 54321',
      deliveryAddress: orderPayload.deliveryAddress || 'Downtown Flagship',
      status: 'In Kitchen',
      totalPrice: orderPayload.totalAmount || 0,
      totalAmount: orderPayload.totalAmount || 0,
      paymentMethod: orderPayload.paymentMethod || 'UPI Instant',
      paymentStatus: 'completed',
      createdAt: new Date().toISOString(),
      items: orderPayload.items || [],
      instructions: orderPayload.instructions || '',
      velocity: orderPayload.velocity || 'standard',
    };

    orders.unshift(newOrder);
    setStored(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  },

  getUserOrders: async () => {
    const orders = getStored(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return orders;
  },

  getOrderById: async (id) => {
    const orders = getStored(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const found = orders.find((o) => o._id === id || o.orderNumber === id);
    if (found) {
      // Simulate live status advancement based on elapsed time
      const elapsedMs = Date.now() - new Date(found.createdAt).getTime();
      let dynamicStatus = found.status;
      if (dynamicStatus === 'In Kitchen' && elapsedMs > 1000 * 45) {
        dynamicStatus = 'Sent to Delivery';
      } else if (dynamicStatus === 'Sent to Delivery' && elapsedMs > 1000 * 120) {
        dynamicStatus = 'Delivered';
      }
      return { ...found, status: dynamicStatus };
    }
    return {
      _id: id,
      orderNumber: 'FS-10248',
      status: 'In Kitchen',
      totalAmount: 870,
      createdAt: new Date().toISOString(),
      items: [{ name: 'Fire Margherita', size: 'Personal', quantity: 1, price: 420 }],
    };
  },

  getAllOrders: async () => {
    return getStored(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },

  updateOrderStatus: async (orderId, newStatus) => {
    const orders = getStored(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const updated = orders.map((o) =>
      o._id === orderId ? { ...o, status: newStatus } : o
    );
    setStored(STORAGE_KEYS.ORDERS, updated);
    return updated.find((o) => o._id === orderId);
  },

  // ----------------------------------------------------
  // RAZORPAY PAYMENT SIMULATION
  // ----------------------------------------------------
  createRazorpayOrder: async (amount) => {
    return {
      id: 'order_mock_' + Math.random().toString(36).substring(2, 11),
      amount: Math.round((Number(amount) || 100) * 100),
      currency: 'INR',
      status: 'created',
    };
  },

  verifyPayment: async (data) => {
    return {
      success: true,
      message: 'Demo payment signature verified successfully',
      paymentId: 'pay_mock_' + Date.now(),
    };
  },
};
