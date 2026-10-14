import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CreditCard, Shield, CheckCircle, ArrowLeft, Truck, ChefHat, Package } from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { orderApi } from '../../services/api';
import { usePizzaStore } from '../../store/pizzaStore';
import { formatPrice, getStatusColor, getStatusIcon } from '../../utils/helpers';
import { RazorpayCheckout } from '../order/RazorpayCheckout';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { pizza, getPizzaDetails, resetPizza } = usePizzaStore();
  const [loading, setLoading] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [order, setOrder] = useState(null);

  const details = getPizzaDetails();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!details.base) {
      navigate('/builder');
      return;
    }
  }, [isAuthenticated, details.base, navigate]);

  if (!isAuthenticated || !details.base) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-ember-glow animate-spin" />
      </div>
    );
  }

  if (paymentComplete && order) {
    return (
      <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-crust-cream mb-2">Order Confirmed!</h1>
            <p className="text-on-surface-variant mb-8">Your pizza is being prepared with love</p>
            
            <Card className="text-left mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-on-surface-variant">Order Number</span>
                  <span className="font-mono font-semibold text-ember-glow">{order.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-on-surface-variant">Status</span>
                  <Badge variant={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)} {order.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Total Paid</span>
                  <span className="font-bold text-ember-glow text-lg">{formatPrice(order.totalPrice)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={() => navigate('/dashboard')} className="flex-1">
                Track Order
              </Button>
              <Button variant="secondary" onClick={() => { resetPizza(); navigate('/menu'); }} className="flex-1">
                Order Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/builder')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Builder
          </Button>
          <h1 className="text-3xl font-bold text-crust-cream">Checkout</h1>
          <p className="text-on-surface-variant mt-1">Complete your order securely</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-crust-cream mb-4">Your Pizza</h2>
                <div className="space-y-4">
                  {details.base && (
                    <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-xl">
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
                    <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-xl">
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
                    <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-xl">
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
                    <div className="p-3 bg-surface-elevated rounded-xl">
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
                      <div className="flex flex-wrap gap-1">
                        {details.vegetables.map(v => (
                          <Badge key={v.name} variant="gray" className="text-xs">
                            {v.name} (+{formatPrice(v.price)})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-crust-cream mb-4">Delivery Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
                    <p className="text-crust-cream">{user?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <p className="text-crust-cream">{user?.email || 'Not provided'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="label">Delivery Address</label>
                    <textarea 
                      className="input min-h-[80px] resize-none"
                      placeholder="Enter your delivery address"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Phone Number</label>
                    <input 
                      type="tel" 
                      className="input" 
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Section */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-crust-cream mb-4">Payment</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span className="font-medium text-crust-cream">{formatPrice(details.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Delivery Fee</span>
                    <span className="font-medium text-crust-cream">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Tax</span>
                    <span className="font-medium text-crust-cream">Included</span>
                  </div>
                  <div className="border-t border-surface-border pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-ember-glow">{formatPrice(details.total)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="p-3 bg-surface-elevated rounded-xl text-center">
                    <CreditCard className="w-5 h-5 mx-auto text-on-surface-variant mb-1" />
                    <p className="text-xs text-on-surface-variant">Cards</p>
                  </div>
                  <div className="p-3 bg-surface-elevated rounded-xl text-center">
                    <Shield className="w-5 h-5 mx-auto text-green-600 mb-1" />
                    <p className="text-xs text-on-surface-variant">Secure</p>
                  </div>
                  <div className="p-3 bg-surface-elevated rounded-xl text-center">
                    <Package className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                    <p className="text-xs text-on-surface-variant">UPI</p>
                  </div>
                </div>

                <RazorpayCheckout
                  amount={details.total}
                  orderData={{
                    pizza: details,
                    totalPrice: details.total,
                    customerName: user?.name,
                    customerEmail: user?.email,
                  }}
                  onSuccess={(newOrder) => {
                    setOrder(newOrder);
                    setPaymentComplete(true);
                  }}
                  onClose={() => {}}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}