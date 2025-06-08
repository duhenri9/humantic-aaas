// src/pages/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // For navigation
import { Globe } from 'lucide-react'; // For language toggle icon
import { useTranslation } from 'react-i18next';

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'pt' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
      {/* Language Toggle - Positioned top right */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleLanguage}
          className="flex items-center p-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Globe size={20} className="mr-1" />
          <span>{i18n.language.toUpperCase()}</span>
        </button>
      </div>

      <main className="flex flex-col items-center justify-center flex-grow">
        {/* Logo */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold">
            <span style={{ color: '#6D7AFF' }}>Human</span>
            <span style={{ color: '#000000' }}>Tic</span> {/* Logo text might not need translation but title attribute could */}
          </h1>
        </div>

        {/* Buttons */}
        <div className="space-y-4 sm:space-y-0 sm:flex sm:space-x-6">
          <Link
            to="/dashboard/visitor" // Or some other guest accessible route
            className="block w-full sm:w-auto px-8 py-3 text-lg font-medium text-center text-white bg-gray-700 rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-300"
          >
            {t('landingPage.visitorButton')}
          </Link>
          <Link
            to="/login" // Link to the login page
            className="block w-full sm:w-auto px-8 py-3 text-lg font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
            style={{ backgroundColor: '#6D7AFF' }} // Applying specific button color
          >
            {t('landingPage.platformButton')}
          </Link>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-gray-500">
        <p>{t('landingPage.footer', { year: currentYear })}</p>
      </footer>
    </div>
  );
};

export default LandingPage;
