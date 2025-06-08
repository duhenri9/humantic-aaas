// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react'; // Icon

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-gray-100 text-center px-4">
      {/* Adjust min-height if header/footer height changes, 120px is an estimate */}
      <AlertTriangle size={64} className="text-red-500 mb-6" />
      <h1 className="text-4xl font-bold text-gray-800 mb-3">
        {t('general.pageNotFound')}
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        {t('general.pageNotFoundMessage')}
      </p>
      <Link
        to="/"
        className="px-6 py-3 text-lg font-medium text-white bg-human-blue rounded-lg hover:bg-opacity-90 transition-colors"
      >
        {t('general.goHome')}
      </Link>
    </div>
  );
};

export default NotFoundPage;
