// convex/http.ts
import { httpRouter } from "convex/server";
import { createCheckoutSession, stripeWebhookHandler } from "./stripe"; // Import both actions

const http = httpRouter();

// Stripe routes
http.route({
  path: "/stripe/create-checkout-session",
  method: "POST",
  handler: createCheckoutSession,
});

http.route({
  path: "/stripe/webhooks", // This is the URL you provide to Stripe
  method: "POST",
  handler: stripeWebhookHandler,
});

// If you have other HTTP endpoints, for example, for webhooks from other services,
// you would register them here as well.

// Convex Auth typically uses its own mechanisms and might not require explicit HTTP routes here
// unless you are implementing a very custom auth flow (e.g. with custom token exchange).

export default http;
