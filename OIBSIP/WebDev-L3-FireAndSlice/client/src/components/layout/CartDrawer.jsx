import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';

export function CartDrawer() {
  const navigate = useNavigate();
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    voucher,
    discount,
    packagingFee,
    applyVoucher,
    getSubtotal,
    getTotal,
    getTotalCount,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [voucherMsg, setVoucherMsg] = useState(null);

  const subtotal = getSubtotal();
  const total = getTotal();
  const totalCount = getTotalCount();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyVoucher(couponInput);
    setVoucherMsg(res);
    setTimeout(() => setVoucherMsg(null), 4000);
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  // Delivery progress towards free delivery (threshold ₹600)
  const freeDeliveryThreshold = 600;
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const remainingForFree = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[75] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Slide-out Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface-charcoal/95 backdrop-blur-2xl z-[80] shadow-[-16px_0_50px_rgba(0,0,0,0.8)] border-l border-surface-border transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        id="cart-drawer"
      >
        {/* Header */}
        <div className="p-space-lg flex items-center justify-between bg-surface-container-lowest border-b border-surface-border">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary-container text-[24px]">local_mall</span>
            <h3 className="font-headline-sm text-headline-sm text-crust-cream">Your Kiln Order</h3>
            <span
              className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-label-technical text-label-sm font-bold"
              id="cart-counter-badge"
            >
              {totalCount}
            </span>
          </div>
          <button
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-crust-cream hover:bg-surface-container-high transition-colors"
            onClick={closeCart}
            aria-label="Close cart"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Free Delivery Tier Bar */}
        <div className="px-space-lg py-space-sm bg-surface-container-low flex flex-col gap-1.5 border-b border-surface-border">
          <div className="flex justify-between items-center font-label-technical text-label-sm">
            <span className="text-crust-cream flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-ember-glow">moped</span>
              <span>
                {remainingForFree > 0
                  ? `Add ₹${remainingForFree} for FREE DELIVERY`
                  : '🎉 FREE DELIVERY UNLOCKED'}
              </span>
            </span>
            <span className="text-ember-glow font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-container via-ember-glow to-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-grow overflow-y-auto p-space-lg flex flex-col gap-space-md" id="cart-items-container">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px] text-ash-muted">local_pizza</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-crust-cream mb-2">Your kiln is empty</h4>
              <p className="font-body-sm text-ash-muted max-w-xs mb-6">
                Explore our signature wood-fired pizzas or craft your own sourdough creation.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/menu');
                }}
                className="px-space-lg py-space-xs rounded-lg bg-primary-container hover:bg-ember-glow text-on-primary font-title-md text-body-sm uppercase tracking-wider transition-colors"
              >
                Explore Menu
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-space-md rounded-xl bg-surface-elevated border border-surface-border flex flex-col gap-space-xs relative group shadow-sm hover:border-surface-border/80 transition-all"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-title-md text-body-lg text-crust-cream font-bold leading-tight">
                      {item.name}
                    </h4>
                    <span className="font-label-technical text-label-sm text-ash-muted block mt-0.5">
                      {item.size} {item.crust ? `· ${item.crust}` : ''}
                    </span>
                    {item.additions && item.additions.length > 0 && (
                      <span className="font-label-technical text-label-sm text-ember-glow block">
                        + {item.additions.join(', ')}
                      </span>
                    )}
                  </div>
                  <span className="font-label-technical text-body-md text-primary-container font-bold shrink-0">
                    ₹{(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-space-xs border-t border-surface-border/40 mt-1">
                  <div className="flex items-center gap-space-xs bg-surface-container-low px-2 py-1 rounded-md">
                    <button
                      className="text-ash-muted hover:text-crust-cream font-bold px-1.5 text-sm transition-colors"
                      onClick={() => updateQuantity(item.id, -1)}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="font-label-technical text-label-sm text-crust-cream font-bold px-1">
                      {item.quantity}
                    </span>
                    <button
                      className="text-ash-muted hover:text-crust-cream font-bold px-1.5 text-sm transition-colors"
                      onClick={() => updateQuantity(item.id, 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="text-ash-muted hover:text-rose-400 transition-colors text-label-sm font-label-technical flex items-center gap-1"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove item"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Promo Code + Checkout Footer */}
        {items.length > 0 && (
          <div className="p-space-lg bg-surface-container-lowest border-t border-surface-border flex flex-col gap-space-md">
            {/* Promo Code Field */}
            <form onSubmit={handleApplyCoupon} className="flex items-center bg-surface-container-low rounded-lg p-1 border border-surface-border">
              <input
                className="w-full bg-transparent px-space-sm font-label-technical text-label-sm text-crust-cream uppercase placeholder:text-ash-muted focus:outline-none"
                id="cart-coupon-input"
                placeholder="Promo code (e.g. FIRST20)"
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-space-md py-space-xs rounded bg-surface-container-high hover:bg-primary-container text-crust-cream hover:text-on-primary font-label-technical text-label-technical uppercase transition-colors shrink-0"
              >
                APPLY
              </button>
            </form>

            {voucherMsg && (
              <p
                className={`font-label-technical text-label-sm ${
                  voucherMsg.success ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {voucherMsg.message}
              </p>
            )}

            {/* Financial Calculations */}
            <div className="flex flex-col gap-1 text-body-sm font-label-technical text-ash-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-crust-cream" id="cart-subtotal-val">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-ember-glow">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">local_offer</span>
                    <span>Voucher ({voucher})</span>
                  </span>
                  <span id="cart-discount-val">-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Kiln Packaging & Taxes</span>
                <span className="text-crust-cream">₹{packagingFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-bold text-title-md text-crust-cream pt-2 border-t border-surface-border">
                <span>Total Payable</span>
                <span className="text-primary-container text-headline-sm" id="cart-total-val">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              className="w-full py-space-md bg-primary-container hover:bg-ember-glow text-on-primary font-title-md text-body-md uppercase tracking-wider rounded-lg shadow-xl transition-all flex items-center justify-center gap-space-xs transform hover:-translate-y-0.5"
              onClick={handleCheckout}
            >
              <span>PROCEED TO CHECKOUT</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
