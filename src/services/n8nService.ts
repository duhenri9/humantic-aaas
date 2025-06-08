// src/services/n8nService.ts
import { ConvexUserId } from "../types"; // Assuming a type for Convex User ID

// Use import.meta.env for Vite environment variables
const N8N_ONBOARDING_WEBHOOK_URL = import.meta.env.VITE_N8N_ONBOARDING_WEBHOOK_URL || 'https://webhook.site/#!/f8a8325e-7474-473b-8083-38d8a709996a/04843afa-5ff0-4694-999a-412a5d776129/1'; // A general public webhook for testing POST requests

export interface OnboardingData { // Exporting for use in RegisterPage if needed, or keep internal if only used here
  userId: ConvexUserId | string;
  email?: string;
  planId?: string;
  timestamp: string;
}

/**
 * Trigger an n8n workflow for onboarding.
 * @param data The data for the onboarding workflow.
 */
export const triggerOnboardingWorkflow = async (data: OnboardingData): Promise<boolean> => {
  console.log(`[n8nService] Triggering onboarding for user ${data.userId} via ${N8N_ONBOARDING_WEBHOOK_URL}`);
  try {
    const response = await fetch(N8N_ONBOARDING_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any other headers if required by your n8n webhook (e.g., API key)
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = `n8n workflow trigger failed with status ${response.status}`;
      try {
         const errorBody = await response.json();
         errorMessage += `: ${errorBody.message || JSON.stringify(errorBody)}`;
      } catch (e) {
         // Could not parse JSON, use status text or the raw response text
         const responseText = await response.text(); // Get raw response text
         errorMessage += `: ${response.statusText || responseText || 'No additional error message from server.'}`;
      }
      throw new Error(errorMessage);
    }

    // Try to parse response as JSON, but handle cases where it might not be
    let responseData: any = {};
    try {
        responseData = await response.json();
    } catch (e) {
        console.warn('[n8nService] Response was not JSON, or failed to parse.');
        // If response is not JSON but still ok (e.g. 204 No Content), this is fine.
        // If it was expected to be JSON, this might indicate an issue with n8n workflow response.
    }

    console.log('[n8nService] Onboarding workflow triggered successfully. Response:', responseData);
    return true;
  } catch (error) {
    console.error('[n8nService] Error triggering onboarding workflow:', error);
    throw error;
  }
};

// Other n8n functions remain placeholders
export const getAgentConfiguration = async (agentId: string): Promise<object | null> => {
  console.log(`[n8nService] Fetching configuration for agent ${agentId}`);
  return Promise.resolve({ agentId, settings: { greeting: "Hello from n8n!" } });
};
