// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
// import { useMutation } from "convex/react"; // Placeholder
// import { useConvexAuth } from 'convex/react'; // Placeholder
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// import { useConvexAuth, useMutation } from 'convex/react'; // Example if using Convex auth hooks directly
// import { api } from '../../convex/_generated/api'; // Example
import toast from 'react-hot-toast';
import { triggerOnboardingWorkflow } from '../../services/n8nService'; // Adjust path as needed
import { ConvexUserId } from '../../types'; // Assuming types.ts is in src/

const RegisterPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Renamed from conceptual convex isLoading
  const navigate = useNavigate();

  // Conceptual: const signUpMutation = useMutation(api.auth.signUp); // Your actual Convex signup mutation
  // Conceptual: const storeUserMutation = useMutation(api.auth.storeUser);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = "registerProcessToast"; // For coordinated toast updates
    toast.loading(t('auth.creatingAccountLoading', 'Creating your account...'), { id: toastId });

    try {
      // --- Simulate Sign Up and User Creation ---
      // This is where you would call your actual Convex sign-up mutation/action.
      // For example: const result = await signUpMutation({ email, password });
      // const newUserId = result?.userId; // Assuming your mutation returns the new user's ID
      // const newUserEmail = email;

      // SIMULATION for this subtask:
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      const newUserId: ConvexUserId | string = "user_" + Date.now(); // Simulated User ID
      const newUserEmail = email;
      // In a real scenario, ensure newUserId is of type ConvexUserId if that's what your system uses.

      if (!newUserId) { // Check if user creation was successful based on your mutation's response
        throw new Error(t('auth.registrationError', 'User creation failed.'));
      }
      toast.success(t('auth.accountCreatedSuccess', 'Account created successfully!'), { id: toastId });

      // --- Trigger n8n Onboarding ---
      try {
        toast.loading(t('auth.initiatingOnboarding', 'Initiating onboarding process...'), { id: 'onboardingToast' });
        await triggerOnboardingWorkflow({
          userId: newUserId as string, // Cast if ConvexUserId is not directly string assignable for the service
          email: newUserEmail,
          timestamp: new Date().toISOString(),
          // planId: "default_plan" // Example if you have a default plan
        });
        toast.success(t('auth.onboardingStartedSuccess', 'Onboarding process started!'), { id: 'onboardingToast' });
      } catch (n8nError: any) {
        console.error("[RegisterPage] n8n onboarding trigger failed:", n8nError);
        toast.error(`${t('auth.onboardingError', 'Onboarding process failed')}: ${n8nError.message}`, { id: 'onboardingToast', duration: 7000 });
      }

      navigate('/dashboard');
    } catch (error: any) {
      console.error("[RegisterPage] Registration failed:", error);
      toast.error(`${t('auth.registrationError', 'Registration failed')}: ${error.message}`, { id: toastId, duration: 7000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          {t('auth.registerTitle', 'Create your Account')}
        </h2>
        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label htmlFor="emailRegister" className="block text-sm font-medium text-gray-700"> {/* Changed htmlFor to avoid conflict with login */}
              {t('auth.emailLabel')}
            </label>
            <input
              type="email"
              id="emailRegister"  // Ensure unique ID
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-human-blue focus:border-human-blue sm:text-sm disabled:bg-gray-50"
            />
          </div>
          <div>
            <label htmlFor="passwordRegister" className="block text-sm font-medium text-gray-700"> {/* Changed htmlFor */}
              {t('auth.passwordLabel')}
            </label>
            <input
              type="password"
              id="passwordRegister" // Ensure unique ID
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-human-blue focus:border-human-blue sm:text-sm disabled:bg-gray-50"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-human-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human-blue transition-colors disabled:opacity-70"
            >
              {isLoading ? t('general.loadingAuth') : t('auth.signUpButton')}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          {t('auth.alreadyHaveAccount', "Already have an account?")}{' '}
          <Link to="/login" className="font-medium text-human-blue hover:underline">
            {t('auth.login', 'Login')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
