import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { CustomizePizzaModal } from './CustomizePizzaModal';

const HERO_BG_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAe-LRUsOp1MEDNrACirS4WC24UhF2UAdnrylX_djH8kVcrinhe2NjlW3FnQ6SQazCvkBDUJjNqY5oKMoxCMMNqyWZ2nBqx38cwH5mLWiSMtpUNlcG4aGvcNJCtGSophBGoOwJ6AH2UYIlwMOkcxrUPxVK2ZvfvBo-A6pAZiAtpRW9C4jWQtGTatbHAjg2PBPljjxstsNI4HLZQkVnTyKM4OLpCr0x6zFVOlTs8y-fwWNPP_Iyz5S3IcQ';
const MARGHERITA_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbDCt--g1Hho1ldUPTrR3sQ9zTmh9eDtSDGpxq1mqM5JbQVoQCOvFU5dUWCeBTJbeke9V5wjTVpAE1Vm5Qn8UTZTzZ1bByhxf52AP8pkp3uRjq-ATRg0bD6nV4lVRKS4hMRl1kjDXTBDa-uiSJHXb5yX-T1Y4AQE_NLZDDGqa3foUQCbjimSJP12E1QETihH9G07WV_aQpJOjP20BQDnRZXJQjlNxGWB9Bz5PYReDr0z-S88UYk5lfuQ';
const PANEER_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqCX8SgCC4Cbp2atb-HmXV0HeY2pACfUf8nJRCKwQS1joYvGOSWdWLD9_uC-WYVgcCuXxmjhy_oG-cWZ143r7b417qf4RLXD8t-6FL9aC0e40kICMi3KVcRp9LtDIcrnjfRfLoxFuFUz-oyGHrJs8n2EcglGQlkRF94y2Fnkho_Xt-k0yGXYg1pml9Sg3qxhbcvgna9YpkyQBJYCw6HBOMaG8sRHK4izgmsvTef44dllGUxnzXp8EF1A';
const FARMHOUSE_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-thnkd6HsTEdrSv_GPk78auySX7Z5uXtZ1ZoduCRhZ5vLiqFU8-jHoi5G3q0bfTWDe-rNX88cvUrh_F8B0ZxwdAJg_CQRC-1tj0rZkg06A_FFOcCAoqcLfNZmQM6-r-GS1boGl3bT2dVfxcDLZUA2XN05P6-q6VLLLIyJVlOP-XT5RvxcGT1Mm5C2vm1pwgtey-_YrmZdD1r3xIj4kTEf2sGHyA9-3AvioDHOZssn3HEoUDFFjNJXeQ';
const PERIPERI_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc3pHvT54uCaepwbIuV6zaCZtDtvc2Za4g6hu3Nrg5khrggzkLwEJ8XCQ0qkgKjSBtnBMYEEOhU1w_xGxKoIxhV-_mmlMAI9yMrrau5J1dqLpOstB7kQjb8JwzN0rQGXGluriCYztNqfzNkIa1T1ex2ilJwPaAW10J5h0xCCCXby2SyTJ1xCaDocEM69tC1gYKzVmp1SOlV3DUnJ8YrD3t_9eG9mf0oQwnyzAaNXl2lya9Tl3rPZAJDQ';
const DOUGH_CRAFT_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAENWiywxQ_rfsGWXEwf-CvLYBeE3d0I5cy4aJQh3rtGA1mfiWWtf3hpLln4fu_FhPMtk9clxIMgDgcpoJOLZGZffMjMS9Ri4RLVv0BbpCP67JBlzuvaQnEZhZNTiEoab5xUTGGCdwDICmn6wZIoMxX1lZ017787J8PP6YC_WvTT9wc9AWxJ3JCLuuNmL3h-iL3rkjX5LI1GzrF7hFgWM3RH0aWxXrMJpo0BtJS9Gc_KjTmkdjfKNMIqg';
const OVEN_PEEL_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtkWbeJ__U1cLdrx8fX2u1suJBB8SGM-q7512VVLs45M7eCP1SsTfbu4iWVxDFHr5ys6ZXiPMpwLFbDTfXscieFt4QOW5XP63zTLL8ngRLHI7uKvcDeo77_ewnbamsmteNHmTexyM_8mNJv8KQy9P38-QO0FKSSezolcdOwHRuXH-1dQ2nBC2OEauvGoqYCD65fqv4jmRDFuirVp0Tbaw2khlauZsb_MZHVeZ8Avi4YHj7YZJ0cZmzzA';

const PIZZA_ITEMS = [
  {
    id: 'pizza-margherita',
    name: 'Fire Margherita',
    desc: 'San Marzano DOP tomato pulp, fior di latte mozzarella, aromatic hand-torn basil, cold-pressed EVOO.',
    categories: ['signature', 'veg', 'cheese'],
    badge: 'PURE VEG',
    badgeType: 'veg',
    rating: '4.9',
    reviews: '1.2k',
    image: MARGHERITA_IMG,
    prices: { Personal: 299, Medium: 469, Large: 649 },
  },
  {
    id: 'pizza-paneer',
    name: 'Smoked Paneer',
    desc: 'Smoked artisanal cottage cheese, fire-roasted sweet peppers, caramelized shallots, smoked scamorza cheese blend.',
    categories: ['signature', 'veg', 'spicy'],
    badge: 'PURE VEG',
    badgeType: 'veg',
    rating: '4.8',
    reviews: '980',
    image: PANEER_IMG,
    prices: { Personal: 349, Medium: 529, Large: 719 },
  },
  {
    id: 'pizza-farmhouse',
    name: 'Farmhouse Fire',
    desc: 'Wild cremini mushrooms, charred bell peppers, charred sweet corn, sun-ripened olives, crushed thyme.',
    categories: ['signature', 'veg'],
    badge: 'PURE VEG',
    badgeType: 'veg',
    rating: '4.7',
    reviews: '750',
    image: FARMHOUSE_IMG,
    prices: { Personal: 329, Medium: 499, Large: 689 },
  },
  {
    id: 'pizza-periperi',
    name: 'Chicken Peri-Peri',
    desc: "Oak flame-grilled spiced chicken breast, fire-roasted jalapeños, smoked mozzarella, house bird's-eye chili emulsion.",
    categories: ['signature', 'spicy'],
    badge: 'NON-VEG',
    badgeType: 'non-veg',
    rating: '4.9',
    reviews: '1.6k',
    image: PERIPERI_IMG,
    prices: { Personal: 399, Medium: 599, Large: 799 },
  },
  {
    id: 'pizza-truffle',
    name: 'Truffle Wild Mushroom',
    desc: 'Sauteed porcini & cremini mushrooms, white truffle oil, fontina cheese, fresh thyme, flaky sea salt.',
    categories: ['signature', 'veg', 'cheese'],
    badge: 'PURE VEG',
    badgeType: 'veg',
    rating: '4.9',
    reviews: '890',
    image: FARMHOUSE_IMG,
    prices: { Personal: 389, Medium: 579, Large: 769 },
  },
  {
    id: 'pizza-quattro',
    name: 'Quattro Formaggi Flame',
    desc: 'Fior di latte, Gorgonzola Dolce, Smoked Scamorza, aged Parmigiano Reggiano, hot honey drizzle.',
    categories: ['signature', 'veg', 'cheese'],
    badge: 'PURE VEG',
    badgeType: 'veg',
    rating: '4.8',
    reviews: '1.1k',
    image: MARGHERITA_IMG,
    prices: { Personal: 369, Medium: 549, Large: 739 },
  },
  {
    id: 'side-knots',
    name: 'Truffle Garlic Knots',
    desc: 'Wood-oven baked sourdough knots tossed in whipped truffle butter, crushed garlic, and grated pecorino.',
    categories: ['sides', 'veg'],
    badge: 'HOT SIDE',
    badgeType: 'veg',
    rating: '4.9',
    reviews: '620',
    image: DOUGH_CRAFT_IMG,
    prices: { Personal: 169 },
  },
  {
    id: 'drink-spritz',
    name: 'Italian Amaro Spritz',
    desc: 'Bittersweet artisanal Italian herbal infusion with blood orange peel, sparkling mineral soda, and fresh rosemary sprig.',
    categories: ['drinks'],
    badge: 'CHILLED',
    badgeType: 'veg',
    rating: '4.7',
    reviews: '410',
    image: OVEN_PEEL_IMG,
    prices: { Personal: 129 },
  },
];

export function CinematicHomePage() {
  const navigate = useNavigate();
  const { addItem, applyVoucher, openCart } = useCartStore();

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedSizes, setSelectedSizes] = useState({
    'pizza-margherita': 'Personal',
    'pizza-paneer': 'Personal',
    'pizza-farmhouse': 'Personal',
    'pizza-periperi': 'Personal',
    'pizza-truffle': 'Personal',
    'pizza-quattro': 'Personal',
  });

  const [customizeModalPizza, setCustomizeModalPizza] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, icon = 'check_circle') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({ message, icon });
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const scrollToMenu = () => {
    const el = document.getElementById('menu-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSizeSelect = (pizzaId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [pizzaId]: size }));
  };

  const handleAddToCart = (pizza) => {
    const size = selectedSizes[pizza.id] || 'Personal';
    const price = pizza.prices[size] || pizza.prices.Personal;

    addItem({
      name: pizza.name,
      size: `${size} (${size === 'Personal' ? '8"' : size === 'Medium' ? '11"' : '14"'})`,
      price,
      quantity: 1,
      crust: '72h Neapolitan Biga',
      image: pizza.image,
    });

    showToast(`${pizza.name} (${size}) added to your cart`);
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    applyVoucher(code);
    showToast(`Coupon ${code} applied to your cart!`, 'local_offer');
    openCart();
  };

  const filteredPizzas = PIZZA_ITEMS.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.categories.includes(activeCategory);
  });

  return (
    <div className="flex flex-col w-full relative selection:bg-primary-container selection:text-on-primary">
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full min-h-[92vh] flex items-center justify-center -mt-20 pt-20 overflow-hidden bg-surface-charcoal">
        {/* Hero Background Image Scrim */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center mix-blend-lighten opacity-40 scale-105 transition-transform duration-1000 ease-out"
          style={{ backgroundImage: `url('${HERO_BG_IMG}')` }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/70 to-surface-charcoal/80" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-ember-glow/10 via-transparent to-transparent" />

        <div className="relative z-10 w-full px-grid-margin-mobile lg:px-grid-margin-desktop py-space-3xl flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Precision Tech Specs Pill */}
          <div className="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-surface-elevated/90 shadow-xl mb-space-lg backdrop-blur-md border border-surface-border">
            <span className="material-symbols-outlined text-[16px] text-ember-glow">science</span>
            <span className="font-label-technical text-label-technical tracking-widest text-primary uppercase">
              WOOD FIRED // 450°C // 90 SEC
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-ember-glow" />
            <span className="font-label-technical text-label-sm text-tertiary">72H FERMENTATION</span>
          </div>

          {/* Hero Typography */}
          <h1 className="font-display-hero text-display-hero text-crust-cream uppercase tracking-tight max-w-4xl leading-[1.02] drop-shadow-2xl mb-space-md">
            Crafted by Fire.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-crust-cream via-primary-fixed to-ember-glow">
              Delivered to You.
            </span>
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-space-xl font-normal leading-relaxed">
            Hand-stretched dough. Slow-fermented crust. Fresh ingredients. Fired hot in hand-built stone kilns and delivered fresh straight to your doorstep.
          </p>

          {/* Action Button Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-space-md w-full sm:w-auto">
            <button
              className="w-full sm:w-auto px-space-xl py-space-md bg-primary-container hover:bg-ember-glow text-on-primary font-title-md text-body-md uppercase tracking-wider rounded-lg shadow-[0_12px_32px_-8px_rgba(244,98,48,0.4)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-space-xs cursor-pointer"
              onClick={scrollToMenu}
            >
              <span>ORDER NOW</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
            <button
              className="w-full sm:w-auto px-space-xl py-space-md bg-surface-elevated hover:bg-surface-container-high text-crust-cream font-title-md text-body-md uppercase tracking-wider rounded-lg shadow-md border border-surface-border transition-all flex items-center justify-center gap-space-xs cursor-pointer"
              onClick={() => navigate('/builder')}
            >
              <span>BUILD YOUR PIZZA</span>
              <span className="material-symbols-outlined text-[20px] text-ember-glow">tune</span>
            </button>
          </div>

          {/* Quick Micro-Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md mt-space-3xl pt-space-xl w-full max-w-4xl border-t border-surface-border/40">
            <div className="flex flex-col items-center">
              <span className="font-headline-sm text-headline-sm text-crust-cream font-bold">450°C</span>
              <span className="font-label-technical text-label-sm text-ash-muted uppercase">Baking Temp</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-headline-sm text-headline-sm text-crust-cream font-bold">90 SEC</span>
              <span className="font-label-technical text-label-sm text-ash-muted uppercase">Flash Kiln Time</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-headline-sm text-headline-sm text-crust-cream font-bold">72 HRS</span>
              <span className="font-label-technical text-label-sm text-ash-muted uppercase">Dough Hydration</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-headline-sm text-headline-sm text-crust-cream font-bold">100%</span>
              <span className="font-label-technical text-label-sm text-ash-muted uppercase">Italian Stone Ground</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHAT ARE YOU CRAVING? (STICKY FILTER BAR) ================= */}
      <section
        className="w-full bg-surface-charcoal/95 backdrop-blur-md sticky top-20 z-40 py-space-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-y border-surface-border"
        id="menu-section"
      >
        <div className="w-full px-grid-margin-mobile lg:px-grid-margin-desktop flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs shrink-0">
            <span className="material-symbols-outlined text-ember-glow text-[20px]">restaurant_menu</span>
            <span className="font-label-technical text-label-technical uppercase tracking-widest text-crust-cream">
              WHAT ARE YOU CRAVING?
            </span>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex items-center gap-space-xs overflow-x-auto pb-space-2xs md:pb-0 scrollbar-none" id="filter-pills-row">
            {[
              { id: 'all', label: '🍕 All Pies' },
              { id: 'signature', label: '🔥 Signature' },
              { id: 'veg', label: '🥬 Veg' },
              { id: 'spicy', label: '🌶 Spicy' },
              { id: 'cheese', label: '🧀 Cheese Lovers' },
              { id: 'sides', label: '🍟 Sides' },
              { id: 'drinks', label: '🥤 Drinks' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`filter-pill shrink-0 px-space-md py-space-xs rounded-full font-title-md text-body-sm transition-all flex items-center gap-space-2xs cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-primary-container text-on-primary font-bold shadow-md'
                    : 'bg-surface-elevated hover:bg-surface-container-high text-on-surface-variant hover:text-crust-cream border border-surface-border'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SIGNATURE PIZZAS SHOWCASE ================= */}
      <section className="w-full py-space-3xl px-grid-margin-mobile lg:px-grid-margin-desktop bg-background">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-2xl gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs text-ember-glow font-label-technical text-label-technical tracking-widest uppercase mb-space-2xs">
              <span>SIGNATURE // 01</span>
              <span>·</span>
              <span>FIRED @ 450°C</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-crust-cream tracking-tight">Our Most Loved Pizzas</h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            Each pie is handcrafted to order using ancient mother-dough biga fermented for three suns, blistered atop volcanic biscotto stone.
          </p>
        </div>

        {/* Pizza Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg" id="pizza-cards-grid">
          {filteredPizzas.map((pizza) => {
            const currentSize = selectedSizes[pizza.id] || 'Personal';
            const price = pizza.prices[currentSize] || pizza.prices.Personal;

            return (
              <article
                key={pizza.id}
                className="pizza-card flex flex-col bg-surface-elevated rounded-xl overflow-hidden shadow-xl hover:shadow-[0_20px_40px_-15px_rgba(244,98,48,0.2)] border border-surface-border hover:border-primary-container/40 transition-all duration-300 group"
              >
                <div className="relative h-64 w-full overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={pizza.name}
                    src={pizza.image}
                  />
                  <div className="absolute top-space-sm left-space-sm flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-charcoal/80 backdrop-blur-md border border-surface-border/50">
                    <span
                      className={`w-2.5 h-2.5 rounded-full inline-block ${
                        pizza.badgeType === 'veg' ? 'bg-emerald-500' : 'bg-rose-600'
                      }`}
                    />
                    <span className="font-label-technical text-label-sm text-crust-cream">{pizza.badge}</span>
                  </div>
                  <div className="absolute top-space-sm right-space-sm flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-charcoal/80 backdrop-blur-md border border-surface-border/50">
                    <span className="material-symbols-outlined text-[15px] text-ember-glow">star</span>
                    <span className="font-label-technical text-label-sm text-crust-cream font-bold">{pizza.rating}</span>
                    <span className="font-label-technical text-label-sm text-ash-muted">({pizza.reviews})</span>
                  </div>
                </div>

                <div className="p-space-lg flex flex-col flex-grow justify-between gap-space-md">
                  <div>
                    <div className="flex justify-between items-baseline mb-space-2xs">
                      <h3 className="font-headline-sm text-headline-sm text-crust-cream group-hover:text-primary transition-colors">
                        {pizza.name}
                      </h3>
                      <span className="font-label-technical text-title-md text-primary-container font-bold">
                        ₹{price}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">{pizza.desc}</p>
                  </div>

                  {/* Size Selector Pills (if multiple sizes available) */}
                  {pizza.prices.Medium && (
                    <div>
                      <span className="font-label-technical text-label-sm text-ash-muted uppercase block mb-1.5">
                        Size Selection
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 bg-surface-container-low p-1 rounded-lg border border-surface-border">
                        {['Personal', 'Medium', 'Large'].map((sz) => (
                          <button
                            key={sz}
                            onClick={() => handleSizeSelect(pizza.id, sz)}
                            className={`py-1 text-center font-label-technical text-label-sm rounded transition-all cursor-pointer ${
                              currentSize === sz
                                ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                                : 'text-on-surface-variant hover:text-crust-cream'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-space-xs pt-space-xs">
                    <button
                      className="flex-grow py-space-xs px-space-sm bg-primary-container hover:bg-ember-glow text-on-primary font-title-md text-body-sm uppercase rounded-lg shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                      onClick={() => handleAddToCart(pizza)}
                    >
                      <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                      <span>ADD TO CART</span>
                    </button>
                    <button
                      className="p-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-crust-cream border border-surface-border transition-colors cursor-pointer"
                      onClick={() =>
                        setCustomizeModalPizza({
                          name: pizza.name,
                          size: `${currentSize} (${currentSize === 'Personal' ? '8"' : currentSize === 'Medium' ? '11"' : '14"'})`,
                          price,
                        })
                      }
                      title="Customize ingredients"
                    >
                      <span className="material-symbols-outlined text-[20px]">tune</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ================= OFFERS & CLUB ================= */}
      <section className="w-full py-space-3xl px-grid-margin-mobile lg:px-grid-margin-desktop bg-surface-charcoal relative overflow-hidden border-y border-surface-border" id="offers-section">
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between mb-space-2xl gap-space-md relative z-10">
          <div>
            <span className="font-label-technical text-label-technical uppercase tracking-widest text-primary mb-space-2xs block">
              FLAME ADVANTAGE CLUB
            </span>
            <h2 className="font-headline-lg text-headline-lg text-crust-cream tracking-tight">More Pizza. More Value.</h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
            Tap on any promo ticket below to copy the dispatch voucher code directly into your active cart order.
          </p>
        </div>

        {/* Offers Voucher Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg relative z-10">
          {/* Offer 1 */}
          <div className="bg-surface-elevated p-space-xl rounded-xl relative overflow-hidden group shadow-xl hover:shadow-[0_10px_30px_rgba(244,98,48,0.25)] border border-surface-border transition-all">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-container/10 rounded-full blur-2xl group-hover:bg-primary-container/20 transition-colors" />
            <div className="flex items-center justify-between mb-space-md">
              <span className="px-space-sm py-space-2xs rounded bg-surface-container font-label-technical text-label-sm text-ember-glow">
                FIRST FLAME ORDER
              </span>
              <span className="font-headline-sm text-headline-sm text-crust-cream font-bold">20% OFF</span>
            </div>
            <h3 className="font-title-md text-title-md text-crust-cream mb-space-xs">Welcome to the Hearth</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
              Get 20% discount on your first wood-fired order above ₹499. Fresh artisanal dough guaranteed.
            </p>
            <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-lg border border-surface-border">
              <div className="flex flex-col">
                <span className="font-label-technical text-label-sm text-ash-muted">COUPON CODE</span>
                <span className="font-label-technical text-body-md text-primary font-bold tracking-widest">FIRST20</span>
              </div>
              <button
                className="px-space-md py-space-xs bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-crust-cream font-label-technical text-label-technical uppercase rounded transition-colors flex items-center gap-1 cursor-pointer"
                onClick={() => handleCopyCoupon('FIRST20')}
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>COPY</span>
              </button>
            </div>
          </div>

          {/* Offer 2 */}
          <div className="bg-surface-elevated p-space-xl rounded-xl relative overflow-hidden group shadow-xl hover:shadow-[0_10px_30px_rgba(244,98,48,0.25)] border border-surface-border transition-all">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-ember-glow/10 rounded-full blur-2xl group-hover:bg-ember-glow/20 transition-colors" />
            <div className="flex items-center justify-between mb-space-md">
              <span className="px-space-sm py-space-2xs rounded bg-surface-container font-label-technical text-label-sm text-ember-glow">
                KILN COMBO
              </span>
              <span className="font-headline-sm text-headline-sm text-crust-cream font-bold">₹499 FLAT</span>
            </div>
            <h3 className="font-title-md text-title-md text-crust-cream mb-space-xs">Weekend Feast Pack</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
              Any Medium Signature Pizza + Truffle Garlic Knots + 2 House Cold Brews or Amaro Spritz.
            </p>
            <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-lg border border-surface-border">
              <div className="flex flex-col">
                <span className="font-label-technical text-label-sm text-ash-muted">COUPON CODE</span>
                <span className="font-label-technical text-body-md text-primary font-bold tracking-widest">WEEKEND499</span>
              </div>
              <button
                className="px-space-md py-space-xs bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-crust-cream font-label-technical text-label-technical uppercase rounded transition-colors flex items-center gap-1 cursor-pointer"
                onClick={() => handleCopyCoupon('WEEKEND499')}
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>COPY</span>
              </button>
            </div>
          </div>

          {/* Offer 3 */}
          <div className="bg-surface-elevated p-space-xl rounded-xl relative overflow-hidden group shadow-xl hover:shadow-[0_10px_30px_rgba(244,98,48,0.25)] border border-surface-border transition-all">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
            <div className="flex items-center justify-between mb-space-md">
              <span className="px-space-sm py-space-2xs rounded bg-surface-container font-label-technical text-label-sm text-ember-glow">
                COMMUNAL TABLE
              </span>
              <span className="font-headline-sm text-headline-sm text-crust-cream font-bold">BUY 2 GET 1</span>
            </div>
            <h3 className="font-title-md text-title-md text-crust-cream mb-space-xs">Trio Kiln Special</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
              Order any two Large gourmet pies and receive a classic Neapolitan Margherita on the house.
            </p>
            <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-lg border border-surface-border">
              <div className="flex flex-col">
                <span className="font-label-technical text-label-sm text-ash-muted">COUPON CODE</span>
                <span className="font-label-technical text-body-md text-primary font-bold tracking-widest">BUY2GET1</span>
              </div>
              <button
                className="px-space-md py-space-xs bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-crust-cream font-label-technical text-label-technical uppercase rounded transition-colors flex items-center gap-1 cursor-pointer"
                onClick={() => handleCopyCoupon('BUY2GET1')}
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>COPY</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= REVIEWS & CRAFT STORY ================= */}
      <section className="w-full py-space-3xl px-grid-margin-mobile lg:px-grid-margin-desktop bg-background">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center">
          {/* Left Narrative Spec */}
          <div className="lg:col-span-6 flex flex-col gap-space-lg">
            <div>
              <span className="font-label-technical text-label-technical uppercase tracking-widest text-ember-glow mb-space-2xs block">
                THE CRAFT PHILOSOPHY
              </span>
              <h2 className="font-headline-lg text-headline-lg text-crust-cream tracking-tight">
                Slow Fermentation.
                <br />
                72-Hour Biga.
                <br />
                Italian Volcanic Stone.
              </h2>
            </div>
            <p className="font-body-lg text-body-lg text-on-surface-variant font-light leading-relaxed">
              We reject hurried dough. Our proprietary natural mother sourdough rests cold-fermented for a minimum of 72 hours. When slid into our 450°C wood kiln, intense thermal radiation shocks trapped micro-gases, creating an ultra-light, blistered, honeycombed cornicione that digests effortlessly.
            </p>

            {/* Technical Telemetry Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm">
              <div className="p-space-md rounded-lg bg-surface-elevated border border-surface-border">
                <span className="font-label-technical text-label-sm text-ash-muted block mb-1">HYDRATION RATE</span>
                <span className="font-headline-sm text-headline-sm text-crust-cream">74.5%</span>
              </div>
              <div className="p-space-md rounded-lg bg-surface-elevated border border-surface-border">
                <span className="font-label-technical text-label-sm text-ash-muted block mb-1">OVEN FLOOR</span>
                <span className="font-headline-sm text-headline-sm text-crust-cream">Biscotto</span>
              </div>
              <div className="p-space-md rounded-lg bg-surface-elevated col-span-2 sm:col-span-1 border border-surface-border">
                <span className="font-label-technical text-label-sm text-ash-muted block mb-1">WOOD VARIETY</span>
                <span className="font-headline-sm text-headline-sm text-crust-cream">Aged Oak</span>
              </div>
            </div>

            {/* Curated Review Snippet */}
            <div className="p-space-lg rounded-xl bg-surface-container-low border border-surface-border flex flex-col gap-space-xs">
              <div className="flex items-center gap-1 text-ember-glow">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-[18px]">
                    star
                  </span>
                ))}
              </div>
              <p className="font-body-md text-body-md text-crust-cream italic">
                "Easily the most transcendent wood-fired crust in the entire metropolis. The charred leopard spots carry a sublime hazelnut aroma. Arrived blistering hot."
              </p>
              <div className="flex items-center justify-between text-ash-muted pt-space-xs font-label-technical text-label-sm">
                <span>— Marco Valenti, Gastronomy Critic</span>
                <span className="text-primary font-bold">VERIFIED PATRON</span>
              </div>
            </div>
          </div>

          {/* Right Visual Showcase / Process Diagram */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-space-md">
              <div className="h-64 rounded-xl overflow-hidden shadow-xl bg-surface-elevated border border-surface-border">
                <img
                  className="w-full h-full object-cover"
                  alt="Baker hand-stretching artisan pizza dough"
                  src={DOUGH_CRAFT_IMG}
                />
              </div>
              <div className="p-space-lg rounded-xl bg-surface-elevated border border-surface-border flex flex-col justify-center">
                <span className="font-label-technical text-label-sm text-primary mb-1">STEP 01</span>
                <h4 className="font-headline-sm text-headline-sm text-crust-cream mb-1">Cold Biga Matrix</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Triple-phase natural fermentation developing deep complex aromatics and bubbly alveolar structure.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-space-md pt-space-xl">
              <div className="p-space-lg rounded-xl bg-surface-elevated border border-surface-border flex flex-col justify-center">
                <span className="font-label-technical text-label-sm text-ember-glow mb-1">STEP 02</span>
                <h4 className="font-headline-sm text-headline-sm text-crust-cream mb-1">450°C Thermal Shock</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Rapid caramelization of wild grain sugars locking in moist crumb with blistering outer char.
                </p>
              </div>
              <div className="h-64 rounded-xl overflow-hidden shadow-xl bg-surface-elevated border border-surface-border">
                <img
                  className="w-full h-full object-cover"
                  alt="Freshly baked artisan pizza pulled from fiery kiln"
                  src={OVEN_PEEL_IMG}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[110] bg-surface-elevated text-crust-cream px-space-md py-space-sm rounded-lg shadow-2xl flex items-center gap-space-xs border border-surface-border animate-slide-up">
          <span className="material-symbols-outlined text-ember-glow text-[20px]">
            {toastMessage.icon}
          </span>
          <span className="font-body-sm text-body-sm">{toastMessage.message}</span>
        </div>
      )}

      {/* Customize Pizza Modal */}
      <CustomizePizzaModal
        pizza={customizeModalPizza}
        isOpen={!!customizeModalPizza}
        onClose={() => setCustomizeModalPizza(null)}
        onAdded={(name) => {
          showToast(`Custom ${name} added to your order`);
          openCart();
        }}
      />
    </div>
  );
}
