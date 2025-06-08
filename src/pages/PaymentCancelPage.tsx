// src/pages/PaymentCancelPage.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

const PaymentCancelPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[calc(100vh-180px)] flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
      <XCircle size={64} className="text-red-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-800 mb-3">
        {t('payment.cancelTitle', 'Payment Cancelled')}
      </h1>
      <p className="text-gray-600 mb-8 max-w-md">
        {t('payment.cancelMessage', 'Your payment process was cancelled. You have not been charged. If you encountered any issues or wish to try again, you can return to the payment page.')}
      </p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
         <Link
             to="/payment/initiate" // Link back to the payment initiation page
             className="inline-flex items-center justify-center px-6 py-3 text-white bg-human-blue rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human-blue transition-colors text-lg font-medium"
         >
             <ArrowLeft size={20} className="mr-2" />
             {t('payment.tryAgainButton', 'Try Payment Again')}
         </Link>
         <Link
             to="/dashboard"
             className="inline-flex items-center justify-center px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors text-lg font-medium"
         >
             {t('payment.backToDashboardButton', 'Back to Dashboard')}
         </Link>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
