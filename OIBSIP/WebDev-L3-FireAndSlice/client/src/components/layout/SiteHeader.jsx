import { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCartStore } from '../../store/cartStore';

const BRAND_LOGO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ9IwS-nK5f2m2ylvVjSAYglrE2tmQ6JmHmlza0vhgtaAmfXmCWQH6nNLpnR7bHYn5X7My5lTG7xCt_CuMJyOBvLvOnDHL-wZtjdym1qcGPYJEJ2zLJv-JUc69UAykin9Rc9nng__gPxf_X1VXA7WrdYZgIGm624ITlzyAd10DMi-i_VvSP31bsvKGedOoWe6VHpENQvdXlG7PXy07N-KMuZYx1bIrOEPsKYf-y0ibEeCmj1-yPo218g';

export function SiteHeader() {
  const { isAuthenticated, user, logout } = useAuth();
  const { toggleCart, getTotal, getTotalCount } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartTotal = getTotal();
  const cartCount = getTotalCount();

  const handleLogout = () => {
    logout();
    navigate('/menu');
  };

  const navItemClass = ({ isActive }) =>
    `px-space-sm py-space-xs font-title-md text-body-sm tracking-wide transition-colors rounded-lg ${
      isActive
        ? 'bg-surface-container-high text-primary font-bold shadow-sm'
        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
    }`;

  const scrollToOffers = (e) => {
    e.preventDefault();
    if (location.pathname !== '/' && location.pathname !== '/menu') {
      navigate('/menu#offers');
      setTimeout(() => {
        const el = document.getElementById('offers-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else {
      const el = document.getElementById('offers-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-charcoal/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-surface-border">
      <div className="h-20 w-full px-grid-margin-mobile lg:px-grid-margin-desktop flex items-center justify-between gap-space-md">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-space-lg">
          <Link to="/" className="flex items-center gap-space-sm group">
            <img
              alt="FIRE & SLICE Brand Emblem"
              className="h-9 w-auto object-contain transform group-hover:scale-105 transition-transform"
              src={BRAND_LOGO}
            />
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-crust-cream tracking-tight group-hover:text-primary-container transition-colors">
                FIRE & SLICE
              </span>
              <span className="font-label-sm text-label-sm uppercase text-ash-muted tracking-widest hidden sm:inline-block">
                450°C Wood-Fired Craft
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-space-xs">
            <NavLink to="/" className={navItemClass} end>
              Home
            </NavLink>
            <NavLink to="/menu" className={navItemClass}>
              Menu
            </NavLink>
            <NavLink to="/builder" className={navItemClass}>
              Build Your Pizza
            </NavLink>
            <a
              href="#offers"
              onClick={scrollToOffers}
              className="px-space-sm py-space-xs font-title-md text-body-sm tracking-wide text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors rounded-lg"
            >
              Offers
            </a>
            <NavLink to="/track" className={navItemClass}>
              Track Order
            </NavLink>
            <NavLink to="/admin" className={navItemClass}>
              Admin Portal
            </NavLink>
          </nav>
        </div>

        {/* Right Section: Telemetry, Search, Cart & Profile */}
        <div className="flex items-center gap-space-sm lg:gap-space-md">
          {/* Downtown Flagship telemetry chip */}
          <div className="hidden md:flex items-center gap-space-2xs px-space-sm py-space-xs rounded-full bg-surface-container-low text-ash-muted border border-surface-border/50">
            <span className="material-symbols-outlined text-[18px] text-ember-glow">local_fire_department</span>
            <span className="font-label-technical text-label-technical tracking-wider text-crust-cream">
              Downtown Flagship
            </span>
            <span className="font-label-sm text-label-sm text-ash-muted">· 25-35m</span>
          </div>

          {/* Quick Search Button */}
          <button
            aria-label="Search Menu"
            onClick={() => {
              const el = document.getElementById('menu-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else navigate('/menu#menu-section');
            }}
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-crust-cream hover:bg-surface-container transition-colors border border-surface-border/50"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          {/* Cart Button */}
          <button
            aria-label="View Cart"
            onClick={toggleCart}
            className="relative flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-elevated hover:bg-surface-container-high border border-surface-border transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px] text-primary-container">shopping_bag</span>
            <span className="font-label-technical text-label-technical text-crust-cream hidden sm:inline-block">
              ₹{cartTotal.toFixed(2)}
            </span>
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary-container text-on-primary font-label-technical text-label-sm flex items-center justify-center font-bold shadow-md">
              {cartCount}
            </span>
          </button>

          {/* Profile / Authentication */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container border border-surface-border transition-colors text-crust-cream font-title-md text-body-sm"
              >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-[16px]">person</span>
                </div>
                <span className="hidden sm:inline-block max-w-[100px] truncate">{user?.name || 'Account'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-ash-muted hover:text-rose-400 transition-colors"
                title="Logout"
                aria-label="Logout"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-space-md py-space-xs rounded-lg bg-primary-container hover:bg-ember-glow text-on-primary font-title-md text-body-sm uppercase font-bold tracking-wider transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span className="hidden sm:inline-block">Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-crust-cream"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-surface-charcoal border-t border-surface-border px-4 py-4 flex flex-col gap-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2.5 rounded-lg text-crust-cream hover:bg-surface-container font-title-md text-body-sm"
          >
            Home
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2.5 rounded-lg text-crust-cream hover:bg-surface-container font-title-md text-body-sm"
          >
            Menu
          </Link>
          <Link
            to="/builder"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2.5 rounded-lg text-crust-cream hover:bg-surface-container font-title-md text-body-sm"
          >
            Build Your Pizza
          </Link>
          <a
            href="#offers"
            onClick={(e) => {
              setMobileMenuOpen(false);
              scrollToOffers(e);
            }}
            className="px-4 py-2.5 rounded-lg text-crust-cream hover:bg-surface-container font-title-md text-body-sm"
          >
            Offers
          </a>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2.5 rounded-lg text-crust-cream hover:bg-surface-container font-title-md text-body-sm"
          >
            Track Order
          </Link>
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2.5 rounded-lg text-crust-cream hover:bg-surface-container font-title-md text-body-sm"
          >
            Admin Portal
          </Link>
        </div>
      )}
    </header>
  );
}
