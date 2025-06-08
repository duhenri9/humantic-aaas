// src/pages/PaymentPage.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js'; // Removed Stripe type import as it's inferred
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { UserData } from '../components/UserInitializer'; // Assuming UserData is exported from UserInitializer
import { createStripeCheckoutSession } from '../../services/paymentService';
import toast from 'react-hot-toast';
import { CreditCard, AlertTriangle, Loader2 } from 'lucide-react';
import { logAuditEvent } from '../../services/supabaseService'; // Adjust path

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;
const STRIPE_PRICE_ID_ENTRADA = import.meta.env.VITE_STRIPE_PRICE_ID_ENTRADA || "default_price_id_entrada_placeholder";

const PaymentPage = () => {
  const { t } = useTranslation();
  const currentUser = useQuery(api.auth.getCurrentUser) as UserData | null;
  const [isLoading, setIsLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    if (!stripePublishableKey) {
        console.error("Stripe Publishable Key (VITE_STRIPE_PUBLISHABLE_KEY) is not set. Payment functionality will be disabled.");
        setStripeError(t('payment.errorStripeKeyNotSet', "Stripe payments are not configured correctly by the site administrator."));
    }
    if (STRIPE_PRICE_ID_ENTRADA === "default_price_id_entrada_placeholder") {
        console.warn("Stripe Price ID for 'Entrada' (VITE_STRIPE_PRICE_ID_ENTRADA) is using a placeholder. Ensure it is set for live payments.");
    }
  }, [t]);

  const handlePayment = async () => {
    if (!stripePromise || !currentUser?._id) {
      toast.error(t('payment.errorCannotInitiate', 'Cannot initiate payment. Configuration missing or user not logged in.'));
      if (!currentUser?._id) console.error("User not available for payment.");
      if (!stripePromise) console.error("Stripe.js not loaded (publishable key likely missing).");
      return;
    }
    if (STRIPE_PRICE_ID_ENTRADA === "default_price_id_entrada_placeholder") {
        toast.error(t('payment.errorPriceIdNotSet', "Payment item is not configured. Please contact support."), {duration: 5000});
        setStripeError(t('payment.errorPriceIdNotSet', "Payment item is not configured. Please contact support."));
        return;
    }

    setStripeError(null);
    setIsLoading(true);
    const toastId = 'paymentToast';
    toast.loading(t('payment.initiatingPayment', 'Initiating payment...'), { id: toastId });

    try {
      const result = await createStripeCheckoutSession(STRIPE_PRICE_ID_ENTRADA, currentUser._id);

      if (result.error || !result.sessionId) {
        throw new Error(result.error || t('payment.errorNoSessionId', 'Could not retrieve payment session.'));
      }

      // Log payment initiation event (before redirect)
      logAuditEvent('PAYMENT_INITIATED_STRIPE',
        { stripePriceId: STRIPE_PRICE_ID_ENTRADA, stripeSessionId: result.sessionId },
        currentUser._id as string
      ).then(() => console.log('[PaymentPage] PAYMENT_INITIATED_STRIPE event logged to Supabase.'))
        .catch(err => console.error('[PaymentPage] Supabase logging error for PAYMENT_INITIATED_STRIPE:', err));

      toast.success(t('payment.redirectingToStripe', 'Redirecting to Stripe...'), { id: toastId });

      const stripe = await stripePromise;
      if (!stripe) {
        // This check is somewhat redundant if stripePromise itself is null, but good for type safety
        throw new Error(t('payment.errorStripeJsNotLoaded', 'Stripe.js not loaded.'));
      }
      const { error: stripeRedirectError } = await stripe.redirectToCheckout({ sessionId: result.sessionId });

      if (stripeRedirectError) {
        console.error("Stripe redirectToCheckout error:", stripeRedirectError);
        toast.error(`${t('payment.errorRedirectingToStripe', 'Error redirecting to Stripe')}: ${stripeRedirectError.message}`, { id: toastId, duration: 7000 });
        setStripeError(stripeRedirectError.message || t('payment.errorStripeGeneric', 'An error occurred with Stripe.'));
      }
    } catch (error: any) {
      console.error("Payment initiation failed:", error);
      toast.error(`${t('payment.errorPaymentFailed', 'Payment initiation failed')}: ${error.message}`, { id: toastId, duration: 7000 });
      setStripeError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!stripePublishableKey) {
     return (
         <div className="min-h-[calc(100vh-180px)] flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
             <AlertTriangle size={48} className="text-red-500 mb-4" />
             <h1 className="text-xl font-semibold text-red-700">{t('payment.errorConfigTitle', 'Payment System Error')}</h1>
             <p className="text-gray-600 mt-2">{stripeError}</p>
         </div>
     );
  }

  return (
    <div className="min-h-[calc(100vh-180px)] flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-xl text-center">
        <CreditCard size={48} className="mx-auto text-human-blue mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">
          {t('payment.titleEntrada', 'Complete Your Initial Payment')}
        </h1>
        <p className="text-gray-600">
          {t('payment.descriptionEntrada', 'To activate your HumanTic agent and access all platform features, please complete the initial setup payment. You will be redirected to Stripe for secure processing.')}
        </p>

        {STRIPE_PRICE_ID_ENTRADA === "default_price_id_entrada_placeholder" && (
             <div className="my-4 p-3 bg-amber-100 text-amber-800 rounded-md text-sm border border-amber-300">
                 <p>{t('payment.errorPriceIdNotSetDevelopment', 'Note: The payment item is not fully configured (using placeholder Price ID). This may not function correctly.')}</p>
             </div>
         )}

        {stripeError && ! (STRIPE_PRICE_ID_ENTRADA === "default_price_id_entrada_placeholder" && stripeError.includes("Payment item is not configured")) && (
          // Avoid showing generic stripeError if it's about price ID not set, as a more specific message is shown above
          <div className="my-4 p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-300">
            <p>{stripeError}</p>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={isLoading || !stripePromise || !currentUser || STRIPE_PRICE_ID_ENTRADA === "default_price_id_entrada_placeholder"}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-human-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human-blue transition-colors disabled:opacity-70 disabled:bg-gray-400"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin mr-2" />
          ) : (
            <img src="/stripe_logo_white.svg" alt="Stripe" className="h-5 mr-2" />
          )}
          {isLoading ? t('general.loadingSimple', 'Loading...') : t('payment.payWithStripeButton', 'Pay with Stripe')}
        </button>
        <p className="text-xs text-gray-500 mt-4">
          {t('payment.secureRedirect', 'You will be redirected to Stripe\'s secure checkout.')}
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;
