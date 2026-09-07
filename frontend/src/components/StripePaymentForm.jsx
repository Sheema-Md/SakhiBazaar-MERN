import { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import api from '../services/api';
import { Loader2, CheckCircle2 } from 'lucide-react';

const StripePaymentForm = ({
  clientSecret,
  orderId,
  onPaymentSuccess,
  onPaymentError,
  totalAmount,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();


    if (isProcessing) {
      return;
    }

    if (!stripe || !elements) {
      setErrorMessage(
        'Stripe is still loading. Please wait a moment and try again.'
      );
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      const message = 'Card details are not available.';
      setErrorMessage(message);
      onPaymentError?.(message);
      return;
    }

    if (!clientSecret) {
      const message =
        'Stripe payment could not be initialized. Please try again.';
      setErrorMessage(message);
      onPaymentError?.(message);
      return;
    }

    if (!orderId) {
      const message =
        'Order ID is missing. Please restart checkout.';
      setErrorMessage(message);
      onPaymentError?.(message);
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { paymentIntent, error } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (error) {
        const message =
          error.message || 'Your card payment could not be completed.';

        setErrorMessage(message);
        onPaymentError?.(message);
        return;
      }

      if (!paymentIntent) {
        const message =
          'Stripe did not return a payment result. Please try again.';

        setErrorMessage(message);
        onPaymentError?.(message);
        return;
      }

      if (paymentIntent.status !== 'succeeded') {
        const message = `Payment is ${paymentIntent.status}. Please complete the payment before continuing.`;

        setErrorMessage(message);
        onPaymentError?.(message);
        return;
      }

      // Stripe succeeded.
      // Now confirm the successful PaymentIntent in MongoDB.
      const response = await api.post('/payments/confirm', {
        orderId,
        paymentIntentId: paymentIntent.id,
      });

      if (!response.data?.order) {
        throw new Error(
          'Payment succeeded, but the order confirmation was not returned by the server.'
        );
      }

      // Checkout handles cart clearing + redirect.
      onPaymentSuccess?.(response.data);
    } catch (err) {
      console.error('Stripe payment confirmation error:', err);

      const message =
        err.response?.data?.message ||
        err.message ||
        'Payment confirmation failed. Please check your order before trying again.';

      setErrorMessage(message);
      onPaymentError?.(message);
    } finally {
      setIsProcessing(false);
    }


  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '15px',
        color: '#1e293b',
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        '::placeholder': {
          color: '#94a3b8',
        },
      },
      invalid: {
        color: '#ef4444',
      },
    },
    hidePostalCode: true,
  };

  return (<form onSubmit={handleSubmit} className="space-y-4"> <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 focus-within:ring-2 focus-within:ring-rose-500 focus-within:bg-white focus-within:border-rose-300 transition-all duration-200"> <CardElement options={cardElementOptions} /> </div>

    ```
    {errorMessage && (
      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-semibold">
        <span>{errorMessage}</span>
      </div>
    )}

    <button
      type="submit"
      disabled={!stripe || !elements || isProcessing}
      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-200/80 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isProcessing ? (
        <>
          <Loader2
            className="animate-spin"
            size={16}
          />
          Processing Secure Payment...
        </>
      ) : (
        <>
          <CheckCircle2 size={16} />

          Pay ₹
          {Number(totalAmount || 0).toLocaleString('en-IN')}
        </>
      )}
    </button>

    <p className="text-[10px] text-gray-400 text-center">
      Your card details are securely processed by Stripe.
    </p>
  </form>


  );
};

export default StripePaymentForm;
