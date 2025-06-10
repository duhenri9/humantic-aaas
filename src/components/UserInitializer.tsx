// src/components/UserInitializer.tsx
import React, { useEffect, useState } from 'react';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api'; // Adjust path
import { Id } from '../../convex/_generated/dataModel'; // Adjust path
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { triggerOnboardingWorkflow } from '../services/n8nService'; // Adjust path
import { ConvexUserId, UserData } from '../../types'; // Adjusted path and import UserData
import { logAuditEvent } from '../services/supabaseService'; // Adjust path


// Removed local UserData interface definition

const UserInitializer = () => {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const storeUserMutation = useMutation(api.auth.storeUser);
  const currentUser = useQuery(api.auth.getCurrentUser) as UserData | null;
  const updateUserMutation = useMutation(api.users.updateUser);
  const { t } = useTranslation();
  const [isStoringUser, setIsStoringUser] = useState(false);
  const [n8nTriggerAttemptedThisSession, setN8nTriggerAttemptedThisSession] = useState(false);
  const [loginEventLogged, setLoginEventLogged] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      if (isAuthenticated && !currentUser && !isStoringUser && !authLoading) {
        setIsStoringUser(true);
        console.log('[UserInitializer] Authenticated, attempting to store/verify user in DB...');
        try {
          const userIdFromStoreUser = await storeUserMutation();
          if (userIdFromStoreUser) {
            console.log('[UserInitializer] User presence in DB verified/established. User ID:', userIdFromStoreUser);
            // USER_SESSION_INITIALIZED will be logged by the next useEffect when currentUser is confirmed.
          } else {
            console.warn('[UserInitializer] storeUserMutation returned null or undefined.');
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

  // Separate useEffect to log when currentUser is confirmed after initialization or on subsequent loads
  useEffect(() => {
    if (currentUser && isAuthenticated && !loginEventLogged) {
      logAuditEvent('USER_SESSION_INITIALIZED',
        { email: currentUser.email, source: 'UserInitializer' },
        currentUser._id as string // Cast ConvexId to string for Supabase
      ).then(() => console.log('[UserInitializer] USER_SESSION_INITIALIZED event logged to Supabase.'))
        .catch(err => console.error('[UserInitializer] Supabase logging error for USER_SESSION_INITIALIZED:', err));
      setLoginEventLogged(true); // Log only once per component mount / user session initialization
    }
    // If user logs out and logs back in (new session), loginEventLogged should reset.
    // This simple state won't handle that; a more robust session ID or timestamp comparison would be needed.
    // For this subtask, "once per component mount if user is present" is the behavior.
    // Reset loginEventLogged if authentication state changes to false (user logs out)
    if (!isAuthenticated && loginEventLogged) {
        setLoginEventLogged(false);
    }
  }, [currentUser, isAuthenticated, loginEventLogged]);


  useEffect(() => {
     const attemptN8nOnboarding = async () => {
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
