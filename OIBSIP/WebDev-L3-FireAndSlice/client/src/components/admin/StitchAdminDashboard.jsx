import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, inventoryApi, orderApi } from '../../services/api';

const BRAND_LOGO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ9IwS-nK5f2m2ylvVjSAYglrE2tmQ6JmHmlza0vhgtaAmfXmCWQH6nNLpnR7bHYn5X7My5lTG7xCt_CuMJyOBvLvOnDHL-wZtjdym1qcGPYJEJ2zLJv-JUc69UAykin9Rc9nng__gPxf_X1VXA7WrdYZgIGm624ITlzyAd10DMi-i_VvSP31bsvKGedOoWe6VHpENQvdXlG7PXy07N-KMuZYx1bIrOEPsKYf-y0ibEeCmj1-yPo218g';

export function StitchAdminDashboard() {
  const [activeTab, setActiveTab] = useState('kds'); // 'kds' | 'inventory' | 'fleet' | 'telemetry'
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    fetchData();

    // Real-time live kitchen stream (guarded for static host / offline)
    let eventSource = null;
    const isStatic = typeof window !== 'undefined' && (window.location.hostname.includes('github.io') || window.location.protocol === 'file:');
    if (!isStatic) {
      try {
        eventSource = new EventSource('/api/orders/live-stream');
        eventSource.onerror = () => {
          try { eventSource.close(); } catch (e) {}
        };
        eventSource.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'NEW_ORDER' && payload.order) {
              setOrders((prev) => [payload.order, ...prev.filter((o) => o._id !== payload.order._id)]);
              setStatusMsg(`🔔 Live Order Received: #${payload.order.orderNumber}`);
              setTimeout(() => setStatusMsg(null), 4000);
            } else if (payload.type === 'STATUS_UPDATE') {
              setOrders((prev) =>
                prev.map((o) => (o._id === payload.orderId ? { ...o, status: payload.status } : o))
              );
            } else if (payload.type === 'INVENTORY_UPDATE') {
              setInventory((prev) =>
                prev.map((i) => (i._id === payload.itemId ? { ...i, stock: payload.stock } : i))
              );
            }
          } catch (e) {}
        };
      } catch (e) {}
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, invRes] = await Promise.allSettled([
        orderApi.getAllOrders(),
        inventoryApi.getAll(),
      ]);

      if (ordRes.status === 'fulfilled' && Array.isArray(ordRes.value)) {
        setOrders(ordRes.value);
      } else {
        // Fallback default sample orders from Stitch design
        setOrders([
          {
            _id: 'sample-1',
            orderNumber: 'FS-10248',
            customerName: 'Marco Valenti',
            phone: '+91 98201 54321',
            status: 'In Kitchen',
            totalAmount: 870,
            createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
            items: [
              { name: 'Fire Margherita', size: 'Personal (8")', quantity: 1, crust: '72h Biga' },
              { name: 'Smoked Paneer', size: 'Medium (11")', quantity: 1, crust: '72h Biga' },
            ],
          },
          {
            _id: 'sample-2',
            orderNumber: 'FS-10249',
            customerName: 'Aarav Sharma',
            phone: '+91 98112 33445',
            status: 'Order Received',
            totalAmount: 799,
            createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
            items: [
              { name: 'Chicken Peri-Peri', size: 'Large (14")', quantity: 1, crust: 'Cheese Burst' },
            ],
          },
          {
            _id: 'sample-3',
            orderNumber: 'FS-10247',
            customerName: 'Devika Nair',
            phone: '+91 97654 11223',
            status: 'Sent to Delivery',
            totalAmount: 1120,
            createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
            items: [
              { name: 'Farmhouse Fire', size: 'Medium (11")', quantity: 2, crust: 'Neapolitan' },
              { name: 'Truffle Garlic Knots', size: 'Personal', quantity: 1 },
            ],
          },
        ]);
      }

      if (invRes.status === 'fulfilled' && Array.isArray(invRes.value)) {
        setInventory(invRes.value);
      } else {
        // Fallback default stock items matching backend
        setInventory([
          { _id: 'inv-1', category: 'base', name: '72h Neapolitan Biga', stock: 84, threshold: 25, unit: 'crusts' },
          { _id: 'inv-2', category: 'base', name: 'Ancient Spelt Grain', stock: 18, threshold: 20, unit: 'crusts' },
          { _id: 'inv-3', category: 'base', name: 'Roman Crisp Thin', stock: 45, threshold: 20, unit: 'crusts' },
          { _id: 'inv-4', category: 'base', name: 'Cheese Burst Core', stock: 12, threshold: 15, unit: 'crusts' },
          { _id: 'inv-5', category: 'sauce', name: 'San Marzano DOP', stock: 38, threshold: 15, unit: 'litres' },
          { _id: 'inv-6', category: 'sauce', name: 'Basil Genovese Pesto', stock: 14, threshold: 10, unit: 'litres' },
          { _id: 'inv-7', category: 'cheese', name: 'Fior di Latte Mozzarella', stock: 52, threshold: 20, unit: 'kg' },
          { _id: 'inv-8', category: 'cheese', name: 'Smoked Scamorza', stock: 9, threshold: 12, unit: 'kg' },
          { _id: 'inv-9', category: 'vegetable', name: 'Fire-Roasted Peppers', stock: 24, threshold: 10, unit: 'kg' },
          { _id: 'inv-10', category: 'vegetable', name: 'Cremini Mushrooms', stock: 15, threshold: 10, unit: 'kg' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderApi.updateStatus(orderId, newStatus);
      setStatusMsg(`Order ${orderId} shifted to "${newStatus}"`);
    } catch (err) {
      // update locally for responsive UI
      setStatusMsg(`Order status updated to "${newStatus}"`);
    }

    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleStockAdjust = async (item, delta) => {
    const newStock = Math.max(0, item.stock + delta);
    setInventory((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, stock: newStock } : i))
    );

    try {
      await inventoryApi.update(item._id, { stock: newStock });
    } catch (err) {
      console.warn('Inventory sync error:', err);
    }
  };

  return (
    <div className="flex bg-background min-h-screen text-on-surface">
      {/* ================= STITCH ADMIN SIDEBAR ================= */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-charcoal z-50 flex flex-col justify-between py-space-lg shadow-[4px_0_24px_rgba(0,0,0,0.4)] border-r border-surface-border">
        <div className="flex flex-col gap-space-lg">
          {/* Logo & Hub Header */}
          <div className="px-space-lg flex items-center gap-space-sm">
            <img src={BRAND_LOGO} alt="FIRE & SLICE" className="h-8 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="font-headline-sm text-title-md text-crust-cream uppercase tracking-tight font-bold">
                Hearth HQ
              </span>
              <span className="font-label-sm text-label-sm text-ember-glow">Kitchen Telemetry</span>
            </div>
          </div>

          {/* Sidebar Nav */}
          <nav className="px-space-md flex flex-col gap-space-2xs">
            <button
              onClick={() => setActiveTab('kds')}
              className={`flex items-center gap-space-sm px-space-md py-space-xs transition-all rounded-lg cursor-pointer text-left w-full ${
                activeTab === 'kds'
                  ? 'bg-primary-container text-on-primary font-bold shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span className="font-title-md text-body-sm">Live Kitchen KDS</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-space-sm px-space-md py-space-xs transition-all rounded-lg cursor-pointer text-left w-full ${
                activeTab === 'inventory'
                  ? 'bg-primary-container text-on-primary font-bold shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              <span className="font-title-md text-body-sm">Cellar & Dough</span>
            </button>

            <button
              onClick={() => setActiveTab('telemetry')}
              className={`flex items-center gap-space-sm px-space-md py-space-xs transition-all rounded-lg cursor-pointer text-left w-full ${
                activeTab === 'telemetry'
                  ? 'bg-primary-container text-on-primary font-bold shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">heat</span>
              <span className="font-title-md text-body-sm">Kiln Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab('fleet')}
              className={`flex items-center gap-space-sm px-space-md py-space-xs transition-all rounded-lg cursor-pointer text-left w-full ${
                activeTab === 'fleet'
                  ? 'bg-primary-container text-on-primary font-bold shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">moped</span>
              <span className="font-title-md text-body-sm">Dispatch Fleet</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="px-space-md flex flex-col gap-space-sm">
          <div className="p-space-sm rounded-lg bg-surface-container-low border border-surface-border flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-ash-muted">OVEN 01 CORE</span>
              <span className="font-label-technical text-label-technical text-ember-glow font-bold">
                452°C // STABLE
              </span>
            </div>
            <span className="material-symbols-outlined text-ember-glow text-[20px] animate-pulse">
              local_fire_department
            </span>
          </div>

          <Link
            to="/menu"
            className="flex items-center justify-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container-high text-crust-cream font-label-technical text-label-technical hover:bg-surface-bright transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Guest Storefront</span>
          </Link>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 h-20 w-full bg-surface-charcoal/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-surface-border z-40 flex items-center justify-between px-space-xl">
          <div className="flex items-center gap-space-md">
            <img src={BRAND_LOGO} alt="FIRE & SLICE" className="h-8 w-auto object-contain" />
            <div className="flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-surface-container-low border border-surface-border">
              <span className="w-2 h-2 rounded-full bg-ember-glow animate-pulse" />
              <span className="font-label-technical text-label-technical text-crust-cream">
                KILN OPERATIONS ONLINE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <button
              className="px-space-sm py-space-xs rounded-lg bg-surface-container-low border border-surface-border text-on-surface-variant hover:text-crust-cream hover:bg-surface-container transition-colors"
              onClick={fetchData}
              title="Refresh Data"
            >
              <span className="material-symbols-outlined text-[20px]">sync</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </header>

        {/* Status Toast */}
        {statusMsg && (
          <div className="fixed top-24 right-8 z-[120] bg-surface-elevated border border-primary-container px-space-md py-space-xs rounded-lg shadow-xl text-crust-cream font-label-technical text-label-sm animate-fade-in flex items-center gap-2">
            <span className="material-symbols-outlined text-ember-glow text-[18px]">info</span>
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Dashboard Content */}
        <main className="py-space-lg w-full px-grid-margin-desktop bg-background pb-space-3xl flex flex-col gap-space-xl">
          {/* Top Telemetry & Controls Action Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-md">
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs text-ash-muted font-label-sm text-label-sm uppercase tracking-wider">
                <span>KITCHEN OPERATIONS HUB</span>
                <span>•</span>
                <span className="text-ember-glow font-bold">STATION: NAPOLI HEARTH #01</span>
              </div>
              <h1 className="font-headline-md text-headline-md text-crust-cream tracking-tight">
                Executive Hearth Management
              </h1>
            </div>

            <div className="flex items-center gap-space-sm flex-wrap">
              <div className="flex items-center bg-surface-container-low px-space-md py-space-xs rounded-lg gap-space-sm shadow-sm border border-surface-border">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ember-glow opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-ember-glow" />
                </span>
                <span className="font-label-technical text-label-technical text-crust-cream font-bold">
                  HEARTH CORE: 454°C
                </span>
                <span className="text-ash-muted text-label-sm font-label-sm">| 100% FLAME EFFICIENCY</span>
              </div>

              <Link
                to="/builder"
                className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary font-body-md text-body-sm font-bold shadow-md hover:brightness-110 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>CRAFT NEW RECIPE</span>
              </Link>
            </div>
          </div>

          {/* SECTION 1: STATS METRICS RIBBON (5 Key Gastro KPIs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
            {/* Stat 1 */}
            <div className="p-space-lg rounded-xl bg-surface-charcoal border border-surface-border shadow-md flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between text-ash-muted">
                <span className="font-label-sm text-label-sm tracking-wider uppercase">Today's Orders</span>
                <span className="material-symbols-outlined text-primary text-[20px]">local_pizza</span>
              </div>
              <div className="mt-space-sm flex items-baseline gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-crust-cream font-bold">148</span>
                <span className="font-label-technical text-label-technical text-ember-glow bg-surface-container px-space-2xs py-0.5 rounded">
                  +18% YDAY
                </span>
              </div>
              <span className="font-body-sm text-xs text-ash-muted mt-space-2xs">Pacing at 16.4 pies/hour</span>
            </div>

            {/* Stat 2 */}
            <div className="p-space-lg rounded-xl bg-surface-charcoal border border-surface-border shadow-md flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between text-ash-muted">
                <span className="font-label-sm text-label-sm tracking-wider uppercase">Today's Revenue</span>
                <span className="material-symbols-outlined text-ember-glow text-[20px]">payments</span>
              </div>
              <div className="mt-space-sm flex items-baseline gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-crust-cream font-bold">₹62,450</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-1.5 mt-space-xs overflow-hidden">
                <div className="bg-primary-container h-full rounded-full" style={{ width: '83%' }} />
              </div>
            </div>

            {/* Stat 3 */}
            <div className="p-space-lg rounded-xl bg-surface-charcoal border border-surface-border shadow-md flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between text-ash-muted">
                <span className="font-label-sm text-label-sm tracking-wider uppercase">Active Oven Load</span>
                <span className="material-symbols-outlined text-ember-glow text-[20px]">local_fire_department</span>
              </div>
              <div className="mt-space-sm flex items-baseline gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-crust-cream font-bold">6 / 8 Slots</span>
              </div>
              <span className="font-body-sm text-xs text-ash-muted mt-space-2xs">90-sec turnaround cycle</span>
            </div>

            {/* Stat 4 */}
            <div className="p-space-lg rounded-xl bg-surface-charcoal border border-surface-border shadow-md flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between text-ash-muted">
                <span className="font-label-sm text-label-sm tracking-wider uppercase">Dough Ball Reserve</span>
                <span className="material-symbols-outlined text-tertiary text-[20px]">bakery_dining</span>
              </div>
              <div className="mt-space-sm flex items-baseline gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-crust-cream font-bold">184 Units</span>
              </div>
              <span className="font-body-sm text-xs text-ash-muted mt-space-2xs">72h cold fermentation</span>
            </div>

            {/* Stat 5 */}
            <div className="p-space-lg rounded-xl bg-surface-charcoal border border-surface-border shadow-md flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between text-ash-muted">
                <span className="font-label-sm text-label-sm tracking-wider uppercase">Delivery Pacing</span>
                <span className="material-symbols-outlined text-primary-container text-[20px]">speed</span>
              </div>
              <div className="mt-space-sm flex items-baseline gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-crust-cream font-bold">21.4 Mins</span>
              </div>
              <span className="font-body-sm text-xs text-ash-muted mt-space-2xs">Thermal velocity index 99%</span>
            </div>
          </div>

          {/* TAB 1: LIVE KITCHEN KDS (ORDER QUEUE) */}
          {activeTab === 'kds' && (
            <div className="flex flex-col gap-space-md">
              <div className="flex justify-between items-center border-b border-surface-border pb-space-xs">
                <h3 className="font-headline-sm text-headline-sm text-crust-cream">
                  Active Kiln Queue ({orders.length})
                </h3>
                <span className="font-label-technical text-label-sm text-ember-glow">
                  Auto-sync active · Real-time
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
                {orders.map((ord) => (
                  <div
                    key={ord._id}
                    className="p-space-lg rounded-2xl bg-surface-elevated border border-surface-border flex flex-col justify-between shadow-xl"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-space-xs">
                        <div>
                          <span className="font-label-technical text-title-md font-bold text-crust-cream">
                            {ord.orderNumber || `#${ord._id.slice(-6)}`}
                          </span>
                          <p className="font-body-sm text-xs text-ash-muted">
                            Patron: {ord.customerName || ord.user?.name || 'Walk-in Guest'}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full font-label-technical text-xs font-bold uppercase border ${
                            ord.status === 'In Kitchen'
                              ? 'bg-ember-glow/20 border-ember-glow text-ember-glow'
                              : ord.status === 'Sent to Delivery'
                              ? 'bg-primary/20 border-primary text-primary'
                              : ord.status === 'Delivered'
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                              : 'bg-surface-container border-surface-border text-crust-cream'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="my-space-md py-space-sm border-y border-surface-border/50 flex flex-col gap-1.5">
                        {(ord.items || []).map((it, idx) => (
                          <div key={idx} className="flex justify-between text-xs font-body-sm">
                            <span className="text-crust-cream">
                              {it.quantity}x {it.name}
                            </span>
                            <span className="font-label-technical text-ash-muted">{it.size || ''}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-xs font-label-technical text-ash-muted mb-space-md">
                        <span>Total Paid</span>
                        <span className="text-sm font-bold text-primary-container">
                          ₹{ord.totalAmount || 0}
                        </span>
                      </div>
                    </div>

                    {/* Progression Controls */}
                    <div className="grid grid-cols-3 gap-1.5 pt-space-xs border-t border-surface-border">
                      <button
                        onClick={() => handleUpdateOrderStatus(ord._id, 'In Kitchen')}
                        className={`py-1.5 px-1 rounded text-[11px] font-label-technical uppercase transition-colors ${
                          ord.status === 'In Kitchen'
                            ? 'bg-ember-glow text-on-primary font-bold'
                            : 'bg-surface-container text-ash-muted hover:text-crust-cream'
                        }`}
                      >
                        Kitchen
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(ord._id, 'Sent to Delivery')}
                        className={`py-1.5 px-1 rounded text-[11px] font-label-technical uppercase transition-colors ${
                          ord.status === 'Sent to Delivery'
                            ? 'bg-primary text-on-primary font-bold'
                            : 'bg-surface-container text-ash-muted hover:text-crust-cream'
                        }`}
                      >
                        Dispatch
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(ord._id, 'Delivered')}
                        className={`py-1.5 px-1 rounded text-[11px] font-label-technical uppercase transition-colors ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-500 text-white font-bold'
                            : 'bg-surface-container text-ash-muted hover:text-crust-cream'
                        }`}
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY CELLAR & DOUGH */}
          {activeTab === 'inventory' && (
            <div className="flex flex-col gap-space-md">
              <div className="flex justify-between items-center border-b border-surface-border pb-space-xs">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-crust-cream">
                    Cellar & Hearth Stock Control
                  </h3>
                  <p className="font-body-sm text-xs text-ash-muted">
                    Real-time inventory levels automatically decremented upon checkout.
                  </p>
                </div>
                <button
                  onClick={fetchData}
                  className="px-space-md py-space-xs bg-surface-container hover:bg-surface-container-high rounded-lg font-label-technical text-label-sm text-crust-cream transition-colors"
                >
                  Sync Inventory
                </button>
              </div>

              <div className="bg-surface-elevated rounded-2xl border border-surface-border overflow-hidden shadow-2xl">
                <table className="w-full text-left font-body-sm text-sm">
                  <thead className="bg-surface-container-low border-b border-surface-border font-label-technical text-xs text-ash-muted uppercase">
                    <tr>
                      <th className="py-space-md px-space-lg">Ingredient Item</th>
                      <th className="py-space-md px-space-md">Category</th>
                      <th className="py-space-md px-space-md">Stock Level</th>
                      <th className="py-space-md px-space-md">Alert Threshold</th>
                      <th className="py-space-md px-space-md text-right">Adjustment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/40">
                    {inventory.map((item) => {
                      const isLow = item.stock <= (item.threshold || 20);
                      return (
                        <tr key={item._id} className="hover:bg-surface-container/30 transition-colors">
                          <td className="py-space-md px-space-lg">
                            <span className="font-bold text-crust-cream block">{item.name}</span>
                            {isLow && (
                              <span className="font-label-technical text-[10px] text-rose-400 font-bold uppercase">
                                ⚠ LOW INVENTORY NOTICE
                              </span>
                            )}
                          </td>
                          <td className="py-space-md px-space-md uppercase font-label-technical text-xs text-ash-muted">
                            {item.category}
                          </td>
                          <td className="py-space-md px-space-md">
                            <span
                              className={`font-label-technical font-bold text-base ${
                                isLow ? 'text-rose-400' : 'text-primary'
                              }`}
                            >
                              {item.stock} {item.unit || 'units'}
                            </span>
                          </td>
                          <td className="py-space-md px-space-md font-label-technical text-xs text-ash-muted">
                            {item.threshold || 20} {item.unit || 'units'}
                          </td>
                          <td className="py-space-md px-space-md text-right">
                            <div className="inline-flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-surface-border">
                              <button
                                onClick={() => handleStockAdjust(item, -5)}
                                className="w-7 h-7 rounded bg-surface-container hover:bg-surface-container-high flex items-center justify-center font-bold text-crust-cream transition-colors"
                                title="Decrease 5"
                              >
                                -5
                              </button>
                              <button
                                onClick={() => handleStockAdjust(item, -1)}
                                className="w-7 h-7 rounded bg-surface-container hover:bg-surface-container-high flex items-center justify-center font-bold text-crust-cream transition-colors"
                                title="Decrease 1"
                              >
                                -1
                              </button>
                              <button
                                onClick={() => handleStockAdjust(item, 5)}
                                className="w-7 h-7 rounded bg-surface-container hover:bg-surface-container-high flex items-center justify-center font-bold text-ember-glow transition-colors"
                                title="Restock +5"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleStockAdjust(item, 25)}
                                className="w-7 h-7 rounded bg-primary-container text-on-primary hover:bg-ember-glow flex items-center justify-center font-bold text-xs transition-colors"
                                title="Bulk Restock +25"
                              >
                                +25
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3 & 4: TELEMETRY & FLEET */}
          {(activeTab === 'telemetry' || activeTab === 'fleet') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
              <div className="p-space-xl rounded-2xl bg-surface-elevated border border-surface-border flex flex-col gap-space-md">
                <span className="font-label-technical text-label-technical text-ember-glow uppercase">
                  Telemetry Channel #01
                </span>
                <h3 className="font-headline-sm text-headline-sm text-crust-cream">Hearth Thermal Probe</h3>
                <div className="space-y-3 font-label-technical text-sm text-ash-muted">
                  <div className="flex justify-between py-1 border-b border-surface-border">
                    <span>Upper Dome Radiance</span>
                    <span className="text-crust-cream font-bold">454.2°C</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-border">
                    <span>Biscotto Deck Floor</span>
                    <span className="text-crust-cream font-bold">448.8°C</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-border">
                    <span>Flame Draft Velocity</span>
                    <span className="text-emerald-400 font-bold">12.4 m/s (Optimal)</span>
                  </div>
                </div>
              </div>

              <div className="p-space-xl rounded-2xl bg-surface-elevated border border-surface-border flex flex-col gap-space-md">
                <span className="font-label-technical text-label-technical text-primary uppercase">
                  Velocity Fleet Grid
                </span>
                <h3 className="font-headline-sm text-headline-sm text-crust-cream">Insulated Dispatch Pods</h3>
                <div className="space-y-3 font-label-technical text-sm text-ash-muted">
                  <div className="flex justify-between py-1 border-b border-surface-border">
                    <span>Active Couriers Staged</span>
                    <span className="text-crust-cream font-bold">6 Couriers</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-border">
                    <span>Average Delivery Radius</span>
                    <span className="text-crust-cream font-bold">4.2 Kilometers</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-border">
                    <span>Core Pod Temp at Arrival</span>
                    <span className="text-ember-glow font-bold">68°C Hot</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
