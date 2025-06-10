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
import HumanTicLogo from './components/HumanTicLogo';
import CreateProposalPage from './pages/CreateProposalPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';

// Client Dashboard Layout and Pages
import ClientDashboardLayout from './layouts/ClientDashboardLayout';
import ClientOverviewPage from './pages/client_dashboard/ClientOverviewPage';
import MyAgentPage from './pages/client_dashboard/MyAgentPage';
import MetricsPage from './pages/client_dashboard/MetricsPage';
import AgentSettingsPage from './pages/client_dashboard/AgentSettingsPage';
import DocumentsPage from './pages/client_dashboard/DocumentsPage';
import SupportPage from './pages/client_dashboard/SupportPage';
import { Navigate } from 'react-router-dom'; // Added Navigate


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
        <Link to="/" className="flex items-center">
          <HumanTicLogo />
        </Link>
         <nav className="space-x-4"> {/* Removed hidden sm:block for dev links to be always visible */}
           {/* Temporary Dev Links - consider removing or placing elsewhere for production */}
           <Link to="/dashboard" className="text-sm text-gray-600 hover:text-human-blue">Admin Dashboard (Dev)</Link>
           <Link to="/client/overview" className="text-sm text-gray-600 hover:text-human-blue">Client Dashboard (Dev)</Link>
           <Link to="/proposals/create" className="text-sm text-gray-600 hover:text-human-blue">{t('navigation.createProposal', 'Create Proposal')}</Link>
        </nav>
        <div className="flex items-center">
          <AuthButtons />
        </div>
      </header>

      <main className="bg-gray-50 min-h-[calc(100vh-65px)]">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Payment Status Routes (typically public as Stripe redirects here) */}
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancel" element={<PaymentCancelPage />} />

          {/* Protected Routes - Existing Admin-like Dashboard */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
          />
          <Route
            path="/payment/initiate"
            element={<ProtectedRoute><PaymentPage /></ProtectedRoute>}
          />
          <Route
            path="/proposals/create"
            element={<ProtectedRoute><CreateProposalPage /></ProtectedRoute>}
          />

          {/* --- New Client Dashboard Routes --- */}
          <Route
            path="/client" // Parent route for the new client dashboard
            element={<ProtectedRoute><ClientDashboardLayout /></ProtectedRoute>}
          >
            <Route index element={<Navigate to="overview" replace />} /> {/* Default to overview */}
            <Route path="overview" element={<ClientOverviewPage />} />
            <Route path="my-agent" element={<MyAgentPage />} />
            <Route path="metrics" element={<MetricsPage />} />
            <Route path="settings" element={<AgentSettingsPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="support" element={<SupportPage />} />
            {/* Add more nested routes for client dashboard as needed */}
          </Route>

          {/* Visitor dashboard route - public */}
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
          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
