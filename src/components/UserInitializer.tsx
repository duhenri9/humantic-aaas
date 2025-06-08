// src/components/UserInitializer.tsx
import React, { useEffect, useState } from 'react';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api'; // Adjust path
import { Id } from '../../convex/_generated/dataModel'; // Adjust path
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { triggerOnboardingWorkflow } from '../services/n8nService'; // Adjust path
import { ConvexUserId } from '../types';


export interface UserData { // Exporting for potential use elsewhere, e.g. if currentUser is passed as prop
  _id: Id<"users">;
  _creationTime: number;
  email: string;
  name?: string | undefined;
  tokenIdentifier: string;
  isOnboardingWorkflowTriggered?: boolean | undefined;
  stripeCustomerId?: string | undefined;
  stripePaymentStatus?: string | undefined;
  lastStripeCheckoutSessionId?: string | undefined;
  journeyStep_Payment_Completed?: boolean | undefined;
}

const UserInitializer = () => {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const storeUserMutation = useMutation(api.auth.storeUser);
  // Explicitly type currentUser based on the expected return type of your query and UserData interface
  const currentUser = useQuery(api.auth.getCurrentUser) as UserData | null;
  const updateUserMutation = useMutation(api.users.updateUser);
  const { t } = useTranslation();
  const [isStoringUser, setIsStoringUser] = useState(false);
  const [n8nTriggerAttemptedThisSession, setN8nTriggerAttemptedThisSession] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      // Only attempt to store user if authenticated, not already stored (currentUser is null),
      // not currently in the process of storing, and auth is no longer loading.
      if (isAuthenticated && !currentUser && !isStoringUser && !authLoading) {
        setIsStoringUser(true);
        console.log('[UserInitializer] Authenticated, attempting to store/verify user in DB...');
        try {
          // storeUserMutation in convex/auth.ts should handle inserting if new, or returning existing user.
          const userId = await storeUserMutation();
          if (userId) {
            console.log('[UserInitializer] User presence in DB verified/established. User ID:', userId);
            // currentUser state will update automatically via useQuery, triggering other useEffects.
          } else {
            // This case might indicate an issue with storeUser logic if it's expected to always return an ID.
            console.warn('[UserInitializer] storeUserMutation returned null or undefined. User might not be in DB yet or query needs to update.');
          }
        } catch (error) {
          console.error('[UserInitializer] Error calling storeUserMutation:', error);
          toast.error(t('auth.errorStoringUser', 'Could not initialize user session. Please try refreshing.'));
        } finally {
          setIsStoringUser(false);
        }
      }
    };
    initializeUser();
  }, [isAuthenticated, authLoading, currentUser, storeUserMutation, isStoringUser, t]);


  useEffect(() => {
     const attemptN8nOnboarding = async () => {
         // Check if user data is loaded, if onboarding field is false/undefined, and if we haven't tried this session
         if (currentUser && !currentUser.isOnboardingWorkflowTriggered && !n8nTriggerAttemptedThisSession) {
             setN8nTriggerAttemptedThisSession(true); // Mark as attempted for this session to prevent re-triggers on quick UI changes
             console.log('[UserInitializer] New user or user pending onboarding detected. Triggering n8n onboarding workflow...');

             const onboardingToastId = 'onboardingToast';
             toast.loading(t('auth.initiatingOnboarding', 'Initiating onboarding process...'), { id: onboardingToastId });

             try {
                 await triggerOnboardingWorkflow({
                     userId: currentUser._id as ConvexUserId,
                     email: currentUser.email,
                     timestamp: new Date().toISOString(),
                 });
                 toast.success(t('auth.onboardingStartedSuccess', 'Onboarding process started!'), { id: onboardingToastId });

                 // Mark that onboarding has been triggered for this user in the DB
                 await updateUserMutation({ userId: currentUser._id, updates: { isOnboardingWorkflowTriggered: true } });
                 console.log('[UserInitializer] Marked user for n8n onboarding triggered in DB.');

             } catch (n8nError: any) {
                 console.error("[UserInitializer] n8n onboarding trigger failed:", n8nError);
                 toast.error(`${t('auth.onboardingError', 'Onboarding process failed')}: ${n8nError.message}`, { id: onboardingToastId, duration: 7000 });
                 // Allow retry in a new session or if component remounts and state is reset.
                 // For a more robust retry, this state would need to persist or be handled differently.
                 setN8nTriggerAttemptedThisSession(false);
             }
         }
     };
     // Only run if currentUser data is available (meaning storeUser likely completed or user was already there)
     if(currentUser) {
        attemptN8nOnboarding();
     }
  }, [currentUser, updateUserMutation, t, n8nTriggerAttemptedThisSession]);

  return null;
};

export default UserInitializer;
