// src/services/n8nService.ts
import { ConvexUserId } from "../types";
import type { ProposalFormData } from "../types"; // Import the interface

// Use import.meta.env for Vite environment variables
const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL || 'http://localhost:5678'; // Example local n8n
const N8N_ONBOARDING_WEBHOOK_URL = import.meta.env.VITE_N8N_ONBOARDING_WEBHOOK_URL || `${N8N_BASE_URL}/webhook-test/onboarding`;
const N8N_PDF_GENERATION_WEBHOOK_URL = import.meta.env.VITE_N8N_PDF_GENERATION_WEBHOOK_URL || `${N8N_BASE_URL}/webhook-test/generate-proposal-pdf`;


export interface OnboardingData {
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
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = `n8n workflow trigger failed with status ${response.status}`;
      try {
         const errorBody = await response.json();
         errorMessage += `: ${errorBody.message || JSON.stringify(errorBody)}`;
      } catch (e) {
         const responseText = await response.text();
         errorMessage += `: ${response.statusText || responseText || 'No additional error message from server.'}`;
      }
      throw new Error(errorMessage);
    }

    console.log('[n8nService] Onboarding workflow triggered. Response:', await response.json().catch(() => response.text()));
    return true;
  } catch (error) {
    console.error('[n8nService] Error in triggerOnboardingWorkflow:', error);
    throw error;
  }
};

/**
 * Calls an n8n workflow to generate a PDF proposal.
 * @param proposalData The data for the proposal.
 * @returns A promise that resolves to an object with pdfUrl or an error message.
 */
export const generateProposalPdf = async (
  proposalData: ProposalFormData
): Promise<{ pdfUrl?: string; error?: string }> => {
  console.log(`[n8nService] Requesting PDF generation for project: ${proposalData.projectName} via ${N8N_PDF_GENERATION_WEBHOOK_URL}`);

  // SIMULATE n8n call for now
  return new Promise((resolve) => { // Removed reject from promise signature for controlled error passing
    setTimeout(() => {
      if (Math.random() > 0.1 || proposalData.clientName.toLowerCase().includes("succeed")) { // ~90% success, or if clientName includes "succeed"
        const mockPdfUrl = `https://example.com/mock-proposal-${Date.now()}.pdf`;
        console.log(`[n8nService] Mock PDF generated: ${mockPdfUrl}`);
        resolve({ pdfUrl: mockPdfUrl });
      } else {
        const errorMessage = "n8n PDF generation failed (simulated error).";
        console.error(`[n8nService] ${errorMessage}`);
        resolve({ error: errorMessage }); // Resolve with error for controlled failure
      }
    }, 1500); // Simulate network delay
  });

  // Actual fetch call would look like this:
  /*
  try {
    const response = await fetch(N8N_PDF_GENERATION_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposalData),
    });

    if (!response.ok) {
      let errorMsg = `PDF generation request failed with status ${response.status}`;
      try { const errBody = await response.json(); errorMsg += `: ${errBody.message || JSON.stringify(errBody)}`; }
      catch (e) { errorMsg += `: ${await response.text()}`; } // Use response.text() if json() fails
      throw new Error(errorMsg);
    }

    const result = await response.json();
    if (!result.pdfUrl) {
      // Check if n8n might have returned error structure even with 200 OK
      if (result.error) throw new Error(result.error);
      throw new Error("PDF URL not found in n8n response.");
    }
    console.log('[n8nService] PDF generated successfully by n8n. URL:', result.pdfUrl);
    return { pdfUrl: result.pdfUrl };
  } catch (error: any) {
    console.error('[n8nService] Error generating PDF via n8n:', error);
    return { error: error.message }; // Ensure consistent return type
  }
  */
};

// Other n8n functions remain placeholders
export const getAgentConfiguration = async (agentId: string): Promise<object | null> => {
  console.log(`[n8nService] Fetching configuration for agent ${agentId}`);
  return Promise.resolve({ agentId, settings: { greeting: "Hello from n8n!" } });
};
