import { useState } from 'react';
import { useCartStore } from '../../store/cartStore';

export function CustomizePizzaModal({ pizza, isOpen, onClose, onAdded }) {
  if (!isOpen || !pizza) return null;

  const { addItem } = useCartStore();

  const [crust, setCrust] = useState('72h Neapolitan Biga');
  const [crustPrice, setCrustPrice] = useState(0);

  const [addons, setAddons] = useState({
    truffle: false,
    burrata: false,
    hotHoney: false,
  });

  const basePrice = pizza.price || 299;

  const addonPrices = {
    truffle: 60,
    burrata: 120,
    hotHoney: 45,
  };

  const calculatedTotal =
    basePrice +
    crustPrice +
    (addons.truffle ? addonPrices.truffle : 0) +
    (addons.burrata ? addonPrices.burrata : 0) +
    (addons.hotHoney ? addonPrices.hotHoney : 0);

  const handleCrustChange = (name, price) => {
    setCrust(name);
    setCrustPrice(price);
  };

  const toggleAddon = (key) => {
    setAddons((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirm = () => {
    const selectedAddons = [];
    if (addons.truffle) selectedAddons.push('White Truffle Oil');
    if (addons.burrata) selectedAddons.push('Center Burrata Ball');
    if (addons.hotHoney) selectedAddons.push('Calabrian Hot Honey');

    addItem({
      name: pizza.name,
      size: pizza.size || 'Personal (8")',
      price: calculatedTotal,
      quantity: 1,
      crust,
      additions: selectedAddons,
    });

    if (onAdded) onAdded(pizza.name, calculatedTotal);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-space-md animate-fade-in"
      id="customize-modal"
    >
      <div className="bg-surface-elevated max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-surface-border">
        {/* Modal Header */}
        <div className="p-space-lg bg-surface-container-lowest flex items-center justify-between border-b border-surface-border">
          <div>
            <span className="font-label-technical text-label-sm text-ember-glow block uppercase">
              Wood-Fired Alchemy
            </span>
            <h3 className="font-headline-sm text-headline-sm text-crust-cream" id="custom-pizza-title">
              {pizza.name}
            </h3>
          </div>
          <button
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-crust-cream hover:bg-surface-container-high transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-space-lg overflow-y-auto flex flex-col gap-space-lg">
          {/* Crust type */}
          <div>
            <label className="font-label-technical text-label-technical text-ash-muted block uppercase mb-space-xs">
              1. Sourdough Crust Style
            </label>
            <div className="grid grid-cols-2 gap-space-xs">
              <label
                onClick={() => handleCrustChange('72h Neapolitan Biga', 0)}
                className={`p-space-sm rounded-lg border flex items-center gap-space-xs cursor-pointer transition-all ${
                  crust === '72h Neapolitan Biga'
                    ? 'bg-surface-container border-primary-container text-crust-cream'
                    : 'bg-surface-container-low border-surface-border text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <input
                  type="radio"
                  name="crust"
                  checked={crust === '72h Neapolitan Biga'}
                  onChange={() => {}}
                  className="accent-ember-glow"
                />
                <span className="font-body-sm text-crust-cream">72h Neapolitan Biga</span>
              </label>

              <label
                onClick={() => handleCrustChange('Ancient Grain Spelt', 40)}
                className={`p-space-sm rounded-lg border flex items-center gap-space-xs cursor-pointer transition-all ${
                  crust === 'Ancient Grain Spelt'
                    ? 'bg-surface-container border-primary-container text-crust-cream'
                    : 'bg-surface-container-low border-surface-border text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <input
                  type="radio"
                  name="crust"
                  checked={crust === 'Ancient Grain Spelt'}
                  onChange={() => {}}
                  className="accent-ember-glow"
                />
                <span className="font-body-sm text-crust-cream">Ancient Grain Spelt (+₹40)</span>
              </label>
            </div>
          </div>

          {/* Elevated Additions */}
          <div>
            <label className="font-label-technical text-label-technical text-ash-muted block uppercase mb-space-xs">
              2. Elevated Additions
            </label>
            <div className="flex flex-col gap-space-xs">
              <label
                onClick={() => toggleAddon('truffle')}
                className={`p-space-sm rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                  addons.truffle
                    ? 'bg-surface-container border-primary-container'
                    : 'bg-surface-container-low border-surface-border hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-space-xs">
                  <input
                    type="checkbox"
                    checked={addons.truffle}
                    onChange={() => {}}
                    className="accent-ember-glow"
                  />
                  <span className="font-body-sm text-crust-cream">White Truffle Oil Finish</span>
                </div>
                <span className="font-label-technical text-label-sm text-primary">+₹60</span>
              </label>

              <label
                onClick={() => toggleAddon('burrata')}
                className={`p-space-sm rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                  addons.burrata
                    ? 'bg-surface-container border-primary-container'
                    : 'bg-surface-container-low border-surface-border hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-space-xs">
                  <input
                    type="checkbox"
                    checked={addons.burrata}
                    onChange={() => {}}
                    className="accent-ember-glow"
                  />
                  <span className="font-body-sm text-crust-cream">Fresh Center Burrata Ball</span>
                </div>
                <span className="font-label-technical text-label-sm text-primary">+₹120</span>
              </label>

              <label
                onClick={() => toggleAddon('hotHoney')}
                className={`p-space-sm rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                  addons.hotHoney
                    ? 'bg-surface-container border-primary-container'
                    : 'bg-surface-container-low border-surface-border hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-space-xs">
                  <input
                    type="checkbox"
                    checked={addons.hotHoney}
                    onChange={() => {}}
                    className="accent-ember-glow"
                  />
                  <span className="font-body-sm text-crust-cream">Calabrian Hot Honey Drizzle</span>
                </div>
                <span className="font-label-technical text-label-sm text-primary">+₹45</span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-space-lg bg-surface-container-lowest border-t border-surface-border flex items-center justify-between">
          <div>
            <span className="font-label-technical text-label-sm text-ash-muted block">Configured Total</span>
            <span className="font-label-technical text-headline-sm text-primary-container font-bold" id="custom-modal-price">
              ₹{calculatedTotal}
            </span>
          </div>
          <button
            className="px-space-xl py-space-sm bg-primary-container hover:bg-ember-glow text-on-primary font-title-md text-body-sm uppercase rounded-lg shadow-md transition-all cursor-pointer"
            onClick={handleConfirm}
          >
            ADD CUSTOM PIE
          </button>
        </div>
      </div>
    </div>
  );
}
