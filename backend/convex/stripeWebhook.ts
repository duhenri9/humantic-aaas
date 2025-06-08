import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api"; // For calling mutations or other actions

// This is an internal action. It should be called by an HTTP action.
export const processStripeEvent = internalAction({
  args: {
    eventPayloadString: v.string(),
    signatureHeader: v.optional(v.string())
  },
  handler: async (ctx, { eventPayloadString, signatureHeader }) => {
    // TODO: Retrieve Stripe SDK instance and Webhook Secret from environment variables
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    // if (!stripeWebhookSecret) {
    //   console.error("Stripe webhook secret (STRIPE_WEBHOOK_SECRET) is not configured in Convex environment.");
    //   return { success: false, error: "Webhook secret not configured." };
    // }

    let event;
    try {
      // In a real app, use the Stripe SDK to verify the signature and construct the event
      // This step is CRUCIAL for security.
      // if (!signatureHeader) {
      //   throw new Error("Missing stripe-signature header");
      // }
      // event = stripe.webhooks.constructEvent(eventPayloadString, signatureHeader, stripeWebhookSecret);

      // For this placeholder, we'll just parse the string as JSON (UNSAFE for production)
      event = JSON.parse(eventPayloadString);
      console.log("stripeWebhook (processStripeEvent): Received mock event:", JSON.stringify(event, null, 2).substring(0, 500) + "...");

      // Handle the event type
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          console.log(`stripeWebhook: Checkout session ${session.id} completed.`);
          // const userId = session.metadata?.convexUserId;
          // const planId = session.metadata?.planId;
          // if (!userId || !planId) {
          //   throw new Error(`Missing metadata (userId or planId) in checkout session ${session.id}`);
          // }
          // TODO: Fulfill the purchase (e.g., update user's subscriptionStatus, availableCredits)
          // Example:
          // await ctx.runMutation(internal.users.grantAccessAfterPayment, {
          //   userId: userId,
          //   planId: planId,
          //   stripeCustomerId: session.customer,
          //   stripeSubscriptionId: session.subscription, // if it's a subscription
          //   paymentStatus: "succeeded", // or map from session.payment_status
          //   externalPaymentId: session.id,
          // });
          console.log("stripeWebhook: Mock fulfillment for checkout.session.completed.");
          break;
        case 'invoice.payment_succeeded':
          const invoice = event.data.object;
          console.log(`stripeWebhook: Invoice ${invoice.id} payment succeeded.`);
          // if (invoice.billing_reason === 'subscription_cycle' || invoice.billing_reason === 'subscription_create') {
            // const stripeSubscriptionId = invoice.subscription;
            // const stripeCustomerId = invoice.customer;
            // TODO: Handle recurring subscription payments (e.g., extend subscription period)
            // await ctx.runMutation(internal.users.renewSubscription, {
            //   stripeSubscriptionId,
            //   stripeCustomerId,
            //   newPeriodEnd: new Date(invoice.period_end * 1000).getTime(), // Convert from Stripe's seconds to ms
            //   paymentStatus: "succeeded",
            //   externalPaymentId: invoice.payment_intent || invoice.charge, // one of these should exist
            // });
            console.log("stripeWebhook: Mock fulfillment for invoice.payment_succeeded.");
          // }
          break;
        case 'invoice.payment_failed':
          const failedInvoice = event.data.object;
          console.warn(`stripeWebhook: Invoice ${failedInvoice.id} payment failed.`);
          // TODO: Handle failed payments (e.g., notify user, update subscriptionStatus to "past_due")
          // await ctx.runMutation(internal.users.handleFailedPayment, {
          //   stripeSubscriptionId: failedInvoice.subscription,
          //   stripeCustomerId: failedInvoice.customer
          // });
          break;
        // ... handle other important event types:
        // customer.subscription.updated, customer.subscription.deleted, etc.
        default:
          console.warn(`stripeWebhook: Unhandled event type ${event.type}`);
      }

      return { success: true, message: "Webhook processed successfully (mock)." };
    } catch (err: any) {
      console.error(`stripeWebhook (processStripeEvent): Error processing webhook: ${err.message}`);
      // In a real scenario, you might want to distinguish between errors that Stripe should retry (500s)
      // and errors that it shouldn't (like signature verification failure - 400).
      // For this placeholder, we'll just indicate a generic processing error.
      return { success: false, error: `Webhook processing error: ${err.message}` };
    }
  },
});

// The actual HTTP action that Stripe calls:
// import { httpAction } from "./_generated/server";
// export const stripeReceiver = httpAction(async (ctx, request) => {
//   const signature = request.headers.get("stripe-signature");
//   if (!signature) {
//     return new Response("Webhook Error: No stripe-signature header provided.", { status: 400 });
//   }
//   const body = await request.text(); // Get raw body as text for signature verification
//
//   // Call the internal action to handle the logic, ensuring it doesn't block the HTTP response for too long.
//   // Consider ctx.scheduler.runAfter(0, internal.stripeWebhook.processStripeEvent, { ... }) if processing is long.
//   const result = await ctx.runAction(internal.stripeWebhook.processStripeEvent, {
//     eventPayloadString: body,
//     signatureHeader: signature
//   });
//
//   if (result.success) {
//     return new Response(JSON.stringify({ received: true, message: result.message }), { status: 200 });
//   } else {
//     // Be careful what error message you return to Stripe.
//     // For signature verification errors, Stripe expects a 400.
//     // For server errors during processing, a 500 might be more appropriate for retries.
//     console.error("Stripe webhook processing failed:", result.error);
//     return new Response(JSON.stringify({ error: "Webhook processing failed." }), { status: 400 });
//   }
// });
