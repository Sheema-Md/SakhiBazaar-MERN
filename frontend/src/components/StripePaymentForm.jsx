
import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';
import { Loader2 } from 'lucide-react';

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
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async () => {
        if (isProcessing) return;

        if (!stripe || !elements) {
            const message = 'Stripe is still loading. Please wait a moment.';
            setErrorMessage(message);
            onPaymentError?.(message);
            return;
        }

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            const message = 'Card payment form is not ready.';
            setErrorMessage(message);
            onPaymentError?.(message);
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            /*
             * --------------------------------------------------------
             * STEP 1: CONFIRM PAYMENT WITH STRIPE
             * --------------------------------------------------------
             */
            const { paymentIntent, error } =
                await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: cardElement,
                    },
                });

            /*
             * --------------------------------------------------------
             * STRIPE PAYMENT ERROR
             * --------------------------------------------------------
             */
            if (error) {
                console.error('Stripe payment error:', error);

                const message =
                    error.message || 'Your payment could not be completed.';

                setErrorMessage(message);
                onPaymentError?.(message, 'failed');

                return;
            }

            /*
             * --------------------------------------------------------
             * NO PAYMENT INTENT
             * --------------------------------------------------------
             */
            if (!paymentIntent) {
                const message =
                    'Stripe did not return a payment result. Please try again.';

                setErrorMessage(message);
                onPaymentError?.(message, 'failed');

                return;
            }

            /*
             * --------------------------------------------------------
             * PAYMENT SUCCESS
             * --------------------------------------------------------
             *
             * IMPORTANT:
             *
             * We only call our backend after Stripe reports
             * the PaymentIntent as succeeded.
             */
            if (paymentIntent.status === 'succeeded') {
                try {
                    /*
                     * Tell our backend that Stripe successfully
                     * completed the payment.
                     */
                    const response = await api.post('/payments/confirm', {
                        orderId,
                        paymentIntentId: paymentIntent.id,
                    });

                    /*
                     * IMPORTANT:
                     *
                     * Checkout.jsx receives this callback and navigates
                     * to /order-success.
                     */
                    await onPaymentSuccess?.({
                        ...response.data,
                        paymentIntentId: paymentIntent.id,
                    });
                } catch (confirmError) {
                    console.error(
                        'Backend payment confirmation error:',
                        confirmError
                    );

                    const message =
                        confirmError.response?.data?.message ||
                        confirmError.message ||
                        'Payment succeeded, but order confirmation failed.';

                    setErrorMessage(message);
                    onPaymentError?.(message, 'failed');
                }

                return;
            }

            /*
             * --------------------------------------------------------
             * OTHER STRIPE PAYMENT STATES
             * --------------------------------------------------------
             *
             * Do NOT call these "successful".
             */
            if (paymentIntent.status === 'processing') {
                const message =
                    'Your payment is still processing. Please wait for confirmation.';

                setErrorMessage(message);
                onPaymentError?.(message, 'processing');

                return;
            }

            if (paymentIntent.status === 'requires_payment_method') {
                const message =
                    'Payment was not completed. Please check your card details and try again.';

                setErrorMessage(message);
                onPaymentError?.(message, 'failed');

                return;
            }

            if (paymentIntent.status === 'canceled') {
                const message =
                    'Payment was cancelled. You can retry the payment.';

                setErrorMessage(message);
                onPaymentError?.(message, 'cancelled');

                return;
            }

            /*
             * --------------------------------------------------------
             * UNKNOWN PAYMENT STATUS
             * --------------------------------------------------------
             */
            const message =
                `Payment status: ${paymentIntent.status}`;

            setErrorMessage(message);
            onPaymentError?.(message, 'failed');
        } catch (err) {
            console.error('Stripe payment processing error:', err);

            const message =
                err.response?.data?.message ||
                err.message ||
                'Payment could not be completed. Please try again.';

            setErrorMessage(message);
            onPaymentError?.(message, 'failed');
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
        <div className="space-y-4">

            {/* ======================================================
          CARD ELEMENT
         ====================================================== */}

            <div
                className="
          border border-slate-200
          rounded-xl
          p-4
          bg-slate-50
          focus-within:ring-2
          focus-within:ring-rose-500
          focus-within:bg-white
          focus-within:border-rose-300
          transition-all
          duration-200
        "
            >
                <CardElement options={cardElementOptions} />
            </div>

            {/* ======================================================
          ERROR MESSAGE
         ====================================================== */}

            {errorMessage && (
                <div className="text-xs text-red-500 font-semibold px-1">
                    {errorMessage}
                </div>
            )}

            {/* ======================================================
          PAYMENT BUTTON
         ====================================================== */}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={!stripe || !elements || isProcessing}
                className="
          w-full
          flex
          items-center
          justify-center
          gap-2
          py-3
          bg-gradient-to-r
          from-rose-600
          to-purple-600
          hover:from-rose-700
          hover:to-purple-700
          text-white
          font-bold
          text-sm
          rounded-xl
          shadow-lg
          shadow-rose-200/50
          hover:shadow-xl
          hover:shadow-rose-200/80
          transition-all
          duration-200
          cursor-pointer
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
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
                        Pay ₹
                        {totalAmount
                            ? Number(totalAmount).toLocaleString('en-IN')
                            : ''}
                    </>
                )}
            </button>

        </div>
    );
};

export default StripePaymentForm;