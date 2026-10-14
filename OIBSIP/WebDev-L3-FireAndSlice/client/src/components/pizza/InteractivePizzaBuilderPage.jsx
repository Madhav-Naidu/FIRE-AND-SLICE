import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';

const PIZZA_CANVAS_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA0voSuVyBPZb9hy7oQpnkAEc4FRg0sCOCpgddx9_-khppn4ZoX9ieabUmgEHCvgh5NKGTc6skpBfIpFmqQnnsRnZDJblw_m0Dz2we2-dvsABkIQmBYbkeGQztJmlmg9FbkLEKm8QV7k4EQhqjFs-f_JlbQvtUS4gxNAsc53Uo54y5MGcfcuzd8fLXzpwlCnrFQwzT5W-WDcMieScOh1pf5RrNm0QT-ql4vuDKMhLHauoMPcPfPKB4oQ';

export function InteractivePizzaBuilderPage() {
  const navigate = useNavigate();
  const { addItem, openCart } = useCartStore();

  const [size, setSize] = useState({ name: 'Medium (11")', price: 170, label: 'Serves 2-3' });
  const [crust, setCrust] = useState({ name: 'Neapolitan Sourdough', price: 0, desc: 'Naturally Leavened' });
  const [sauce, setSauce] = useState({ name: 'San Marzano DOP', price: 0, desc: 'Cold Pressed Oil' });
  const [cheese, setCheese] = useState({ name: 'Fior di Latte Mozzarella', price: 0, desc: 'Fresh & stretchy' });
  const [selectedToppings, setSelectedToppings] = useState([
    { name: 'Fire-Roasted Peppers', price: 25 },
    { name: 'Sautéed Cremini Mushrooms', price: 35 },
  ]);

  const [toastMsg, setToastMsg] = useState(null);

  const SIZES = [
    { name: 'Personal (8")', price: 0, label: 'Serves 1' },
    { name: 'Medium (11")', price: 170, label: 'Serves 2-3' },
    { name: 'Large (14")', price: 350, label: 'Serves 3-4' },
  ];

  const CRUSTS = [
    { name: 'Neapolitan Sourdough', price: 0, desc: '72h Cold Biga · High hydration' },
    { name: 'Ancient Spelt Grain', price: 40, desc: 'Nutty profile · Organic flour' },
    { name: 'Roman Crisp Thin', price: 30, desc: 'Ultra-thin · Biscotto blistered' },
    { name: 'Cheese Burst Core', price: 70, desc: 'Molten scamorza ring inside' },
    { name: 'Gluten-Free Hearth', price: 50, desc: 'Cauliflower & rice blend' },
  ];

  const SAUCES = [
    { name: 'San Marzano DOP', price: 0, desc: 'Italian volcanic valley tomato pulp' },
    { name: 'Spicy Arrabbiata', price: 20, desc: 'Bird’s-eye chili & roasted garlic' },
    { name: 'Basil Genovese Pesto', price: 35, desc: 'Cold crushed basil, pine nuts, parm' },
    { name: 'White Truffle Garlic Cream', price: 45, desc: 'Whipped mascarpone & summer truffle' },
    { name: 'Sweet Hickory BBQ', price: 25, desc: 'Smoked oak wood reduction' },
  ];

  const CHEESES = [
    { name: 'Fior di Latte Mozzarella', price: 0, desc: 'Fresh artisan cow milk curd' },
    { name: 'Smoked Scamorza', price: 35, desc: 'Hard-wood smoked rich stretch' },
    { name: 'Aged Parmesan & Pecorino', price: 45, desc: '24-month granular umami punch' },
    { name: 'Plant-Based Cashew Mozz', price: 55, desc: 'Fermented stone-ground vegan' },
  ];

  const TOPPINGS = [
    { name: 'Fire-Roasted Peppers', price: 25, icon: '🫑' },
    { name: 'Sautéed Cremini Mushrooms', price: 35, icon: '🍄' },
    { name: 'Caramelized Shallots', price: 20, icon: '🧅' },
    { name: 'Charred Sweet Corn', price: 20, icon: '🌽' },
    { name: 'Kalamata Olives', price: 30, icon: '🫒' },
    { name: 'Sun-Dried Tomatoes', price: 30, icon: '🍅' },
    { name: 'Pickled Jalapeños', price: 25, icon: '🌶' },
    { name: 'Fresh Sweet Basil', price: 15, icon: '🌿' },
  ];

  const basePizzaPrice = 249;
  const toppingsTotal = selectedToppings.reduce((acc, t) => acc + t.price, 0);
  const totalPrice = basePizzaPrice + size.price + crust.price + sauce.price + cheese.price + toppingsTotal;

  const toggleTopping = (topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.name === topping.name);
      if (exists) {
        return prev.filter((t) => t.name !== topping.name);
      } else {
        return [...prev, topping];
      }
    });
  };

  const handleReset = () => {
    setSize(SIZES[1]);
    setCrust(CRUSTS[0]);
    setSauce(SAUCES[0]);
    setCheese(CHEESES[0]);
    setSelectedToppings([TOPPINGS[0], TOPPINGS[1]]);
  };

  const handleAddToCart = () => {
    addItem({
      name: 'Custom Artisanal Pie',
      size: size.name,
      price: totalPrice,
      quantity: 1,
      crust: crust.name,
      additions: [sauce.name, cheese.name, ...selectedToppings.map((t) => t.name)],
      image: PIZZA_CANVAS_IMG,
    });

    setToastMsg(`Bespoke ${crust.name} added to your order (₹${totalPrice})`);
    setTimeout(() => setToastMsg(null), 3500);
    openCart();
  };

  return (
    <div className="flex flex-col w-full bg-background min-h-screen">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-8 right-8 z-[120] animate-slide-up flex items-center gap-space-sm px-space-md py-space-sm rounded-lg bg-surface-elevated text-crust-cream border border-surface-border shadow-2xl">
          <span className="material-symbols-outlined text-ember-glow text-[22px]">check_circle</span>
          <div>
            <p className="font-title-md text-body-sm text-crust-cream font-bold">Added to Oven Queue</p>
            <p className="font-label-sm text-label-sm text-ash-muted">{toastMsg}</p>
          </div>
        </div>
      )}

      {/* Hero Anchor / Stage Title */}
      <section className="w-full bg-surface-charcoal px-grid-margin-mobile lg:px-grid-margin-desktop pt-space-xl pb-space-lg border-b border-surface-border">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs mb-space-2xs">
              <span className="w-2 h-2 rounded-full bg-ember-glow animate-pulse" />
              <span className="font-label-technical text-label-technical tracking-widest uppercase text-ember-glow">
                Live Wood Kiln Station · 450°C Stone
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-crust-cream">Bespoke Crust Atelier</h1>
            <p className="font-body-md text-body-md text-ash-muted max-w-2xl mt-space-2xs">
              Craft your individual sourdough creation with 48-hour cold fermentation dough, certified San Marzano D.O.P. reduction, and artisan stone hearth roasting.
            </p>
          </div>

          {/* Live Quick Stats Strip */}
          <div className="flex items-center gap-space-md bg-surface-container-low px-space-md py-space-xs rounded-xl self-start lg:self-auto border border-surface-border">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase text-ash-muted">Hearth Temp</span>
              <span className="font-label-technical text-label-technical text-crust-cream">450°C // Oak Log</span>
            </div>
            <div className="w-px h-8 bg-surface-border" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase text-ash-muted">Bake Speed</span>
              <span className="font-label-technical text-label-technical text-primary-container">90 Seconds Flash</span>
            </div>
            <div className="w-px h-8 bg-surface-border" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase text-ash-muted">Hydration</span>
              <span className="font-label-technical text-label-technical text-tertiary">78% Leavened</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 1: INTERACTIVE PIZZA BUILDER STUDIO ================= */}
      <section className="w-full bg-surface px-grid-margin-mobile lg:px-grid-margin-desktop py-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* Left Column: Visual Dynamic Pizza Stage (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg lg:sticky lg:top-28">
            {/* Cast Iron Visual Stage */}
            <div className="relative w-full rounded-2xl bg-surface-container-lowest overflow-hidden shadow-2xl p-space-md sm:p-space-xl flex flex-col items-center justify-center min-h-[460px] lg:min-h-[560px] border border-surface-border">
              {/* Ambient Oven Fire Glow Overlay */}
              <div className="absolute inset-0 bg-radial from-ember-glow/10 via-transparent to-transparent pointer-events-none" />

              {/* Technical Watermark / Stamp */}
              <div className="absolute top-space-md left-space-md flex items-center gap-space-xs z-20">
                <span className="px-space-xs py-space-2xs rounded bg-surface-charcoal/80 text-ash-muted font-label-technical text-label-sm uppercase backdrop-blur-md border border-surface-border">
                  Stage 01 // Cast-Iron Skillet
                </span>
                <span className="px-space-xs py-space-2xs rounded bg-primary-container/20 text-ember-glow font-label-technical text-label-sm uppercase border border-primary-container/30">
                  {crust.name}
                </span>
              </div>

              <div className="absolute top-space-md right-space-md z-20 flex flex-col items-end">
                <span className="font-label-technical text-label-technical text-ash-muted uppercase tracking-wider">
                  Live Spec
                </span>
                <span className="font-label-technical text-label-technical text-crust-cream">
                  740 kcal · 28g P
                </span>
              </div>

              {/* Dynamic Pan / Crust Canvas */}
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] flex items-center justify-center transition-transform duration-500">
                {/* Skillet Rim */}
                <div className="absolute inset-0 rounded-full bg-surface-container-low shadow-[0_20px_50px_rgba(0,0,0,0.8)] scale-105 flex items-center justify-center border-4 border-surface-border">
                  <div className="w-[96%] h-[96%] rounded-full bg-surface-charcoal shadow-inner" />
                </div>

                {/* Pizza Main Photo */}
                <div className="relative w-[90%] h-[90%] rounded-full overflow-hidden shadow-2xl z-10">
                  <img
                    className="w-full h-full object-cover rounded-full transform transition-all duration-700 hover:scale-105"
                    alt="Wood-fired artisanal sourdough pizza in cast iron skillet"
                    src={PIZZA_CANVAS_IMG}
                  />

                  {/* Realtime Interactive Layer Badges Overlaid on Pizza */}
                  <div className="absolute inset-0 pointer-events-none flex flex-wrap items-center justify-center gap-2 p-6 z-20">
                    <span className="px-2 py-1 rounded bg-surface-charcoal/85 backdrop-blur-md text-crust-cream text-[10px] font-label-technical uppercase shadow-lg transform -translate-y-8 animate-bounce border border-surface-border">
                      {sauce.name}
                    </span>
                    <span className="px-2 py-1 rounded bg-surface-charcoal/85 backdrop-blur-md text-ember-glow text-[10px] font-label-technical uppercase shadow-lg transform translate-x-10 translate-y-6 border border-surface-border">
                      {cheese.name}
                    </span>
                    {selectedToppings.map((t, idx) => (
                      <span
                        key={t.name}
                        className={`px-2 py-0.5 rounded bg-surface-elevated/90 backdrop-blur-md text-primary text-[9px] font-label-technical uppercase shadow-md border border-primary/30 transform ${
                          idx % 2 === 0 ? '-translate-x-12 translate-y-2' : 'translate-x-6 -translate-y-12'
                        }`}
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Kiln Fire Sparkles Decoration */}
                <div className="absolute -bottom-4 right-8 z-20 flex items-center gap-1.5 px-space-sm py-space-2xs rounded-full bg-surface-charcoal/90 backdrop-blur-md border border-surface-border">
                  <span className="material-symbols-outlined text-[16px] text-ember-glow">local_fire_department</span>
                  <span className="font-label-technical text-label-sm text-crust-cream">
                    Char Level: Leopard Blistered
                  </span>
                </div>
              </div>

              {/* Bottom Stage Selector Tools */}
              <div className="w-full flex flex-col sm:flex-row items-center justify-between mt-space-md pt-space-sm bg-surface-container/60 rounded-xl p-space-sm gap-space-sm z-20 border border-surface-border">
                <div className="flex items-center gap-space-xs text-ash-muted font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">info</span>
                  <span>100% Organic Italian Caputo Flour fermented 48 hrs</span>
                </div>
                <button
                  className="flex items-center gap-1 font-label-technical text-label-sm text-ash-muted hover:text-crust-cream transition-colors uppercase cursor-pointer"
                  onClick={handleReset}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span> Reset Defaults
                </button>
              </div>
            </div>

            {/* Hearth Blueprint / Summary Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
              <div className="p-space-sm bg-surface-container-low rounded-xl flex flex-col border border-surface-border">
                <span className="font-label-sm text-label-sm uppercase text-ash-muted">Size Spec</span>
                <span className="font-title-md text-body-md text-crust-cream mt-0.5 font-bold">{size.name}</span>
                <span className="font-label-technical text-label-sm text-ash-muted">{size.label}</span>
              </div>
              <div className="p-space-sm bg-surface-container-low rounded-xl flex flex-col border border-surface-border">
                <span className="font-label-sm text-label-sm uppercase text-ash-muted">Crust Profile</span>
                <span className="font-title-md text-body-md text-crust-cream mt-0.5 font-bold truncate">{crust.name}</span>
                <span className="font-label-technical text-label-sm text-ash-muted">{crust.desc}</span>
              </div>
              <div className="p-space-sm bg-surface-container-low rounded-xl flex flex-col border border-surface-border">
                <span className="font-label-sm text-label-sm uppercase text-ash-muted">Base Sauce</span>
                <span className="font-title-md text-body-md text-crust-cream mt-0.5 font-bold truncate">{sauce.name}</span>
                <span className="font-label-technical text-label-sm text-ash-muted">{sauce.desc}</span>
              </div>
              <div className="p-space-sm bg-surface-container-low rounded-xl flex flex-col border border-surface-border">
                <span className="font-label-sm text-label-sm uppercase text-ash-muted">Selected Toppings</span>
                <span className="font-title-md text-body-md text-ember-glow mt-0.5 font-bold">
                  {selectedToppings.length} Additions
                </span>
                <span className="font-label-technical text-label-sm text-ash-muted">Stone Baked</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Studio Controls (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* Step 1: Size & Crust */}
            <div className="bg-surface-elevated p-space-lg rounded-2xl border border-surface-border flex flex-col gap-space-md">
              <div className="flex items-center justify-between border-b border-surface-border pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-label-technical text-label-sm flex items-center justify-center font-bold">
                    01
                  </span>
                  <h3 className="font-headline-sm text-title-md text-crust-cream uppercase tracking-wider">
                    Sourdough Base & Diameter
                  </h3>
                </div>
                <span className="font-label-technical text-label-sm text-ash-muted">Step 1 of 4</span>
              </div>

              {/* Diameter selection */}
              <div>
                <span className="font-label-technical text-label-sm text-ash-muted uppercase block mb-space-xs">
                  A. Select Size
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map((sz) => (
                    <button
                      key={sz.name}
                      onClick={() => setSize(sz)}
                      className={`p-space-xs rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        size.name === sz.name
                          ? 'bg-primary-container border-primary-container text-on-primary shadow-md'
                          : 'bg-surface-container-low border-surface-border text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <span className="font-title-md text-body-sm font-bold">{sz.name}</span>
                      <span className="font-label-technical text-label-sm opacity-80">
                        {sz.price === 0 ? 'Base' : `+₹${sz.price}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Crust Style */}
              <div>
                <span className="font-label-technical text-label-technical text-ash-muted uppercase block mb-space-xs">
                  B. Crust Style
                </span>
                <div className="flex flex-col gap-2">
                  {CRUSTS.map((cr) => (
                    <div
                      key={cr.name}
                      onClick={() => setCrust(cr)}
                      className={`p-space-sm rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        crust.name === cr.name
                          ? 'bg-surface-container border-primary-container text-crust-cream'
                          : 'bg-surface-container-low border-surface-border hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-space-xs">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                            crust.name === cr.name
                              ? 'border-ember-glow bg-ember-glow'
                              : 'border-ash-muted'
                          }`}
                        />
                        <div>
                          <p className="font-title-md text-body-sm font-bold text-crust-cream">{cr.name}</p>
                          <p className="font-body-sm text-label-sm text-ash-muted">{cr.desc}</p>
                        </div>
                      </div>
                      <span className="font-label-technical text-label-sm text-primary font-bold">
                        {cr.price === 0 ? 'Included' : `+₹${cr.price}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Signature Sauces */}
            <div className="bg-surface-elevated p-space-lg rounded-2xl border border-surface-border flex flex-col gap-space-md">
              <div className="flex items-center justify-between border-b border-surface-border pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-label-technical text-label-sm flex items-center justify-center font-bold">
                    02
                  </span>
                  <h3 className="font-headline-sm text-title-md text-crust-cream uppercase tracking-wider">
                    Signature Sauces
                  </h3>
                </div>
                <span className="font-label-technical text-label-sm text-ash-muted">Step 2 of 4</span>
              </div>

              <div className="flex flex-col gap-2">
                {SAUCES.map((sc) => (
                  <div
                    key={sc.name}
                    onClick={() => setSauce(sc)}
                    className={`p-space-sm rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      sauce.name === sc.name
                        ? 'bg-surface-container border-primary-container text-crust-cream'
                        : 'bg-surface-container-low border-surface-border hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-space-xs">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                          sauce.name === sc.name ? 'border-ember-glow bg-ember-glow' : 'border-ash-muted'
                        }`}
                      />
                      <div>
                        <p className="font-title-md text-body-sm font-bold text-crust-cream">{sc.name}</p>
                        <p className="font-body-sm text-label-sm text-ash-muted">{sc.desc}</p>
                      </div>
                    </div>
                    <span className="font-label-technical text-label-sm text-primary font-bold">
                      {sc.price === 0 ? 'Included' : `+₹${sc.price}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Cheeses */}
            <div className="bg-surface-elevated p-space-lg rounded-2xl border border-surface-border flex flex-col gap-space-md">
              <div className="flex items-center justify-between border-b border-surface-border pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-label-technical text-label-sm flex items-center justify-center font-bold">
                    03
                  </span>
                  <h3 className="font-headline-sm text-title-md text-crust-cream uppercase tracking-wider">
                    Artisan Cheeses
                  </h3>
                </div>
                <span className="font-label-technical text-label-sm text-ash-muted">Step 3 of 4</span>
              </div>

              <div className="flex flex-col gap-2">
                {CHEESES.map((ch) => (
                  <div
                    key={ch.name}
                    onClick={() => setCheese(ch)}
                    className={`p-space-sm rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      cheese.name === ch.name
                        ? 'bg-surface-container border-primary-container text-crust-cream'
                        : 'bg-surface-container-low border-surface-border hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-space-xs">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                          cheese.name === ch.name ? 'border-ember-glow bg-ember-glow' : 'border-ash-muted'
                        }`}
                      />
                      <div>
                        <p className="font-title-md text-body-sm font-bold text-crust-cream">{ch.name}</p>
                        <p className="font-body-sm text-label-sm text-ash-muted">{ch.desc}</p>
                      </div>
                    </div>
                    <span className="font-label-technical text-label-sm text-primary font-bold">
                      {ch.price === 0 ? 'Included' : `+₹${ch.price}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4: Toppings */}
            <div className="bg-surface-elevated p-space-lg rounded-2xl border border-surface-border flex flex-col gap-space-md">
              <div className="flex items-center justify-between border-b border-surface-border pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-label-technical text-label-sm flex items-center justify-center font-bold">
                    04
                  </span>
                  <h3 className="font-headline-sm text-title-md text-crust-cream uppercase tracking-wider">
                    Harvest & Hearth Toppings
                  </h3>
                </div>
                <span className="font-label-technical text-label-sm text-ember-glow font-bold">
                  {selectedToppings.length} Picked
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {TOPPINGS.map((tp) => {
                  const isChecked = selectedToppings.some((t) => t.name === tp.name);
                  return (
                    <div
                      key={tp.name}
                      onClick={() => toggleTopping(tp)}
                      className={`p-space-sm rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-surface-container border-primary-container text-crust-cream shadow-sm'
                          : 'bg-surface-container-low border-surface-border hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{tp.icon}</span>
                        <span className="font-body-sm text-xs font-semibold leading-tight">{tp.name}</span>
                      </div>
                      <span className="font-label-technical text-xs text-primary font-bold">+₹{tp.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Order Summary & Add to Cart Action */}
            <div className="bg-surface-container-lowest p-space-lg rounded-2xl border border-primary-container/40 flex flex-col gap-space-md shadow-2xl">
              <div className="flex justify-between items-center border-b border-surface-border pb-space-sm">
                <div>
                  <span className="font-label-technical text-label-sm text-ash-muted uppercase block">
                    Kiln Configuration
                  </span>
                  <h4 className="font-headline-sm text-headline-sm text-crust-cream">
                    Custom Artisanal Pie
                  </h4>
                </div>
                <div className="text-right">
                  <span className="font-label-technical text-label-sm text-ember-glow block">TOTAL COST</span>
                  <span className="font-headline-md text-headline-md text-primary-container font-bold">
                    ₹{totalPrice}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-ash-muted font-label-technical text-label-sm">
                <div className="flex justify-between">
                  <span>Base Hearth Pie</span>
                  <span className="text-crust-cream">₹{basePizzaPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size & Crust Profile</span>
                  <span className="text-crust-cream">+₹{size.price + crust.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sauce & Artisan Cheeses</span>
                  <span className="text-crust-cream">+₹{sauce.price + cheese.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Toppings ({selectedToppings.length})</span>
                  <span className="text-crust-cream">+₹{toppingsTotal}</span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-space-md bg-primary-container hover:bg-ember-glow text-on-primary font-title-md text-body-md uppercase tracking-wider rounded-xl shadow-xl transition-all flex items-center justify-center gap-space-xs transform hover:-translate-y-0.5 cursor-pointer font-bold"
              >
                <span>ADD TO CART & BAKE</span>
                <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
