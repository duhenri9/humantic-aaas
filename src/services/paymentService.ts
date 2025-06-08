// src/services/paymentService.ts
import { ConvexUserId } from "../types"; // Assuming types.ts is in src/

// Stripe specific logic
// const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
// No need to loadStripe here if we are just calling our backend to create session.
// loadStripe will be used in the component that calls redirectToCheckout.

/**
 * Calls our Convex backend to create a Stripe Checkout session.
 * @param planId The Stripe Price ID of the plan being purchased.
 * @param userId The Convex User _id of the user making the purchase.
 * @returns A promise that resolves to an object with sessionId or an error.
 */
export const createStripeCheckoutSession = async (
  planId: string,
  userId: ConvexUserId | string
): Promise<{ sessionId?: string; error?: string }> => {
  console.log(`[PaymentService/Stripe] Requesting checkout session for plan ${planId}, user ${userId}`);

  if (!planId) {
     return { error: "Stripe Price ID (planId) is required." };
  }
  if (!userId) {
     return { error: "User ID is required." };
  }

  try {
    // The path should match what's defined in convex/http.ts
    // Using a relative path assumes the frontend and Convex HTTP API are served on the same origin,
    // or that a proxy is set up in development (e.g., Vite's proxy).
    // For Convex deployment, VITE_CONVEX_URL should be used to construct the full URL if they are different origins.
    // However, Convex HTTP actions are typically on the same Convex deployment URL.
    // For simplicity here, we'll assume same-origin or proxy setup.
    // If not, this needs to be: `${import.meta.env.VITE_CONVEX_URL_FOR_HTTP_ACTIONS || window.location.origin}/stripe/create-checkout-session`

    const response = await fetch('/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, userId }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Use the error message from the backend if available, otherwise a generic one
      throw new Error(data.error || `Failed to create Stripe session. Status: ${response.status}`);
    }

    if (!data.sessionId) {
      throw new Error("Session ID not found in response from backend.");
    }

    console.log("[PaymentService/Stripe] Checkout session created:", data.sessionId);
    return { sessionId: data.sessionId };

  } catch (error: any) {
    console.error('[PaymentService/Stripe] Error creating checkout session:', error);
    return { error: error.message || "An unknown error occurred while creating the Stripe session." };
  }
};

// Pagar.me specific logic (remains placeholder)
const PAGARME_API_KEY = import.meta.env.VITE_PAGARME_API_KEY || 'your_pagarme_ak_placeholder'; // Changed from REACT_APP_

/**
 * Example: Process a payment with Pagar.me.
 * This also typically involves backend communication.
 * @param paymentData Data for the Pagar.me transaction.
 */
export const processPagarmePayment = async (paymentData: object): Promise<{ transactionId: string; status: string } | null> => {
  console.log('[PaymentService/Pagarme] Processing payment:', paymentData);
  console.log('[PaymentService/Pagarme] Using API Key (placeholder):', PAGARME_API_KEY ? 'Provided' : 'Not Provided');
  // Backend call to Pagar.me API
  return Promise.resolve({ transactionId: "dummy_pagarme_tx_id", status: "paid" }); // Placeholder
};
