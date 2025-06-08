// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationPT from './locales/pt/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  pt: {
    translation: translationPT,
  },
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Use en if detected lng is not available
    debug: process.env.NODE_ENV === 'development', // Enable debug output in development
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'], // Order of detection
      caches: ['localStorage'], // Cache detected language in localStorage
    },
  });

export default i18n;
