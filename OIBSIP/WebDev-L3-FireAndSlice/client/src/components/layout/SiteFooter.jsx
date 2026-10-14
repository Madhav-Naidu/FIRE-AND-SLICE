import { Link } from 'react-router-dom';

const BRAND_LOGO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ9IwS-nK5f2m2ylvVjSAYglrE2tmQ6JmHmlza0vhgtaAmfXmCWQH6nNLpnR7bHYn5X7My5lTG7xCt_CuMJyOBvLvOnDHL-wZtjdym1qcGPYJEJ2zLJv-JUc69UAykin9Rc9nng__gPxf_X1VXA7WrdYZgIGm624ITlzyAd10DMi-i_VvSP31bsvKGedOoWe6VHpENQvdXlG7PXy07N-KMuZYx1bIrOEPsKYf-y0ibEeCmj1-yPo218g';

export function SiteFooter() {
  return (
    <footer className="border-t border-surface-border bg-surface-charcoal/95 pt-space-2xl pb-space-xl">
      <div className="max-w-[1440px] mx-auto px-grid-margin-mobile lg:px-grid-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-xl mb-space-2xl">
          {/* Brand info */}
          <div className="flex flex-col gap-space-sm md:col-span-1">
            <div className="flex items-center gap-space-sm">
              <img src={BRAND_LOGO} alt="FIRE & SLICE" className="h-8 w-auto object-contain" />
              <div className="flex flex-col">
                <span className="font-headline-sm text-title-md text-crust-cream">FIRE & SLICE</span>
                <span className="font-label-sm text-label-sm uppercase text-ash-muted">450°C Wood-Fired Craft</span>
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs leading-relaxed">
              Hand-stretched dough. Slow-fermented crust. Fresh ingredients. Fired hot in hand-built stone kilns and delivered straight to your door.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-space-xs">
            <h4 className="font-label-technical text-label-technical uppercase tracking-wider text-crust-cream mb-2">
              Hearth Links
            </h4>
            <Link to="/" className="font-body-sm text-on-surface-variant hover:text-primary transition-colors">
              Cinematic Storefront
            </Link>
            <Link to="/menu" className="font-body-sm text-on-surface-variant hover:text-primary transition-colors">
              Kiln Menu & Pies
            </Link>
            <Link to="/builder" className="font-body-sm text-on-surface-variant hover:text-primary transition-colors">
              Bespoke Crust Atelier
            </Link>
            <Link to="/track" className="font-body-sm text-on-surface-variant hover:text-primary transition-colors">
              Live Kiln Telemetry
            </Link>
          </div>

          {/* Kiln Specifications */}
          <div className="flex flex-col gap-space-xs">
            <h4 className="font-label-technical text-label-technical uppercase tracking-wider text-crust-cream mb-2">
              Kiln Telemetry
            </h4>
            <span className="font-body-sm text-on-surface-variant">Core Temp: 450°C - 454°C</span>
            <span className="font-body-sm text-on-surface-variant">Oven Floor: Volcanic Biscotto</span>
            <span className="font-body-sm text-on-surface-variant">Wood Variety: Seasoned White Oak</span>
            <span className="font-body-sm text-on-surface-variant">Fermentation: 72H Natural Biga</span>
          </div>

          {/* Admin & Operations */}
          <div className="flex flex-col gap-space-xs">
            <h4 className="font-label-technical text-label-technical uppercase tracking-wider text-crust-cream mb-2">
              Operations Hub
            </h4>
            <Link to="/admin" className="font-body-sm text-primary hover:text-ember-glow transition-colors font-medium">
              Kitchen Operations KDS
            </Link>
            <Link to="/admin/login" className="font-body-sm text-on-surface-variant hover:text-crust-cream transition-colors">
              Admin Authentication
            </Link>
            <span className="font-body-sm text-ash-muted mt-2">Station: Napoli Hearth #01</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-space-lg border-t border-surface-border flex flex-col md:flex-row items-center justify-between gap-space-md text-center md:text-left">
          <div className="font-label-technical text-label-sm tracking-widest text-ash-muted uppercase">
            © 2026 FIRE & SLICE · NAPOLI HEARTH #01 · ALL RIGHTS RESERVED
          </div>
          <div className="flex items-center gap-space-xs font-label-technical text-label-sm text-ash-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-ember-glow font-bold">HEARTH CORE: 454°C</span>
            <span>· 100% FLAME EFFICIENCY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
