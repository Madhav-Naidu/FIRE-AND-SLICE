import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data for authentic Fire & Slice experience
const initialInventory = [
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

const initialOrders = [
  {
    _id: 'ord_10248',
    orderNumber: 'FS-10248',
    customerName: 'Marco Valenti',
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
    phone: '+91 98112 33445',
    deliveryAddress: 'Flat 402, Artisan Heights',
    status: 'In Kitchen',
    totalPrice: 799,
    totalAmount: 799,
    paymentMethod: 'Card on Arrival',
    paymentStatus: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    items: [
      { name: 'Chicken Peri-Peri', size: 'Large (14")', quantity: 1, price: 799, crust: 'Cheese Burst' },
    ],
  },
];

class RealtimeDatabaseManager {
  constructor() {
    this.data = {
      inventory: [...initialInventory],
      orders: [...initialOrders],
      users: [],
      admins: [
        {
          id: 'admin_root_01',
          username: 'admin',
          email: 'admin@fireandslice.com',
          role: 'superadmin'
        }
      ]
    };

    // Active SSE client connections
    this.kitchenSubscribers = new Set();
    this.orderSubscribers = new Map(); // orderId -> Set of response streams

    this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.inventory && Array.isArray(parsed.inventory)) {
          this.data.inventory = parsed.inventory;
        }
        if (parsed.orders && Array.isArray(parsed.orders)) {
          this.data.orders = parsed.orders;
        }
        if (parsed.users && Array.isArray(parsed.users)) {
          this.data.users = parsed.users;
        }
        console.log(`📦 Realtime Database loaded (${this.data.orders.length} orders, ${this.data.inventory.length} stock items)`);
      } else {
        this.saveToDisk();
      }
    } catch (err) {
      console.warn('Could not read existing db.json, using defaults:', err.message);
    }
  }

  saveToDisk() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving db to disk:', err.message);
    }
  }

  // --- Realtime SSE Pub/Sub Methods ---
  registerKitchenSubscriber(res) {
    this.kitchenSubscribers.add(res);
    res.on('close', () => {
      this.kitchenSubscribers.delete(res);
    });
  }

  registerOrderSubscriber(orderId, res) {
    if (!this.orderSubscribers.has(orderId)) {
      this.orderSubscribers.set(orderId, new Set());
    }
    const set = this.orderSubscribers.get(orderId);
    set.add(res);

    res.on('close', () => {
      set.delete(res);
      if (set.size === 0) {
        this.orderSubscribers.delete(orderId);
      }
    });
  }

  broadcastToKitchen(eventData) {
    const payload = `data: ${JSON.stringify(eventData)}\n\n`;
    for (const res of this.kitchenSubscribers) {
      try {
        res.write(payload);
      } catch (e) {
        this.kitchenSubscribers.delete(res);
      }
    }
  }

  broadcastToOrder(orderId, orderData) {
    const set = this.orderSubscribers.get(orderId);
    if (!set) return;
    const payload = `data: ${JSON.stringify(orderData)}\n\n`;
    for (const res of set) {
      try {
        res.write(payload);
      } catch (e) {
        set.delete(res);
      }
    }
  }

  // --- Orders API ---
  getAllOrders() {
    return [...this.data.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getOrderById(id) {
    return this.data.orders.find(o => o._id === id || o.orderNumber === id || o.orderNumber === `#${id}`);
  }

  getUserOrders(userId) {
    return this.data.orders.filter(o => o.userId === userId);
  }

  createOrder(orderInput, user = null) {
    const id = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `FS-${randomNum}`;

    const newOrder = {
      _id: id,
      orderNumber,
      userId: user?.id || user?._id || 'guest_patron',
      customerName: user?.name || orderInput.customerName || 'Gourmet Patron',
      phone: orderInput.phone || '+91 98000 12345',
      deliveryAddress: orderInput.deliveryAddress || 'Downtown Flagship',
      paymentMethod: orderInput.paymentMethod || 'Online Payment',
      velocity: orderInput.velocity || 'standard',
      status: 'Order Received',
      totalPrice: Number(orderInput.totalAmount || orderInput.totalPrice || 0),
      totalAmount: Number(orderInput.totalAmount || orderInput.totalPrice || 0),
      paymentStatus: 'completed',
      items: orderInput.items || [],
      pizza: orderInput.pizza || null,
      instructions: orderInput.instructions || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.orders.unshift(newOrder);
    this.saveToDisk();

    // Auto deduct inventory based on items
    this.deductIngredientsForOrder(newOrder);

    // Push real-time event to Kitchen KDS
    this.broadcastToKitchen({
      type: 'NEW_ORDER',
      order: newOrder
    });

    console.log(`🔥 [REALTIME DB] Order Created & Broadcast: #${newOrder.orderNumber} (₹${newOrder.totalAmount})`);
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.data.orders.find(o => o._id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    this.saveToDisk();

    // Broadcast update to Kitchen KDS
    this.broadcastToKitchen({
      type: 'STATUS_UPDATE',
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: newStatus,
      order
    });

    // Broadcast live update to Patron's Order Tracking screen
    this.broadcastToOrder(order._id, order);
    this.broadcastToOrder(order.orderNumber, order);

    console.log(`📡 [REALTIME DB] Status Updated: #${order.orderNumber} -> "${newStatus}"`);
    return order;
  }

  // --- Inventory API ---
  getAllInventory() {
    return [...this.data.inventory];
  }

  getInventoryByCategory(category) {
    return this.data.inventory.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }

  updateInventoryStock(id, newStock) {
    const item = this.data.inventory.find(i => i._id === id || i.name === id);
    if (!item) return null;

    item.stock = Math.max(0, Number(newStock));
    item.lastRestocked = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    this.saveToDisk();

    this.broadcastToKitchen({
      type: 'INVENTORY_UPDATE',
      itemId: item._id,
      name: item.name,
      stock: item.stock
    });

    return item;
  }

  deductIngredientsForOrder(order) {
    // If customized builder pizza
    if (order.pizza) {
      const p = order.pizza;
      if (p.base) this.decrementItem(p.base, 1);
      if (p.sauce) this.decrementItem(p.sauce, 1);
      if (p.cheese) this.decrementItem(p.cheese, 1);
      if (Array.isArray(p.vegetables)) {
        p.vegetables.forEach(v => this.decrementItem(v, 1));
      }
    }

    // If storefront menu items
    if (Array.isArray(order.items)) {
      order.items.forEach(item => {
        const qty = item.quantity || 1;
        if (item.crust) this.decrementItem(item.crust, qty);
        // Deduct base mozzarella & marinara for pizzas
        this.decrementItem('Fior di Latte Mozzarella', qty);
        this.decrementItem('San Marzano DOP', qty);
      });
    }
  }

  decrementItem(nameOrKey, qty = 1) {
    const item = this.data.inventory.find(
      i => i.name.toLowerCase().includes(nameOrKey.toLowerCase()) ||
           nameOrKey.toLowerCase().includes(i.name.toLowerCase())
    );
    if (item) {
      item.stock = Math.max(0, item.stock - qty);
      this.saveToDisk();
      this.broadcastToKitchen({
        type: 'INVENTORY_UPDATE',
        itemId: item._id,
        name: item.name,
        stock: item.stock
      });
    }
  }
}

export const realtimeDb = new RealtimeDatabaseManager();
