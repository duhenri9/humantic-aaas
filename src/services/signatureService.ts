// src/services/signatureService.ts
// Placeholder for Assini integration for digital signatures.

// Use import.meta.env for Vite environment variables
const ASSINI_API_KEY = import.meta.env.VITE_ASSINI_API_KEY || 'test_assini_api_key_placeholder';
const ASSINI_BASE_URL = import.meta.env.VITE_ASSINI_API_BASE_URL || 'https://api.assini.com.br/v1'; // Example, ensure this is correct if there's a real sandbox

interface AssiniSignatureRequestPayload {
  document_url: string;
  signer_email: string;
  // Potentially other fields Assini might require:
  // document_name?: string;
  // callback_url?: string;
  // signers?: Array<{ email: string; name?: string; role?: string }>;
}

// Interface for the expected successful response from Assini (simplified)
interface AssiniSignatureSuccessResponse {
  signatureRequestId: string; // Or `id`, `request_id`, etc. based on Assini's actual response
  status?: string; // e.g., 'pending', 'sent'
  // any other relevant fields from Assini
}

// Interface for a structured error response from this service
interface SignatureServiceErrorResponse {
  error: string;
  details?: any;
}

/**
 * Sends a document for signature via a simulated Assini API.
 * @param documentUrl URL of the document to be signed.
 * @param signerEmail Email of the person who needs to sign.
 * @returns A promise that resolves to an object with signatureRequestId or an error.
 */
export const sendForSignature = async (
  documentUrl: string,
  signerEmail: string
): Promise<AssiniSignatureSuccessResponse | SignatureServiceErrorResponse> => { // Return type updated
  console.log(`[SignatureService/Assini] Requesting signature for document ${documentUrl} by ${signerEmail}`);
  console.log(`[SignatureService/Assini] Using API Key: ${ASSINI_API_KEY ? 'Provided (ends with ...' + ASSINI_API_KEY.slice(-4) + ')' : 'Not Provided (using placeholder behavior)'}`);
  console.log(`[SignatureService/Assini] Target API Base URL: ${ASSINI_BASE_URL}`);

  const payload: AssiniSignatureRequestPayload = {
    document_url: documentUrl,
    signer_email: signerEmail,
  };

  // SIMULATE Assini API call for now
  return new Promise((resolve) => {
    setTimeout(() => {
      if (signerEmail.toLowerCase().includes('fail')) {
        const errorMessage = "Assini API error: Invalid signer email (simulated).";
        console.error(`[SignatureService/Assini] ${errorMessage}`);
        resolve({ error: errorMessage, details: { code: 400 } });
      } else if (!ASSINI_API_KEY || ASSINI_API_KEY === 'test_assini_api_key_placeholder') {
        const warningMessage = "Assini API Key not configured. Simulation mode with placeholder ID.";
        console.warn(`[SignatureService/Assini] ${warningMessage}`);
        // Resolve with a success-like structure but include the warning as an error for clarity to the caller
        resolve({
            signatureRequestId: `sim_req_${Date.now()}_key_missing`,
            status: "simulated_key_missing",
            // Also returning an error field here makes the "error" part of the response type consistent
            // However, the prompt asks for signatureRequestId OR error. Let's stick to that.
            // For a combined approach, the caller checks `if (result.error || !result.signatureRequestId)`
            // The prompt's return type `Promise<{ signatureRequestId?: string; error?: string; details?: any }>` is good.
            // Let's adjust the success path for key missing to also fit this structure.
            // It should still be a "success" in terms of simulation if key is missing, but with a specific ID.
        });
        // Re-evaluating: if API key is missing, it's an operational error for a real call.
        // So, for simulation, we can either return a specific error or a specific simulated success.
        // The original prompt had: resolve({ signatureRequestId: `sim_req_${Date.now()}_key_missing`, error: warningMessage });
        // This seems like a good way to indicate simulation due to missing key but still provide a "request ID".
        // Let's refine this to be clearer. If the API key is missing, it's a configuration error.
        // The service should probably return an error object for this case.
        // However, the prompt implies a placeholder ID is fine.
        // For simulation, if key is missing, we can return a simulated ID and no error.
        // The console.warn is important.
         resolve({ signatureRequestId: `sim_req_${Date.now()}_key_missing`, status: "simulated_api_key_missing" });

      } else {
        const mockSignatureRequestId = `as_req_${Date.now()}`;
        console.log(`[SignatureService/Assini] Mock signature request created: ${mockSignatureRequestId}`);
        resolve({ signatureRequestId: mockSignatureRequestId, status: "simulated_sent" });
      }
    }, 1200); // Simulate network delay
  });

  // Actual fetch call would look like this:
  /*
  if (!ASSINI_API_KEY || ASSINI_API_KEY === 'test_assini_api_key_placeholder') {
     const errMsg = 'Assini API Key is not configured. Please set VITE_ASSINI_API_KEY.';
     console.error(`[SignatureService/Assini] ${errMsg}`);
     return { error: errMsg };
  }

  try {
    const response = await fetch(`${ASSINI_BASE_URL}/signature_requests`, { // Assuming this is the endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ASSINI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      let errorMsg = `Assini API request failed with status ${response.status}`;
      // Try to get more specific error from response body
      errorMsg += `: ${responseData?.message || responseData?.error || JSON.stringify(responseData)}`;
      throw new Error(errorMsg);
    }

    // Assumed Assini returns { id: "...", status: "..." } on success
    if (!responseData.id) {
      throw new Error("Signature Request ID not found in Assini response.");
    }

    console.log('[SignatureService/Assini] Document sent for signature successfully. Response:', responseData);
    return { signatureRequestId: responseData.id, status: responseData.status, ...responseData };
  } catch (error: any) {
    console.error('[SignatureService/Assini] Error sending document for signature:', error);
    return { error: error.message, details: error.response?.data };
  }
  */
};
