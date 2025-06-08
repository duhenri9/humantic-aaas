// src/pages/LoginPage.tsx
import React, { useState } from 'react';
// import { useMutation } from "convex/react"; // Placeholder
// import { useConvexAuth } from 'convex/react'; // Placeholder
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const { isLoading } = useConvexAuth(); // Placeholder
  // const signIn = useMutation("convex-auth/signIn"); // Placeholder

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Simulating sign in with email: ${email}`);
    // await signIn({ email, password }); // Actual call
  };

  // if (isLoading) return <div>{t('general.loadingAuth')}</div>; // Placeholder

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          {t('auth.loginTitle', 'Login to your Account')}
        </h2>
        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('auth.emailLabel')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-human-blue focus:border-human-blue sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('auth.passwordLabel')}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-human-blue focus:border-human-blue sm:text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-human-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human-blue transition-colors"
            >
              {t('auth.signInButton')}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          {t('auth.dontHaveAccount', "Don't have an account?")}{' '}
          <Link to="/register" className="font-medium text-human-blue hover:underline">
            {t('auth.register', 'Sign Up')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
