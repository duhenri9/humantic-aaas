// convex/stripe.ts
import { httpAction, internalMutation } from "./_generated/server";
import Stripe from "stripe";
import { internal } from "./_generated/api"; // For calling internal mutations
import { v } from "convex/values"; // For internalMutation args validation
import { Id } from "./_generated/dataModel"; // For Id type

// Initialize Stripe with the secret key from Convex environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

let stripe: Stripe | null = null;
if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2023-10-16",
        typescript: true,
    });
} else {
    console.warn("[convex/stripe.ts] STRIPE_SECRET_KEY is not set. Stripe features will not work.");
}

// --- Internal Mutation for Webhook ---
export const fulfillCheckoutSession = internalMutation({
    args: {
        userIdString: v.string(),
        stripeCheckoutSessionId: v.string(),
        stripeCustomerId: v.optional(v.string()),
        paymentStatus: v.string(),
    },
    handler: async (ctx, { userIdString, stripeCheckoutSessionId, stripeCustomerId, paymentStatus }) => {
        let user = await ctx.db.get(userIdString as Id<"users">);

        // Basic fallback: if client_reference_id was not a valid User _id string,
        // and we stored stripeCustomerId previously, try to look up by that.
        // This part is conceptual and might need more robust handling based on actual ID strategy.
        if (!user && stripeCustomerId) {
          console.warn(`[Webhook] User not found by ID string: ${userIdString}. Attempting lookup by Stripe Customer ID: ${stripeCustomerId}`);
          user = await ctx.db.query("users").withIndex("by_stripe_customer_id", q => q.eq("stripeCustomerId", stripeCustomerId!)).unique();
        }
        // Further fallbacks (e.g. by email from session) could be added if necessary but increase complexity.

        if (!user) {
            console.error(`[Webhook] User not found with ID string "${userIdString}" or associated Stripe ID for session ${stripeCheckoutSessionId}. Cannot fulfill order.`);
            return { success: false, error: "User not found from provided identifiers" };
        }

        // Idempotency: Check if this session has already been processed for 'paid' status specifically
        if (user.lastStripeCheckoutSessionId === stripeCheckoutSessionId && user.stripePaymentStatus === 'paid' && paymentStatus === 'paid') {
            console.log(`[Webhook] 'Paid' checkout session ${stripeCheckoutSessionId} already processed for user ${user._id}.`);
            return { success: true, message: "Already processed as paid" };
        }

        const updates: any = {
            stripePaymentStatus: paymentStatus,
            lastStripeCheckoutSessionId: stripeCheckoutSessionId,
            journeyStep_Payment_Completed: paymentStatus === 'paid' ? true : user.journeyStep_Payment_Completed || false, // Set if paid, don't unset if already true
        };
        if (stripeCustomerId && !user.stripeCustomerId) {
            updates.stripeCustomerId = stripeCustomerId;
        }

        await ctx.db.patch(user._id, updates);
        console.log(`[Webhook] User ${user._id} updated after payment event for session ${stripeCheckoutSessionId}. Status: ${paymentStatus}. Payment step completed: ${updates.journeyStep_Payment_Completed}`);

        // N8N onboarding trigger logic (from previous version)
        // This logic might be better placed or more nuanced based on your exact onboarding flow.
        if (paymentStatus === 'paid' && !user.isOnboardingWorkflowTriggered) {
            console.log(`[Webhook] Payment successful for new user ${user._id}, ensuring n8n onboarding is triggered.`);
            // This assumes n8n onboarding includes user data sync. If not, you might need to call storeUser again or similar.
            // For simplicity, we assume UserInitializer on client or this webhook handles it.
            // Here, we can update the flag directly if this is the primary trigger point post-payment for new users.
            await ctx.db.patch(user._id, { isOnboardingWorkflowTriggered: true });
            // Optionally, directly call an internal n8n trigger function if available:
            // await ctx.scheduler.runAfter(0, internal.n8n.triggerOnboardingWorkflowInternal, { userId: user._id, email: user.email });
        }

        return { success: true };
    }
});

// --- HTTP Action for Stripe Webhook ---
export const stripeWebhookHandler = httpAction(async (ctx, request) => {
  if (!stripe) {
    console.error("Stripe not initialized due to missing secret key. Cannot process webhooks.");
    return new Response("Stripe webhook processing is not configured.", { status: 500 });
  }
  if (!webhookSecret) {
     console.error("STRIPE_WEBHOOK_SECRET is not set. Cannot process webhooks securely.");
     return new Response("Webhook secret not configured for verification.", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    console.warn("[Webhook] Stripe signature missing from header.");
    return new Response("Stripe signature missing.", { status: 400 });
  }

  const requestBodyText = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(requestBodyText, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[Webhook] Stripe webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error (Signature Verification): ${err.message}`, { status: 400 });
  }

  console.log(`[Webhook] Received Stripe event: ${event.type}`);
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`[Webhook] Processing checkout.session.completed for session: ${session.id}, Payment Status: ${session.payment_status}`);

      const userIdString = session.client_reference_id || session.metadata?.convexUserId;
      const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

      if (!userIdString) {
         console.error(`[Webhook] Convex User ID not found in session ${session.id}. client_reference_id: ${session.client_reference_id}, metadata: ${JSON.stringify(session.metadata)}.`);
         return new Response("User ID missing in session, cannot process.", { status: 200 }); // Ack to Stripe
      }

      if (session.payment_status === 'paid') {
        const result = await ctx.runMutation(internal.stripe.fulfillCheckoutSession, {
          userIdString, // Pass as string
          stripeCheckoutSessionId: session.id,
          stripeCustomerId: stripeCustomerId,
          paymentStatus: 'paid',
        });
        if (!result.success) {
         console.error(`[Webhook] Failed to fulfill checkout session ${session.id} for user ID string ${userIdString}: ${result.error}`);
        }
      } else {
         console.log(`[Webhook] Checkout session ${session.id} completed but payment status is ${session.payment_status} (not 'paid'). No DB update action taken for payment fulfillment.`);
         // Optionally, still update user with pending status if needed:
         // await ctx.runMutation(internal.stripe.fulfillCheckoutSession, {
         //    userIdString,
         //    stripeCheckoutSessionId: session.id,
         //    stripeCustomerId: stripeCustomerId,
         //    paymentStatus: session.payment_status, // Store the actual status
         // });
      }
      break;

    // case 'invoice.payment_succeeded': /* ... */ break;
    // case 'customer.subscription.created': /* ... */ break;
    // case 'customer.subscription.updated': /* ... */ break;
    // case 'customer.subscription.deleted': /* ... */ break;

    default:
      console.log(`[Webhook] Unhandled Stripe event type: ${event.type}`);
  }

  return new Response(null, { status: 200 });
});

// --- HTTP Action for Creating Checkout Session (from previous subtask) ---
export const createCheckoutSession = httpAction(async (ctx, request) => {
  if (!stripe) {
    return new Response(JSON.stringify({ error: "Stripe is not configured on the server." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }

  let planId, userId;
  try {
    const jsonData = await request.json();
    planId = jsonData.planId;
    userId = jsonData.userId;
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!planId) { return new Response(JSON.stringify({ error: "Stripe Price ID (planId) is required" }), { status: 400, headers: { 'Content-Type': 'application/json' }}); }
  if (!userId) { return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400, headers: { 'Content-Type': 'application/json' }}); }

  const appDomain = process.env.APP_DOMAIN || "http://localhost:5173";

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: planId, quantity: 1 }],
      mode: "payment",
      success_url: `${appDomain}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appDomain}/payment/cancel`,
      client_reference_id: userId,
      metadata: { convexUserId: userId },
    });

    if (!session.id) {
      console.error("Stripe session ID not found after creation, response:", session);
      throw new Error("Stripe session ID not found after creation.");
    }
    return new Response(JSON.stringify({ sessionId: session.id }), { status: 200, headers: { 'Content-Type': 'application/json' }});
  } catch (error: any) {
    console.error("Stripe Checkout Session creation failed:", error);
    return new Response(JSON.stringify({ error: "Failed to create Stripe session due to an internal error." }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
});
