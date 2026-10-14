import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialPizza = {
  base: null,
  sauce: null,
  cheese: null,
  vegetables: [],
};

const basePrices = {
  'Thin Crust': 50,
  'Regular Crust': 60,
  'Thick Crust': 70,
  'Cheese Burst': 100,
  'Wheat Crust': 80,
};

const saucePrices = {
  'Marinara': 20,
  'Pesto': 30,
  'BBQ': 25,
  'Alfredo': 35,
  'Spicy Red': 25,
};

const cheesePrices = {
  'Mozzarella': 40,
  'Cheddar': 45,
  'Parmesan': 50,
  'Vegan Cheese': 60,
};

const vegetablePrices = {
  'Onions': 10,
  'Tomatoes': 10,
  'Bell Peppers': 15,
  'Mushrooms': 20,
  'Olives': 15,
  'Jalapeños': 15,
  'Corn': 10,
  'Spinach': 15,
};

export const usePizzaStore = create(
  persist(
    (set, get) => ({
      pizza: initialPizza,
      step: 1,
      maxStep: 4,

      setBase: (base) => set({ pizza: { ...get().pizza, base }, step: 2 }),
      setSauce: (sauce) => set({ pizza: { ...get().pizza, sauce }, step: 3 }),
      setCheese: (cheese) => set({ pizza: { ...get().pizza, cheese }, step: 4 }),
      toggleVegetable: (vegetable) => {
        const { vegetables } = get().pizza;
        const newVegetables = vegetables.includes(vegetable)
          ? vegetables.filter(v => v !== vegetable)
          : [...vegetables, vegetable];
        set({ pizza: { ...get().pizza, vegetables: newVegetables } });
      },
      setVegetables: (vegetables) => set({ pizza: { ...get().pizza, vegetables } }),
      setStep: (step) => set({ step }),
      nextStep: () => set(state => ({ step: Math.min(state.step + 1, 4) })),
      prevStep: () => set(state => ({ step: Math.max(state.step - 1, 1) })),
      resetPizza: () => set({ pizza: initialPizza, step: 1 }),
      getPizza: () => get().pizza,
      getTotalPrice: () => {
        const { base, sauce, cheese, vegetables } = get().pizza;
        let total = 0;
        if (base) total += basePrices[base] || 0;
        if (sauce) total += saucePrices[sauce] || 0;
        if (cheese) total += cheesePrices[cheese] || 0;
        vegetables.forEach(v => { total += vegetablePrices[v] || 0; });
        return total;
      },
      getPizzaDetails: () => {
        const { base, sauce, cheese, vegetables } = get().pizza;
        return {
          base: base ? { name: base, price: basePrices[base] || 0 } : null,
          sauce: sauce ? { name: sauce, price: saucePrices[sauce] || 0 } : null,
          cheese: cheese ? { name: cheese, price: cheesePrices[cheese] || 0 } : null,
          vegetables: vegetables.map(v => ({ name: v, price: vegetablePrices[v] || 0 })),
          total: get().getTotalPrice(),
        };
      },
      isComplete: () => {
        const { base, sauce, cheese } = get().pizza;
        return base && sauce && cheese;
      },
      canProceed: () => {
        const { step, pizza } = get();
        switch (step) {
          case 1: return !!pizza.base;
          case 2: return !!pizza.sauce;
          case 3: return !!pizza.cheese;
          case 4: return true;
          default: return false;
        }
      },
    }),
    {
      name: 'pizza-builder',
      partialize: (state) => ({
        pizza: state.pizza,
        step: state.step,
      }),
    }
  )
);