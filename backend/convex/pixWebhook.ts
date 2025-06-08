import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api"; // For calling other backend functions

// This is an internal action, intended to be called by an HTTP action.
export const processPixNotification = internalAction({
  args: {
    notificationPayloadString: v.string(), // Raw payload string from the PIX provider
    // providerName: v.optional(v.string()) // If you use multiple PIX providers and need to distinguish
  },
  handler: async (ctx, { notificationPayloadString }) => {
    // TODO: Implement security verification for the webhook.
    // This is CRITICAL and depends on your PIX provider. It might involve:
    // - Checking a signature header.
    // - Verifying a secret token passed in the payload or header.
    // - Whitelisting the provider's IP addresses (less reliable).
    // const pixProviderWebhookSecret = process.env.PIX_PROVIDER_WEBHOOK_SECRET;
    // const signature = request.headers.get("X-Pix-Signature"); // Example header
    // if (!verifySignature(notificationPayloadString, signature, pixProviderWebhookSecret)) {
    //   console.error("pixWebhook: Invalid signature or authentication for PIX notification.");
    //   return { success: false, error: "Invalid PIX notification signature." };
    // }

    try {
      const notificationData = JSON.parse(notificationPayloadString); // Assuming the payload is JSON
      console.log("pixWebhook (processPixNotification): Received mock PIX notification:", JSON.stringify(notificationData, null, 2).substring(0,500)+"...");

      // The structure of `notificationData` will vary greatly between PIX providers.
      // Typically, it includes an identifier for the PIX transaction and its status.
      // Example structure (highly hypothetical):
      // {
      //   "event_type": "pix.payment.confirmed", // or "pix.charge.paid"
      //   "data": {
      //     "pix_transaction_id": "E12345678202301011200abcdef123", // External ID you stored
      //     "charge_id": "charge_abc123xyz", // Your internal ID if you sent one
      //     "amount": 2500, // Amount in cents
      //     "status": "COMPLETED", // or "CONFIRMED", "PAID"
      //     // ... other details like timestamps, payer info (often limited for privacy)
      //   }
      // }

      const externalPixId = notificationData.data?.pix_transaction_id || notificationData.data?.transaction_id || notificationData.id;
      const status = notificationData.data?.status || notificationData.status;

      if (!externalPixId || !status) {
        console.error("pixWebhook: PIX notification missing essential data (externalId or status).", notificationData);
        return { success: false, error: "Malformed PIX notification data." };
      }

      if (status === 'COMPLETED' || status === 'CONFIRMED' || status === 'PAID') {
        console.log(`pixWebhook: PIX transaction ${externalPixId} reported as completed.`);

        // TODO: Find the corresponding payment record in your `payments` table.
        // const payment = await ctx.runQuery(internal.payments.getPaymentByExternalId, {
        //   externalPaymentId: externalPixId,
        //   paymentProvider: "pix"
        // });
        // if (payment) {
        //   if (payment.status !== "succeeded") { // Process only if not already processed
        //     // TODO: Fulfill the purchase (update user's subscription/credits).
        //     // await ctx.runMutation(internal.users.grantAccessAfterPayment, {
        //     //   userId: payment.userId,
        //     //   planId: payment.planId,
        //     //   paymentStatus: "succeeded",
        //     //   externalPaymentId: externalPixId,
        //     //   amount: payment.amount,
        //     //   currency: payment.currency
        //     // });
        //     // TODO: Update payment record status to "succeeded".
        //     // await ctx.runMutation(internal.payments.updatePaymentStatus, { paymentId: payment._id, newStatus: "succeeded" });
        //     console.log(`pixWebhook: Mock fulfillment for PIX ID ${externalPixId}.`);
        //   } else {
        //     console.log(`pixWebhook: PIX ID ${externalPixId} already processed.`);
        //   }
        // } else {
        //   console.warn(`pixWebhook: Payment record not found for PIX ID ${externalPixId}. This might be an issue or a test notification.`);
        // }
      } else if (status === 'FAILED' || status === 'EXPIRED' || status === 'CANCELED') {
        console.warn(`pixWebhook: PIX transaction ${externalPixId} has status: ${status}.`);
        // TODO: Update payment record status accordingly (e.g., to "failed" or "canceled").
        // const payment = await ctx.runQuery(internal.payments.getPaymentByExternalId, { externalPaymentId: externalPixId, paymentProvider: "pix" });
        // if (payment && payment.status !== "failed" && payment.status !== "canceled") {
        //    await ctx.runMutation(internal.payments.updatePaymentStatus, { paymentId: payment._id, newStatus: status.toLowerCase() });
        // }
      } else {
        console.log(`pixWebhook: Received PIX notification for ${externalPixId} with status ${status}. No action configured for this status.`);
      }

      return { success: true, message: "PIX Notification processed successfully (mock)." };
    } catch (err: any) {
      console.error(`pixWebhook (processPixNotification): Error processing notification: ${err.message}`, err);
      return { success: false, error: `PIX Notification processing error: ${err.message}` };
    }
  },
});

// Example HTTP Action for PIX (actual endpoint):
// import { httpAction } from "./_generated/server";
// export const pixReceiver = httpAction(async (ctx, request) => {
//   const body = await request.text(); // Or request.json() if provider sends JSON directly with correct Content-Type
//
//   // Basic check: ensure body is not empty
//   if (!body) {
//     return new Response("Error: Empty request body.", { status: 400 });
//   }
//
//   // It's good practice to offload the main processing to an internal action
//   // to keep the HTTP handler responsive and to allow for retries/scheduling if needed.
//   const result = await ctx.runAction(internal.pixWebhook.processPixNotification, {
//     notificationPayloadString: body
//   });
//
//   if (result.success) {
//     // Most PIX providers expect a 200 OK for successful receipt.
//     return new Response(JSON.stringify({ received: true, message: "PIX notification acknowledged." }), { status: 200 });
//   } else {
//     // If processing failed due to our internal logic, still might return 200 if the request was valid,
//     // or return 500 if it's an unexpected server error.
//     // If the request itself was malformed or auth failed, return 400/401/403.
//     console.error("PIX webhook internal processing failed:", result.error);
//     return new Response(JSON.stringify({ error: "Failed to process PIX notification internally." }), { status: 500 }); // Or 400 if appropriate
//   }
// });
