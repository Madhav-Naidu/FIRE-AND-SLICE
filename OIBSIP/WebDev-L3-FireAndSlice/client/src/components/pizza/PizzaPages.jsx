import { Link, useNavigate } from 'react-router-dom';
import { Pizza, ArrowRight, Flame, Sparkles, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Card, { CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import { pizzaApi } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { usePizzaStore } from '../../store/pizzaStore';
import { PizzaBuilder, OrderSummary } from './PizzaBuilder';

const HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAe-LRUsOp1MEDNrACirS4WC24UhF2UAdnrylX_djH8kVcrinhe2NjlW3FnQ6SQazCvkBDUJjNqY5oKMoxCMMNqyWZ2nBqx38cwH5mLWiSMtpUNlcG4aGvcNJCtGSophBGoOwJ6AH2UYIlwMOkcxrUPxVK2ZvfvBo-A6pAZiAtpRW9C4jWQtGTatbHAjg2PBPljjxstsNI4HLZQkVnTyKM4OLpCr0x6zFVOlTs8y-fwWNPP_Iyz5S3IcQ';

export function PizzaMenuPage() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const { resetPizza } = usePizzaStore();
  useEffect(() => {
    const fetchMenu = async () => {
      try { const data = await pizzaApi.getMenu(); setMenu(data); } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchMenu();
  }, []);
  const handleStartBuilding = () => { resetPizza(); navigate('/builder'); };
  if (loading) {
    return (
      <div className="min-h-[60vh] bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-container border-t-transparent mx-auto mb-3" />
          <p className="font-mono text-xs tracking-[0.2em] text-ash-muted">STOKING KILN \u00B7 450\u00B0C</p>
        </div>
      </div>
    );
  }
  if (!menu) {
    return (
      <div className="min-h-[60vh] bg-surface flex items-center justify-center p-4">
        <div className="text-center">
          <Pizza className="w-16 h-16 mx-auto text-ash-muted/40 mb-4" />
          <h2 className="font-display text-xl font-semibold text-crust-cream mb-2">Unable to load menu</h2>
          <p className="text-ash-muted text-sm mb-4">Kiln telemetry offline \u2014 retry</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-surface">
      <section className="relative w-full min-h-[88vh] flex items-center justify-center overflow-hidden bg-surface-charcoal">
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-lighten scale-105" style={{ backgroundImage: `url('${HERO_IMG}')` }} />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-surface via-surface/70 to-surface-charcoal/70" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-ember-glow/10 via-transparent to-transparent" />
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-elevated/90 shadow-xl mb-6 backdrop-blur-md border border-surface-border">
            <Flame className="w-4 h-4 text-ember-glow" />
            <span className="font-mono text-[11px] tracking-[0.18em] text-primary-fixed">WOOD FIRED // 450\u00B0C // 90 SEC</span>
            <span className="w-1.5 h-1.5 rounded-full bg-ember-glow" />
            <span className="font-mono text-[11px] tracking-widest text-ash-muted">72H FERMENTATION</span>
          </div>
          <h1 className="font-display font-bold text-[40px] sm:text-[56px] lg:text-[64px] leading-[1.02] tracking-tight text-crust-cream drop-shadow-2xl mb-4">
            Crafted by Fire.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-crust-cream via-primary-fixed to-ember-glow">Delivered to You.</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl mb-8 leading-relaxed">
            Hand-stretched dough. Slow-fermented crust. Fresh ingredients. Fired hot in hand-built stone kilns and delivered fresh straight to your doorstep.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Button onClick={handleStartBuilding} size="lg" className="w-full sm:w-auto px-8 py-4 text-base">Start Building <ArrowRight className="w-5 h-5 ml-2" /></Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 py-4 text-base" onClick={() => document.getElementById('options')?.scrollIntoView({behavior:'smooth'})}>View Ingredients</Button>
          </div>
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface border-y border-surface-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Pizza, title: '5 Crust Options', desc: 'Thin, Regular, Thick, Cheese Burst, Wheat' },
              { icon: Sparkles, title: '5 Signature Sauces', desc: 'Marinara, Pesto, BBQ, Alfredo, Spicy Red' },
              { icon: Star, title: '4 Cheese Types', desc: 'Mozzarella, Cheddar, Parmesan, Vegan' },
              { icon: Flame, title: 'Wood-Fired Soul', desc: '454\u00B0C hearth \u00B7 oak logs \u00B7 90s bake' },
            ].map(f => (
              <div key={f.title} className="rounded-2xl bg-surface-elevated border border-surface-border p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary-container/15 flex items-center justify-center mb-3"><f.icon className="w-6 h-6 text-ember-glow" /></div>
                <h3 className="font-semibold text-crust-cream mb-1">{f.title}</h3>
                <p className="text-sm text-ash-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="options" className="py-16 px-4 sm:px-6 lg:px-8 bg-surface-elevated">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-crust-cream mb-3">Fresh Ingredients</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Hand-picked quality ingredients for the perfect pizza experience \u2014 curated for the kiln</p>
          </div>
          <div className="space-y-12">
            {[
              { title: 'Bases', items: menu.bases || [], icon: '\uD83C\uDF55', color: 'primary' },
              { title: 'Sauces', items: menu.sauces || [], icon: '\uD83E\uDD6B', color: 'orange' },
              { title: 'Cheeses', items: menu.cheeses || [], icon: '\uD83E\uDDC0', color: 'yellow' },
              { title: 'Vegetables', items: menu.vegetables || [], icon: '\uD83E\uDD6C', color: 'green' },
            ].map((category) => (
              <div key={category.title}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="font-display text-2xl font-bold text-crust-cream">{category.title}</h3>
                  <div className="h-px flex-1 bg-surface-border" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {category.items.map((item) => (
                    <div key={item.name} className="text-center rounded-2xl bg-surface border border-surface-border p-5 hover:border-primary-container/30 hover:shadow-[0_12px_32px_-12px_rgba(244,98,48,0.25)] transition">
                      <span className="text-3xl mb-3 block">{category.icon}</span>
                      <h4 className="font-semibold text-crust-cream mb-1 text-sm">{item.name}</h4>
                      <p className="font-mono text-xs tracking-widest text-ember-glow">{formatPrice(item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface border-y border-surface-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-crust-cream mb-3">Ready to Build Your Pizza?</h2>
          <p className="text-on-surface-variant mb-8">72h biga \u00B7 450\u00B0C stone \u00B7 fired to order in 90 seconds</p>
          <Button onClick={handleStartBuilding} size="lg" className="px-10 py-4 text-base">Build My Pizza <ArrowRight className="w-5 h-5 ml-2" /></Button>
        </div>
      </section>
    </div>
  );
}
export function PizzaBuilderPage() {
  const navigate = useNavigate();
  const { isComplete } = usePizzaStore();
  const [showSummary, setShowSummary] = useState(false);
  const handleComplete = () => { if (isComplete()) setShowSummary(true); };
  const handleConfirmOrder = () => navigate('/checkout');
  const handleBackToBuilder = () => setShowSummary(false);
  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/menu" className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-ash-muted hover:text-crust-cream mb-4"><ArrowRight className="w-4 h-4 rotate-180" /> Back to Menu</Link>
          <h1 className="font-display text-3xl font-bold text-crust-cream">Build Your Pizza</h1>
          <p className="text-on-surface-variant mt-1">Configure base \u00B7 sauce \u00B7 cheese \u00B7 fire-finished toppings</p>
        </div>
        {showSummary ? (<OrderSummary onConfirm={handleConfirmOrder} onBack={handleBackToBuilder} />) : (<PizzaBuilder onComplete={handleComplete} />)}
      </div>
    </div>
  );
}
