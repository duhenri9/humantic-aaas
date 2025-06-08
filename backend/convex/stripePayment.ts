import { mutation } from "./_generated/server";
import { v } from "convex/values";
// import { internal } from "./_generated/api"; // If calling internal functions/actions for complex logic

// Utility function for simulating delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Define a structure for plan details - in a real app, this might come from a 'products' table or constants file.
interface PlanDetails {
  id: string;
  name: string;
  priceAmount: number; // e.g., 500 for $5.00
  currency: string; // "usd"
  stripePriceId?: string; // Price ID from Stripe product catalog
  type: 'subscription' | 'one_time';
}

const MOCK_PLANS: Record<string, PlanDetails> = {
  "monthly_tier_1": { id: "monthly_tier_1", name: "Monthly Basic Plan", priceAmount: 500, currency: "usd", stripePriceId: "price_mock_monthly", type: "subscription" },
  "one_time_credits_pack_1": { id: "one_time_credits_pack_1", name: "100 Credits Pack", priceAmount: 1000, currency: "usd", stripePriceId: "price_mock_credits", type: "one_time" },
};


export const createStripeCheckoutSession = mutation({
  args: {
    planId: v.string(), // e.g., "monthly_tier_1"
    // quantity: v.optional(v.number()), // For items with variable quantity
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated to create a Stripe Checkout session.");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("Authenticated user not found in database.");
    }

    // TODO: Retrieve Stripe Secret Key from environment variables
    // const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    // if (!stripeSecretKey) {
    //   throw new Error("STRIPE_SECRET_KEY is not set in Convex backend environment.");
    // }
    // const stripe = new Stripe(stripeSecretKey); // Initialize Stripe SDK

    const planDetails = MOCK_PLANS[args.planId];
    if (!planDetails) {
      throw new Error(`Invalid planId: ${args.planId}. Details not found.`);
    }

    console.log(`stripePayment: User ${user._id} (Token: ${identity.tokenIdentifier}) creating Stripe session for plan: ${args.planId}`);

    // Simulate API call to Stripe
    await delay(1200); // Simulate 1.2 seconds delay

    // In a real implementation:
    // 1. Get or create a Stripe Customer ID for the user.
    //    let stripeCustomerId = user.stripeCustomerId;
    //    if (!stripeCustomerId) {
    //      const customer = await stripe.customers.create({ email: user.email, name: user.name, metadata: { convexUserId: user._id }});
    //      stripeCustomerId = customer.id;
    //      await ctx.db.patch(user._id, { stripeCustomerId });
    //    }
    //
    // 2. Create a Stripe Checkout Session.
    //    const appUrl = process.env.APP_URL || "http://localhost:3000"; // Define your app's base URL
    //    const session = await stripe.checkout.sessions.create({
    //      customer: stripeCustomerId,
    //      payment_method_types: ['card'], // Add other types like 'ideal', 'sofort' as needed
    //      line_items: [{ price: planDetails.stripePriceId, quantity: 1 }],
    //      mode: planDetails.type === 'subscription' ? 'subscription' : 'payment',
    //      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    //      cancel_url: `${appUrl}/payment/canceled`,
    //      metadata: {
    //        convexUserId: user._id.toString(), // Ensure it's a string if your ID type is not string
    //        planId: args.planId,
    //        // Add any other metadata you need for webhooks
    //      }
    //    });
    //
    // 3. Optionally, create a preliminary payment record in your `payments` table.
    //    const paymentId = await ctx.db.insert("payments", {
    //      userId: user._id,
    //      planId: args.planId,
    //      amount: planDetails.priceAmount,
    //      currency: planDetails.currency,
    //      paymentProvider: "stripe",
    //      externalPaymentId: session.id, // Store Stripe session ID
    //      status: "pending",
    //      description: planDetails.name,
    //    });
    //    console.log(`stripePayment: Pending payment record created with ID: ${paymentId}`);
    //
    // 4. Return the session.url for client-side redirect.
    //    return { checkoutUrl: session.url, sessionId: session.id };

    const mockSessionId = `cs_test_${args.planId}_${Date.now()}`;
    const mockAppUrl = process.env.APP_URL || "http://localhost:3000"; // Ensure this is set in Convex env vars too
    const mockCheckoutUrl = `${mockAppUrl}/mock-stripe-checkout?session_id=${mockSessionId}`;

    console.log("stripePayment: Returning mock checkout URL:", mockCheckoutUrl);
    return { checkoutUrl: mockCheckoutUrl, sessionId: mockSessionId };
  },
});
