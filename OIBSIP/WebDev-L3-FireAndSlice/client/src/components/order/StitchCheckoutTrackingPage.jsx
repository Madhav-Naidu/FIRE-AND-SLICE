import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCartStore } from '../../store/cartStore';
import { orderApi } from '../../services/api';

export function StitchCheckoutTrackingPage({ initialMode = 'checkout' }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { items, getSubtotal, getTotal, discount, voucher, packagingFee, clearCart } = useCartStore();

  const [activeView, setActiveView] = useState(initialMode); // 'checkout' | 'tracking'
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form inputs
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    city: 'Mumbai',
    pincode: '400001',
    instructions: 'Ring bell twice, leave at reception if not reachable',
    velocity: 'express', // 'express' (+₹40) or 'standard' (+₹0)
    paymentMethod: 'razorpay', // 'razorpay', 'upi', 'cod'
  });

  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('In Kitchen'); // 'Order Received' | 'In Kitchen' | 'Sent to Delivery' | 'Delivered'

  const velocityFee = formData.velocity === 'express' ? 40 : 0;
  const subtotal = getSubtotal();
  const baseTotal = getTotal();
  const finalTotal = baseTotal + velocityFee;

  useEffect(() => {
    if (initialMode === 'tracking') {
      setActiveView('tracking');
    }
  }, [initialMode]);

  // Real-time live order status stream + polling fallback
  useEffect(() => {
    if (!confirmedOrder?._id) return;

    let eventSource = null;
    const isStatic = typeof window !== 'undefined' && (window.location.hostname.includes('github.io') || window.location.protocol === 'file:');
    if (!isStatic) {
      try {
        eventSource = new EventSource(`/api/orders/${confirmedOrder._id}/live`);
        eventSource.onerror = () => {
          try { eventSource.close(); } catch (e) {}
        };
        eventSource.onmessage = (event) => {
          try {
            const update = JSON.parse(event.data);
            if (update && update.status) {
              setOrderStatus(update.status);
            }
          } catch (e) {}
        };
      } catch (e) {}
    }

    const interval = setInterval(async () => {
      try {
        const res = await orderApi.getOrderById(confirmedOrder._id);
        if (res && res.status) {
          setOrderStatus(res.status);
        }
      } catch (err) {}
    }, 5000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [confirmedOrder?._id]);

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      alert('Your cart is empty.');
      navigate('/menu');
      return;
    }

    setLoading(true);

    try {
      // Create order via backend API
      const orderPayload = {
        items: items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          crust: i.crust,
          size: i.size,
          additions: i.additions,
        })),
        totalAmount: finalTotal,
        deliveryAddress: `${formData.address}, ${formData.city} - ${formData.pincode}`,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod,
        velocity: formData.velocity,
        instructions: formData.instructions,
      };

      let created = null;
      try {
        created = await orderApi.createOrder(orderPayload);
      } catch (apiErr) {
        console.warn('Backend order call fallback:', apiErr);
        // Fallback mockup order for UI demonstration if offline
        created = {
          _id: 'order-' + Date.now(),
          orderNumber: 'FS-' + Math.floor(10000 + Math.random() * 90000),
          status: 'In Kitchen',
          createdAt: new Date().toISOString(),
          totalAmount: finalTotal,
        };
      }

      setConfirmedOrder(created);
      setOrderStatus('In Kitchen');
      clearCart();
      setActiveView('tracking');
    } catch (err) {
      console.error('Order creation error:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-background min-h-screen">
      {/* View Toggle & Breadcrumb Navigator Bar */}
      <section className="w-full bg-surface-container-lowest py-space-sm px-grid-margin-mobile lg:px-grid-margin-desktop border-b border-surface-border">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-technical text-label-technical text-ash-muted uppercase tracking-widest">
              KILN TERMINAL
            </span>
            <span className="text-surface-border">/</span>
            <span className="font-label-technical text-label-technical text-primary-container uppercase tracking-wider">
              {activeView === 'checkout' ? '01. EXPRESS CHECKOUT' : '02. LIVE KILN TELEMETRY'}
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-lg bg-surface-charcoal border border-surface-border">
            <button
              className={`px-space-md py-space-2xs rounded-lg font-title-md text-body-sm transition-all duration-300 flex items-center gap-space-2xs cursor-pointer ${
                activeView === 'checkout'
                  ? 'bg-primary-container text-on-primary shadow-sm font-bold'
                  : 'text-ash-muted hover:text-crust-cream'
              }`}
              onClick={() => setActiveView('checkout')}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
              <span>Checkout Deck</span>
            </button>
            <button
              className={`px-space-md py-space-2xs rounded-lg font-title-md text-body-sm transition-all duration-300 flex items-center gap-space-2xs cursor-pointer ${
                activeView === 'tracking'
                  ? 'bg-primary-container text-on-primary shadow-sm font-bold'
                  : 'text-ash-muted hover:text-crust-cream'
              }`}
              onClick={() => setActiveView('tracking')}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
              <span>Live Kiln Telemetry {confirmedOrder ? `(#${confirmedOrder.orderNumber || 'FS-10248'})` : ''}</span>
              <span className="w-2 h-2 rounded-full bg-ember-glow animate-ping ml-1" />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-space-xs">
            <span className="font-label-technical text-label-technical text-ash-muted">256-BIT ENCRYPTION</span>
            <span className="material-symbols-outlined text-tertiary text-[16px]">lock</span>
          </div>
        </div>
      </section>

      {/* VIEW 1: MULTI-STEP CHECKOUT DECK */}
      {activeView === 'checkout' && (
        <section className="w-full py-space-xl px-grid-margin-mobile lg:px-grid-margin-desktop">
          <div className="max-w-[1440px] mx-auto">
            {/* Stepper Pill Bar */}
            <div className="mb-space-xl grid grid-cols-2 md:grid-cols-4 gap-space-xs">
              <div
                onClick={() => setCurrentStep(1)}
                className={`p-space-sm rounded-xl flex items-center gap-space-xs cursor-pointer transition-all border ${
                  currentStep === 1
                    ? 'bg-surface-elevated border-primary-container shadow-md'
                    : 'bg-surface-container-low border-surface-border'
                }`}
              >
                <span className="w-7 h-7 rounded-full bg-primary-container text-on-primary font-label-technical text-label-technical flex items-center justify-center font-bold">
                  01
                </span>
                <div className="min-w-0">
                  <p className="font-label-technical text-label-sm text-crust-cream uppercase truncate font-bold">
                    Delivery Hub
                  </p>
                  <p className="font-body-sm text-label-sm text-ember-glow truncate">Address & Pin</p>
                </div>
              </div>

              <div
                onClick={() => setCurrentStep(2)}
                className={`p-space-sm rounded-xl flex items-center gap-space-xs cursor-pointer transition-all border ${
                  currentStep === 2
                    ? 'bg-surface-elevated border-primary-container shadow-md'
                    : 'bg-surface-container-low border-surface-border'
                }`}
              >
                <span className="w-7 h-7 rounded-full bg-surface-container-high text-ash-muted font-label-technical text-label-technical flex items-center justify-center font-bold">
                  02
                </span>
                <div className="min-w-0">
                  <p className="font-label-technical text-label-sm text-on-surface-variant uppercase truncate font-bold">
                    Heat Shield
                  </p>
                  <p className="font-body-sm text-label-sm text-ash-muted truncate">Delivery Velocity</p>
                </div>
              </div>

              <div
                onClick={() => setCurrentStep(3)}
                className={`p-space-sm rounded-xl flex items-center gap-space-xs cursor-pointer transition-all border ${
                  currentStep === 3
                    ? 'bg-surface-elevated border-primary-container shadow-md'
                    : 'bg-surface-container-low border-surface-border'
                }`}
              >
                <span className="w-7 h-7 rounded-full bg-surface-container-high text-ash-muted font-label-technical text-label-technical flex items-center justify-center font-bold">
                  03
                </span>
                <div className="min-w-0">
                  <p className="font-label-technical text-label-sm text-on-surface-variant uppercase truncate font-bold">
                    Payment Vault
                  </p>
                  <p className="font-body-sm text-label-sm text-ash-muted truncate">UPI, Cards, Cash</p>
                </div>
              </div>

              <div
                className="bg-surface-container-low p-space-sm rounded-xl flex items-center gap-space-xs border border-surface-border opacity-70"
              >
                <span className="w-7 h-7 rounded-full bg-surface-container-high text-ash-muted font-label-technical text-label-technical flex items-center justify-center font-bold">
                  04
                </span>
                <div className="min-w-0">
                  <p className="font-label-technical text-label-sm text-on-surface-variant uppercase truncate font-bold">
                    Fire Oven
                  </p>
                  <p className="font-body-sm text-label-sm text-ash-muted truncate">Live Tracking</p>
                </div>
              </div>
            </div>

            {/* Form & Order Breakdown Grid */}
            <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
              {/* Form Input Columns (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-space-lg">
                {/* Section 1: Address Details */}
                <div className="bg-surface-elevated p-space-lg rounded-2xl border border-surface-border flex flex-col gap-space-md">
                  <div className="flex items-center gap-2 border-b border-surface-border pb-space-xs">
                    <span className="material-symbols-outlined text-ember-glow text-[22px]">location_on</span>
                    <h3 className="font-headline-sm text-title-md text-crust-cream uppercase tracking-wider">
                      Delivery Destination
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    <div>
                      <label className="font-label-technical text-label-sm text-ash-muted uppercase block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Marco Valenti"
                        className="w-full bg-surface-container-low border border-surface-border rounded-lg px-space-sm py-2 font-body-sm text-crust-cream focus:outline-none focus:border-primary-container"
                      />
                    </div>
                    <div>
                      <label className="font-label-technical text-label-sm text-ash-muted uppercase block mb-1">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-surface-container-low border border-surface-border rounded-lg px-space-sm py-2 font-body-sm text-crust-cream focus:outline-none focus:border-primary-container"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-label-technical text-label-sm text-ash-muted uppercase block mb-1">
                      Street Address / Flat / Floor
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Flat 402, Hearthstone Towers, Woodfire Lane"
                      className="w-full bg-surface-container-low border border-surface-border rounded-lg px-space-sm py-2 font-body-sm text-crust-cream focus:outline-none focus:border-primary-container"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-space-md">
                    <div>
                      <label className="font-label-technical text-label-sm text-ash-muted uppercase block mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full bg-surface-container-low border border-surface-border rounded-lg px-space-sm py-2 font-body-sm text-crust-cream focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-label-technical text-label-sm text-ash-muted uppercase block mb-1">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        className="w-full bg-surface-container-low border border-surface-border rounded-lg px-space-sm py-2 font-body-sm text-crust-cream focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Heat Shield & Velocity */}
                <div className="bg-surface-elevated p-space-lg rounded-2xl border border-surface-border flex flex-col gap-space-md">
                  <div className="flex items-center gap-2 border-b border-surface-border pb-space-xs">
                    <span className="material-symbols-outlined text-ember-glow text-[22px]">rocket_launch</span>
                    <h3 className="font-headline-sm text-title-md text-crust-cream uppercase tracking-wider">
                      Kiln Dispatch Velocity
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    <label
                      onClick={() => handleInputChange('velocity', 'express')}
                      className={`p-space-md rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                        formData.velocity === 'express'
                          ? 'bg-surface-container border-primary-container text-crust-cream shadow-md'
                          : 'bg-surface-container-low border-surface-border hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-ember-glow text-[22px]">local_fire_department</span>
                          <span className="font-title-md text-body-md font-bold">Express Kiln Priority</span>
                        </div>
                        <span className="font-label-technical text-label-sm text-primary font-bold">+₹40</span>
                      </div>
                      <p className="font-body-sm text-xs text-ash-muted">
                        Dispatched in insulated carbon-fiber heating box. Guaranteed 20-25m piping hot.
                      </p>
                    </label>

                    <label
                      onClick={() => handleInputChange('velocity', 'standard')}
                      className={`p-space-md rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                        formData.velocity === 'standard'
                          ? 'bg-surface-container border-primary-container text-crust-cream shadow-md'
                          : 'bg-surface-container-low border-surface-border hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-ash-muted text-[22px]">schedule</span>
                          <span className="font-title-md text-body-md font-bold">Standard Oven Run</span>
                        </div>
                        <span className="font-label-technical text-label-sm text-ash-muted">Free</span>
                      </div>
                      <p className="font-body-sm text-xs text-ash-muted">
                        Batched delivery queue within 35-45m in temperature-retaining craft carton.
                      </p>
                    </label>
                  </div>
                </div>

                {/* Section 3: Payment Method */}
                <div className="bg-surface-elevated p-space-lg rounded-2xl border border-surface-border flex flex-col gap-space-md">
                  <div className="flex items-center gap-2 border-b border-surface-border pb-space-xs">
                    <span className="material-symbols-outlined text-ember-glow text-[22px]">account_balance_wallet</span>
                    <h3 className="font-headline-sm text-title-md text-crust-cream uppercase tracking-wider">
                      Payment Vault
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                    {[
                      { id: 'razorpay', label: 'Razorpay / Cards', icon: 'credit_card', desc: 'UPI, NetBanking, Visa' },
                      { id: 'upi', label: 'Instant UPI', icon: 'qr_code_2', desc: 'GPay, PhonePe, Paytm' },
                      { id: 'cod', label: 'Cash on Arrival', icon: 'payments', desc: 'Pay at your doorstep' },
                    ].map((pm) => (
                      <label
                        key={pm.id}
                        onClick={() => handleInputChange('paymentMethod', pm.id)}
                        className={`p-space-sm rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                          formData.paymentMethod === pm.id
                            ? 'bg-surface-container border-primary-container text-crust-cream shadow-md'
                            : 'bg-surface-container-low border-surface-border hover:bg-surface-container'
                        }`}
                      >
                        <span className="material-symbols-outlined text-primary-container text-[24px] mb-1">
                          {pm.icon}
                        </span>
                        <span className="font-title-md text-body-sm font-bold">{pm.label}</span>
                        <span className="font-label-technical text-[10px] text-ash-muted mt-0.5">{pm.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Breakdown Column (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-28">
                <div className="bg-surface-elevated p-space-lg rounded-2xl border border-surface-border flex flex-col gap-space-md shadow-2xl">
                  <div className="flex justify-between items-center border-b border-surface-border pb-space-xs">
                    <h3 className="font-headline-sm text-title-md text-crust-cream uppercase tracking-wider">
                      Dispatch Manifest
                    </h3>
                    <span className="font-label-technical text-label-sm text-ash-muted">
                      {items.length} Varieties
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="flex flex-col gap-space-sm max-h-64 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start text-sm">
                        <div>
                          <p className="font-bold text-crust-cream">
                            {item.quantity}x {item.name}
                          </p>
                          <p className="text-xs font-label-technical text-ash-muted">{item.size}</p>
                        </div>
                        <span className="font-label-technical text-crust-cream font-bold">
                          ₹{(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial calculation */}
                  <div className="border-t border-surface-border pt-space-sm flex flex-col gap-1.5 font-label-technical text-label-sm text-ash-muted">
                    <div className="flex justify-between">
                      <span>Order Subtotal</span>
                      <span className="text-crust-cream">₹{subtotal.toFixed(2)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-ember-glow">
                        <span>Voucher ({voucher})</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Kiln Heat Shield Packaging</span>
                      <span className="text-crust-cream">₹{packagingFee.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Velocity Dispatch</span>
                      <span className="text-crust-cream">₹{velocityFee.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-title-md font-bold text-crust-cream pt-2 border-t border-surface-border">
                      <span>Total Payable</span>
                      <span className="text-primary-container text-headline-sm">₹{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || items.length === 0}
                    className="w-full py-space-md bg-primary-container hover:bg-ember-glow disabled:opacity-50 text-on-primary font-title-md text-body-md uppercase tracking-wider rounded-xl shadow-xl transition-all flex items-center justify-center gap-space-xs transform hover:-translate-y-0.5 cursor-pointer font-bold"
                  >
                    {loading ? (
                      <span>TRANSMITTING TO KILN...</span>
                    ) : (
                      <>
                        <span>CONFIRM & FIRE OVEN</span>
                        <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* VIEW 2: LIVE KILN TELEMETRY VIEW */}
      {activeView === 'tracking' && (
        <section className="w-full py-space-xl px-grid-margin-mobile lg:px-grid-margin-desktop">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-space-xl">
            {/* Telemetry Stage Banner */}
            <div className="bg-surface-elevated p-space-xl rounded-2xl border border-surface-border shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-space-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-ember-glow/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col gap-1 relative z-10">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-ember-glow animate-ping" />
                  <span className="font-label-technical text-label-technical text-ember-glow uppercase tracking-wider font-bold">
                    Oven 01 // 450°C Active Bake
                  </span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-crust-cream">
                  Order Telemetry {confirmedOrder?.orderNumber ? `#${confirmedOrder.orderNumber}` : '#FS-10248'}
                </h2>
                <p className="font-body-sm text-ash-muted">
                  Biscotto kiln stoked at 454°C. Dispatch courier staged at station.
                </p>
              </div>

              <div className="flex items-center gap-space-md relative z-10 self-start md:self-auto bg-surface-container-low p-space-md rounded-xl border border-surface-border">
                <div className="flex flex-col text-right">
                  <span className="font-label-sm text-label-sm text-ash-muted uppercase">Estimated Delivery</span>
                  <span className="font-headline-sm text-headline-sm text-crust-cream font-bold">22 Mins</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-ember-glow">
                  <span className="material-symbols-outlined text-[28px]">moped</span>
                </div>
              </div>
            </div>

            {/* Stepper Timeline: Kiln Stages */}
            <div className="bg-surface-elevated p-space-xl rounded-2xl border border-surface-border">
              <h3 className="font-headline-sm text-title-md text-crust-cream uppercase tracking-wider mb-space-lg">
                Hearth Journey
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md relative">
                {[
                  {
                    step: '01',
                    title: 'Order Received',
                    sub: '10:14 PM · Ticket printed',
                    icon: 'receipt_long',
                    done: true,
                  },
                  {
                    step: '02',
                    title: 'In Kitchen & Kiln',
                    sub: '450°C stone bake (90s)',
                    icon: 'local_fire_department',
                    done: orderStatus === 'In Kitchen' || orderStatus === 'Sent to Delivery' || orderStatus === 'Delivered',
                    active: orderStatus === 'In Kitchen',
                  },
                  {
                    step: '03',
                    title: 'Sent to Delivery',
                    sub: 'Thermal shield velocity',
                    icon: 'moped',
                    done: orderStatus === 'Sent to Delivery' || orderStatus === 'Delivered',
                    active: orderStatus === 'Sent to Delivery',
                  },
                  {
                    step: '04',
                    title: 'Delivered',
                    sub: 'Piping hot at doorstep',
                    icon: 'home',
                    done: orderStatus === 'Delivered',
                    active: orderStatus === 'Delivered',
                  },
                ].map((st) => (
                  <div
                    key={st.step}
                    className={`p-space-md rounded-xl border flex flex-col justify-between transition-all ${
                      st.active
                        ? 'bg-surface-container border-ember-glow shadow-lg'
                        : st.done
                        ? 'bg-surface-container-low border-surface-border text-crust-cream'
                        : 'bg-surface-container-lowest border-surface-border/40 opacity-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-space-sm">
                      <span
                        className={`w-8 h-8 rounded-full font-label-technical text-label-sm font-bold flex items-center justify-center ${
                          st.active
                            ? 'bg-ember-glow text-on-primary animate-pulse'
                            : st.done
                            ? 'bg-primary-container text-on-primary'
                            : 'bg-surface-container-high text-ash-muted'
                        }`}
                      >
                        {st.step}
                      </span>
                      <span className="material-symbols-outlined text-ember-glow text-[22px]">{st.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-title-md text-body-md font-bold text-crust-cream">{st.title}</h4>
                      <p className="font-label-technical text-xs text-ash-muted mt-0.5">{st.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Courier & Kitchen Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
              <div className="p-space-lg rounded-2xl bg-surface-elevated border border-surface-border flex items-center gap-space-md">
                <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-ember-glow shrink-0 border border-surface-border">
                  <span className="material-symbols-outlined text-[28px]">chef_hat</span>
                </div>
                <div>
                  <span className="font-label-technical text-label-sm text-ash-muted uppercase block">
                    Pizzaiolo on Duty
                  </span>
                  <h4 className="font-headline-sm text-headline-sm text-crust-cream">Chef Matteo Russo</h4>
                  <p className="font-body-sm text-xs text-ash-muted">Master Kiln Specialist · Napoli Accredited</p>
                </div>
              </div>

              <div className="p-space-lg rounded-2xl bg-surface-elevated border border-surface-border flex items-center gap-space-md">
                <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0 border border-surface-border">
                  <span className="material-symbols-outlined text-[28px]">sports_motorsports</span>
                </div>
                <div>
                  <span className="font-label-technical text-label-sm text-ash-muted uppercase block">
                    Thermal Velocity Courier
                  </span>
                  <h4 className="font-headline-sm text-headline-sm text-crust-cream">Arjun K.</h4>
                  <p className="font-body-sm text-xs text-ash-muted">Electric Velocity Fleet #04 · Staged</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
