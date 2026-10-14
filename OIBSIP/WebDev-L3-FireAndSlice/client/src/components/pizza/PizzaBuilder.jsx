import { useState } from 'react';
import { ChevronRight, Check, X, Plus, Minus } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { usePizzaStore } from '../../store/pizzaStore';
import { formatPrice } from '../../utils/helpers';

const STEPS = [
  { id: 1, label: 'Base', icon: '🍕' },
  { id: 2, label: 'Sauce', icon: '🥫' },
  { id: 3, label: 'Cheese', icon: '🧀' },
  { id: 4, label: 'Veggies', icon: '🥬' },
];

export function PizzaBuilder({ onComplete }) {
  const { 
    pizza, 
    step, 
    setBase, 
    setSauce, 
    setCheese, 
    toggleVegetable, 
    setStep, 
    nextStep, 
    prevStep, 
    getTotalPrice,
    isComplete,
    canProceed,
  } = usePizzaStore();

  const [showSummary, setShowSummary] = useState(false);

  const bases = [
    { name: 'Thin Crust', price: 50, desc: 'Crispy & light' },
    { name: 'Regular Crust', price: 60, desc: 'Classic hand-tossed' },
    { name: 'Thick Crust', price: 70, desc: 'Deep pan style' },
    { name: 'Cheese Burst', price: 100, desc: 'Stuffed with molten cheese' },
    { name: 'Wheat Crust', price: 80, desc: 'Healthy whole wheat' },
  ];

  const sauces = [
    { name: 'Marinara', price: 20, desc: 'Classic tomato base' },
    { name: 'Pesto', price: 30, desc: 'Fresh basil & pine nuts' },
    { name: 'BBQ', price: 25, desc: 'Smoky & tangy' },
    { name: 'Alfredo', price: 35, desc: 'Creamy white sauce' },
    { name: 'Spicy Red', price: 25, desc: 'Fiery chili blend' },
  ];

  const cheeses = [
    { name: 'Mozzarella', price: 40, desc: 'Classic stretchy cheese' },
    { name: 'Cheddar', price: 45, desc: 'Sharp & flavorful' },
    { name: 'Parmesan', price: 50, desc: 'Aged & nutty' },
    { name: 'Vegan Cheese', price: 60, desc: 'Plant-based alternative' },
  ];

  const vegetables = [
    { name: 'Onions', price: 10 },
    { name: 'Tomatoes', price: 10 },
    { name: 'Bell Peppers', price: 15 },
    { name: 'Mushrooms', price: 20 },
    { name: 'Olives', price: 15 },
    { name: 'Jalapeños', price: 15 },
    { name: 'Corn', price: 10 },
    { name: 'Spinach', price: 15 },
  ];

  const getCurrentOptions = () => {
    switch (step) {
      case 1: return bases;
      case 2: return sauces;
      case 3: return cheeses;
      case 4: return vegetables;
      default: return [];
    }
  };

  const getSelectedValue = () => {
    switch (step) {
      case 1: return pizza.base;
      case 2: return pizza.sauce;
      case 3: return pizza.cheese;
      case 4: return pizza.vegetables;
      default: return null;
    }
  };

  const handleSelect = (name) => {
    switch (step) {
      case 1: setBase(name); break;
      case 2: setSauce(name); break;
      case 3: setCheese(name); break;
      case 4: toggleVegetable(name); break;
    }
  };

  const isSelected = (name) => {
    const selected = getSelectedValue();
    if (step === 4) return selected.includes(name);
    return selected === name;
  };

  const handleNext = () => {
    if (step === 4) {
      if (isComplete()) {
        setShowSummary(true);
      }
    } else {
      nextStep();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Stepper */}
      <div className="stepper mb-8">
        {STEPS.map((s, i) => (
          <div 
            key={s.id} 
            className={`stepper-step ${i === STEPS.length - 1 ? '' : 'flex-1'}`}
          >
            <div 
              className={`stepper-circle ${
                s.id < step ? 'completed' : s.id === step ? 'active' : 'pending'
              }`}
            >
              {s.id < step ? <Check className="w-4 h-4" /> : s.icon}
            </div>
            <span className={`stepper-label ${s.id < step ? 'completed' : s.id === step ? 'active' : 'pending'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Options Grid */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {getCurrentOptions().map((option) => (
            <button
              key={option.name}
              onClick={() => handleSelect(option.name)}
              className={`relative group p-4 rounded-2xl border-2 transition-all duration-200 ${
                isSelected(option.name)
                  ? 'border-primary-container bg-primary-container/15 shadow-[0_8px_24px_rgba(244,98,48,0.15)]'
                  : 'border-surface-border hover:border-primary-300 hover:bg-surface-elevated'
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{step === 1 ? '🍕' : step === 2 ? '🥫' : step === 3 ? '🧀' : '🥬'}</div>
                <h4 className="font-semibold text-crust-cream">{option.name}</h4>
                <p className="text-xs text-ash-muted mt-1">{option.desc || ''}</p>
                <p className="text-sm font-medium text-ember-glow mt-1">
                  +{formatPrice(option.price)}
                </p>
              </div>
              {isSelected(option.name) && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-container text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          ))}
        </div>

        {step === 4 && (
          <div className="mt-6 p-4 bg-surface-elevated rounded-xl">
            <p className="text-sm text-on-surface-variant text-center">
              Select multiple vegetables. Each adds to the total price.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {pizza.vegetables.map(v => (
                <span key={v} className="badge-primary flex items-center gap-1">
                  {v}
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleVegetable(v); }}
                    className="hover:text-ember-glow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price Summary */}
      <div className="mt-6 p-4 bg-surface-elevated rounded-xl border border-surface-border">
        <div className="flex justify-between items-center">
          <span className="text-on-surface-variant">Current Total</span>
          <span className="text-2xl font-bold text-ember-glow">{formatPrice(getTotalPrice())}</span>
        </div>
        <div className="mt-2 h-2 bg-surface-container rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-container transition-all duration-300"
            style={{ width: `${Math.min((step / 4) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step > 1 && (
          <Button variant="secondary" onClick={prevStep} className="flex-1">
            <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
            Back
          </Button>
        )}
        <Button 
          onClick={handleNext} 
          className="flex-1"
          disabled={!canProceed()}
        >
          {step === 4 ? 'View Summary' : 'Next'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

export function OrderSummary({ onConfirm, onBack }) {
  const { pizza, getPizzaDetails, resetPizza } = usePizzaStore();
  const details = getPizzaDetails();

  if (!details.base) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-crust-cream">Order Summary</h2>
        <Button variant="ghost" onClick={onBack}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-4">
        {details.base && (
          <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍕</span>
              <div>
                <p className="font-medium text-crust-cream">{details.base.name}</p>
                <p className="text-sm text-ash-muted">Base</p>
              </div>
            </div>
            <span className="font-semibold text-ember-glow">{formatPrice(details.base.price)}</span>
          </div>
        )}
        {details.sauce && (
          <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🥫</span>
              <div>
                <p className="font-medium text-crust-cream">{details.sauce.name}</p>
                <p className="text-sm text-ash-muted">Sauce</p>
              </div>
            </div>
            <span className="font-semibold text-ember-glow">{formatPrice(details.sauce.price)}</span>
          </div>
        )}
        {details.cheese && (
          <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧀</span>
              <div>
                <p className="font-medium text-crust-cream">{details.cheese.name}</p>
                <p className="text-sm text-ash-muted">Cheese</p>
              </div>
            </div>
            <span className="font-semibold text-ember-glow">{formatPrice(details.cheese.price)}</span>
          </div>
        )}
        {details.vegetables.length > 0 && (
          <div className="p-4 bg-surface-elevated rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🥬</span>
                <div>
                  <p className="font-medium text-crust-cream">Vegetables</p>
                  <p className="text-sm text-ash-muted">{details.vegetables.length} selected</p>
                </div>
              </div>
              <span className="font-semibold text-ember-glow">
                {formatPrice(details.vegetables.reduce((sum, v) => sum + v.price, 0))}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {details.vegetables.map(v => (
                <Badge key={v.name} variant="gray">
                  {v.name} <span className="ml-1 text-ember-glow">+{formatPrice(v.price)}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-surface-border pt-4">
        <div className="flex justify-between text-lg font-bold text-crust-cream">
          <span>Total</span>
          <span className="text-ember-glow">{formatPrice(details.total)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          Back to Builder
        </Button>
        <Button onClick={onConfirm} className="flex-1" size="lg">
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}