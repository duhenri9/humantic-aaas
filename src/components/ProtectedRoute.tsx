// src/components/ProtectedRoute.tsx
import React from 'react';
import { useConvexAuth } from 'convex/react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react'; // For loading state
import { useTranslation } from 'react-i18next';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-gray-700">
        <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
        <p className="text-lg">{t('general.loadingAuth')}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
