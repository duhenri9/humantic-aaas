// src/components/AuthButtons.tsx
import React from "react";
import { useConvexAuth } from "convex/react";
// import { useMutation } from "convex/react"; // Potentially for a custom signOut
// import { api } from '../../convex/_generated/api'; // If using a custom signOut
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AuthButtons = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { t } = useTranslation();
  const navigate = useNavigate(); // For programmatic navigation if needed

  // Placeholder for actual sign-out logic.
  // Convex's default behavior with ConvexProviderWithAuth might handle session invalidation
  // when you use a third-party auth provider's logout function or clear specific Convex cookies/tokens.
  // If you have a custom mutation for signOut in `convex/auth.ts`, you would use `useMutation` here.
  const handleSignOut = async () => {
    alert(t('auth.logout') + ' action placeholder. Full integration with Convex backend needed.');
    // Example: if you had `signOut = useMutation(api.auth.signOut);`
    // await signOut();
    // Then, ConvexProviderWithAuth should detect the change in authentication state.
    // Optionally, navigate to home or login page:
    // navigate('/');
  };

  if (isLoading) {
    // Using a consistent styling for loading text, can be improved with a spinner
    return <div className="px-4 py-2 text-sm text-gray-500">{t('general.loadingAuth')}</div>;
  }

  return (
    <div className="flex items-center space-x-3">
      {isAuthenticated ? (
        <>
          {/* User info can be added here later, e.g., from useQuery(api.users.getCurrent) if you have such a query */}
          {/* <span className="text-sm text-gray-700 mr-3">Welcome!</span> */}
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
          >
            {t('auth.logout')}
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            {t('auth.login')}
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#6D7AFF' }} // Retaining specific brand color
          >
            {t('auth.register')}
          </Link>
        </>
      )}
    </div>
  );
};

export default AuthButtons;
