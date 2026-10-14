import { useEffect, useRef } from 'react';
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import { useToast } from '../../context/ToastContext';
import { orderApi } from '../../services/api';
import { formatPrice } from '../../utils/helpers';

export function RazorpayCheckout({ amount, orderData, onSuccess, onClose }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const razorpayRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!window.Razorpay) {
      toast.error('Payment gateway not loaded. Please refresh and try again.');
      return;
    }

    setLoading(true);
    try {
      // Create Razorpay order
      const razorpayOrder = await orderApi.createRazorpayOrder(amount);
      
      const options = {
        key: razorpayOrder.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'FIRE & SLICE',
        description: 'Custom Pizza Order',
        order_id: razorpayOrder.orderId,
        handler: async (response) => {
          // Verify payment on backend
          await verifyPayment(response, orderData);
        },
        prefill: {
          name: orderData.customerName || '',
          email: orderData.customerEmail || '',
        },
        notes: {
          order_type: 'pizza_delivery',
        },
        theme: {
          color: '#ea580c',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setLoading(false);
        toast.error(response.error.description || 'Payment failed');
      });
      rzp.open();
    } catch (error) {
      setLoading(false);
      toast.error(error.message || 'Failed to initialize payment');
    }
  };

  const verifyPayment = async (response, orderData) => {
    try {
      const result = await orderApi.verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        pizza: orderData.pizza,
        totalPrice: orderData.totalPrice,
      });
      
      setPaymentId(response.razorpay_payment_id);
      toast.success('Order placed successfully!');
      onSuccess(result.order);
    } catch (error) {
      toast.error(error.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (paymentId) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-crust-cream mb-2">Payment Successful!</h2>
        <p className="text-on-surface-variant mb-6">Your order has been confirmed. Payment ID: <strong>{paymentId}</strong></p>
        <Button onClick={onClose} size="lg">Continue</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-primary-container/15 rounded-xl border border-primary-100">
        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-ember-glow" />
        </div>
        <div>
          <h3 className="font-semibold text-crust-cream">Secure Payment</h3>
          <p className="text-sm text-ash-muted">Powered by Razorpay</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Order Amount</span>
          <span className="font-medium text-crust-cream">{formatPrice(amount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Taxes & Fees</span>
          <span className="font-medium text-crust-cream">Included</span>
        </div>
        <div className="border-t border-surface-border pt-3 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-ember-glow">{formatPrice(amount)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-surface-elevated rounded-xl">
          <Shield className="w-5 h-5 mx-auto text-green-600 mb-1" />
          <p className="text-xs text-on-surface-variant">100% Secure</p>
        </div>
        <div className="p-3 bg-surface-elevated rounded-xl">
          <CheckCircle className="w-5 h-5 mx-auto text-blue-600 mb-1" />
          <p className="text-xs text-on-surface-variant">Instant Refund</p>
        </div>
        <div className="p-3 bg-surface-elevated rounded-xl">
          <Loader2 className="w-5 h-5 mx-auto text-purple-600 mb-1" />
          <p className="text-xs text-on-surface-variant">UPI & Cards</p>
        </div>
      </div>

      <Button 
        onClick={handlePayment} 
        loading={loading}
        fullWidth
        size="lg"
        className="mt-2"
      >
        Pay {formatPrice(amount)}
      </Button>

      <Button variant="ghost" fullWidth onClick={onClose}>
        Cancel Order
      </Button>
    </div>
  );
}

import { useState } from 'react';