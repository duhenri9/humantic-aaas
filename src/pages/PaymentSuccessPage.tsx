// src/pages/PaymentSuccessPage.tsx
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentSuccessPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      console.log("Stripe Checkout Session ID:", sessionId);
      // Here you might typically:
      // 1. Call your backend to verify the session status and retrieve order details if not done by webhook.
      // 2. Update the user's status/entitlements in your app's state or trigger a refetch.
      // For now, we just acknowledge the success with a toast.
      toast.success(t('payment.successToast', 'Payment confirmed! Thank you.'));

      // Example: Clear cart, update user context, etc.
      // This is also where you might want to update the ClientJourneyStepper if it's reflecting payment status.
      // For now, this is a simple acknowledgement page.
    } else {
      console.warn("No session_id found in URL for PaymentSuccessPage.");
      // Potentially redirect or show a generic success if session_id is not critical for this page's display
      // Or show a message indicating that the confirmation details might be missing.
    }
  }, [sessionId, t]);

  return (
    <div className="min-h-[calc(100vh-180px)] flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
      <CheckCircle size={64} className="text-emerald-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-800 mb-3">
        {t('payment.successTitle', 'Payment Successful!')}
      </h1>
      <p className="text-gray-600 mb-8 max-w-md">
        {t('payment.successMessage', 'Thank you for your payment. Your transaction has been completed successfully. You should receive a confirmation email shortly. You can now access your agent and dashboard features.')}
      </p>
      {sessionId && (
         <p className="text-xs text-gray-500 mb-4 p-2 bg-gray-200 rounded-md inline-block">
             {t('payment.sessionIdLabel', 'Session ID')}: {sessionId}
         </p>
      )}
      <Link
        to="/dashboard" // Or to a specific "next step" page
        className="inline-flex items-center px-6 py-3 text-white bg-human-blue rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human-blue transition-colors text-lg font-medium"
      >
        {t('payment.goToDashboardButton', 'Go to Dashboard')}
        <ArrowRight size={20} className="ml-2" />
      </Link>
    </div>
  );
};

export default PaymentSuccessPage;
