// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast'; // Import Toaster
import UserInitializer from './components/UserInitializer'; // Adjust path as needed
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthButtons from './components/AuthButtons';
import ProtectedRoute from './components/ProtectedRoute';
import HumanTicLogo from './components/HumanTicLogo'; // Example: create a logo component

function App() {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Router>
      {/* Toast Notification Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '0.875rem', // Equivalent to text-sm
            borderRadius: '8px', // Equivalent to rounded-lg
            padding: '12px', // Equivalent to p-3
          },
          success: {
            duration: 3000,
            // theme property is not standard for react-hot-toast, use iconTheme or style
            iconTheme: {
              primary: 'green', // This is for the icon color
              secondary: '#fff', // This is for the icon background color if applicable
            },
            style: {
              background: '#28a745', // A success green
              color: '#fff',
            }
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: 'red',
              secondary: '#fff',
            },
            style: {
              background: '#dc3545', // A danger red
              color: '#fff',
            }
          },
        }}
      />
      <UserInitializer /> {/* Call UserInitializer here, early in the app lifecycle */}

      <header className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <Link to="/" className="flex items-center"> {/* Ensure link wraps logo for clickability */}
          <HumanTicLogo /> {/* Using a component for the logo */}
        </Link>
        <nav className="space-x-4 hidden sm:block"> {/* Hide nav on small screens for simplicity */}
          {/* Example nav links - can be expanded and translated */}
          {/* <Link to="/features" className="text-gray-600 hover:text-blue-600">{t('navigation.features', 'Features')}</Link> */}
          {/* <Link to="/pricing" className="text-gray-600 hover:text-blue-600">{t('navigation.pricing', 'Pricing')}</Link> */}
        </nav>
        <div className="flex items-center">
          <AuthButtons />
          {/* Language toggle could be moved here from LandingPage for global access */}
        </div>
      </header>

      <main className="bg-gray-50 min-h-[calc(100vh-65px)]"> {/* Ensure main takes up available height */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
          />
          <Route
            path="/dashboard/visitor"
            element={
              <div className="p-8 text-center">
                <h1 className="text-2xl font-semibold">{t('dashboard.visitorTitle', 'Visitor Dashboard')}</h1>
                <p className="mt-2 text-gray-600">{t('dashboard.visitorMessage', 'This is a public area. Content will be added soon.')}</p>
                <p className="mt-4"><Link to="/" className="text-blue-600 hover:underline">{t('general.goHome', 'Go back to Home')}</Link></p>
              </div>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
