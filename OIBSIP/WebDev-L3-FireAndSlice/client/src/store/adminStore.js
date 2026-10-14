import { create } from 'zustand';

export const useAdminStore = create((set) => ({
  inventory: [],
  orders: [],
  selectedOrder: null,
  loading: false,
  inventoryLoading: false,
  ordersLoading: false,

  setInventory: (inventory) => set({ inventory }),
  addInventoryItem: (item) => set(state => ({ inventory: [...state.inventory, item] })),
  updateInventoryItem: (id, data) => set(state => ({
    inventory: state.inventory.map(item => item._id === id ? { ...item, ...data } : item)
  })),
  deleteInventoryItem: (id) => set(state => ({
    inventory: state.inventory.filter(item => item._id !== id)
  })),
  setInventoryLoading: (loading) => set({ inventoryLoading: loading }),

  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set(state => ({ orders: [order, ...state.orders] })),
  updateOrder: (id, data) => set(state => ({
    orders: state.orders.map(order => order._id === id ? { ...order, ...data } : order)
  })),
  setOrdersLoading: (loading) => set({ ordersLoading: loading }),

  setSelectedOrder: (order) => set({ selectedOrder: order }),
  clearSelectedOrder: () => set({ selectedOrder: null }),
}));