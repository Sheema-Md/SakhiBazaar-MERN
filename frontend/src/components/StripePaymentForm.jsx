import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';
import { Loader2 } from 'lucide-react';

const StripePaymentForm = ({ clientSecret, orderId, onPaymentSuccess, onPaymentError, totalAmount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet.
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm card payment with Stripe using clientSecret
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        setErrorMessage(error.message);
        onPaymentError(error.message);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Notify our backend to confirm and record the transaction in MDB
        const response = await api.post('/payments/confirm', {
          orderId,
          paymentIntentId: paymentIntent.id,
        });

        onPaymentSuccess(response.data);
      } else {
        setErrorMessage(`Payment status: ${paymentIntent.status}`);
        onPaymentError(`Payment status: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error('Payment Confirmation Error:', err);
      const msg = err.response?.data?.message || err.message || 'Payment confirmation failed.';
      setErrorMessage(msg);
      onPaymentError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '15px',
        color: '#1e293b',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#94a3b8',
        },
      },
      invalid: {
        color: '#ef4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 focus-within:ring-2 focus-within:ring-rose-500 focus-within:bg-white focus-within:border-rose-300 transition-all duration-200">
        <CardElement options={cardElementOptions} />
      </div>
      
      {errorMessage && (
        <div className="text-xs text-red-500 font-semibold px-1">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-200/80 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Processing Secure Payment...
          </>
        ) : (
          `Pay ₹${totalAmount ? totalAmount.toLocaleString('en-IN') : ''}`
        )}
      </button>
    </form>
  );
};

export default StripePaymentForm;
