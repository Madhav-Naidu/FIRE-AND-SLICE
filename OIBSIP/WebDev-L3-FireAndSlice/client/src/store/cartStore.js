import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const INITIAL_ITEMS = [
  {
    id: 'cart-init-1',
    name: 'Fire Margherita',
    size: 'Personal (8")',
    price: 299,
    quantity: 1,
    crust: '72h Sourdough',
    additions: [],
  },
  {
    id: 'cart-init-2',
    name: 'Smoked Paneer',
    size: 'Medium (11")',
    price: 529,
    quantity: 1,
    crust: '72h Sourdough',
    additions: ['Extra Fresh Basil'],
  },
];

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: INITIAL_ITEMS,
      isOpen: false,
      voucher: '',
      discount: 0,
      packagingFee: 42,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (item) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (i) => i.name === item.name && i.size === item.size && JSON.stringify(i.additions) === JSON.stringify(item.additions || [])
        );

        if (existingIndex > -1) {
          const updated = [...items];
          updated[existingIndex].quantity += item.quantity || 1;
          set({ items: updated, isOpen: true });
        } else {
          set({
            items: [
              ...items,
              {
                id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                quantity: item.quantity || 1,
                additions: item.additions || [],
                ...item,
              },
            ],
            isOpen: true,
          });
        }
      },

      updateQuantity: (id, delta) => {
        const { items } = get();
        const updated = items
          .map((i) => {
            if (i.id === id) {
              const newQty = i.quantity + delta;
              return newQty > 0 ? { ...i, quantity: newQty } : null;
            }
            return i;
          })
          .filter(Boolean);
        set({ items: updated });
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },

      clearCart: () => set({ items: [], voucher: '', discount: 0 }),

      applyVoucher: (code) => {
        const normalized = (code || '').trim().toUpperCase();
        const subtotal = get().getSubtotal();

        if (normalized === 'FIRST20') {
          const discount = Math.round(subtotal * 0.2);
          set({ voucher: 'FIRST20', discount });
          return { success: true, message: 'FIRST20 applied: 20% discount added!' };
        } else if (normalized === 'WEEKEND499') {
          if (subtotal > 499) {
            const discount = Math.max(0, subtotal - 499);
            set({ voucher: 'WEEKEND499', discount });
            return { success: true, message: 'WEEKEND499 applied: Flat ₹499 pack rate!' };
          } else {
            return { success: false, message: 'Order subtotal must exceed ₹499 for WEEKEND499.' };
          }
        } else if (normalized === 'BUY2GET1') {
          const discount = 299;
          set({ voucher: 'BUY2GET1', discount });
          return { success: true, message: 'BUY2GET1 applied: Free Margherita value (₹299) deducted!' };
        } else {
          return { success: false, message: 'Invalid coupon code. Try FIRST20 or WEEKEND499.' };
        }
      },

      removeVoucher: () => set({ voucher: '', discount: 0 }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
      },

      getTotalCount: () => {
        return get().items.reduce((count, item) => count + (item.quantity || 1), 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const { discount, packagingFee } = get();
        return Math.max(0, subtotal - discount + packagingFee);
      },
    }),
    {
      name: 'fire-and-slice-cart',
      partialize: (state) => ({
        items: state.items,
        voucher: state.voucher,
        discount: state.discount,
      }),
    }
  )
);
