import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Utility function for simulating delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mock plan details (could be shared or fetched from a common source)
interface PlanDetails {
  id: string;
  name: string;
  priceAmount: number; // e.g., 500 for R$5,00 (BRL cents)
  currency: string; // "brl"
}
const MOCK_PLANS_BRL: Record<string, PlanDetails> = {
  "monthly_tier_1_brl": { id: "monthly_tier_1_brl", name: "Plano Mensal Básico", priceAmount: 2500, currency: "brl" }, // R$25,00
  "one_time_credits_pack_1_brl": { id: "one_time_credits_pack_1_brl", name: "Pacote 50 Créditos", priceAmount: 1000, currency: "brl" }, // R$10,00
};

export const createPixOrder = mutation({
  args: {
    planId: v.string(), // e.g., "monthly_tier_1_brl"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated to create a PIX order.");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("Authenticated user not found in database.");
    }

    // TODO: Retrieve PIX provider API Key/credentials from environment variables
    // const pixProviderApiKey = process.env.PIX_PROVIDER_API_KEY;
    // if (!pixProviderApiKey) {
    //   throw new Error("PIX_PROVIDER_API_KEY is not set in Convex backend environment.");
    // }
    // const pixClient = new PixProviderClient(pixProviderApiKey); // Initialize PIX SDK

    const planDetails = MOCK_PLANS_BRL[args.planId]; // Assuming a BRL plan for PIX
    if (!planDetails) {
      throw new Error(`Invalid PIX planId: ${args.planId}. Details not found.`);
    }
    if (planDetails.currency.toLowerCase() !== "brl") {
        throw new Error(`Plan ${args.planId} is not in BRL, PIX payments are typically for BRL.`);
    }

    console.log(`pixPayment: User ${user._id} creating PIX order for plan: ${args.planId}`);

    // Simulate API call to PIX provider
    await delay(800); // Simulate 0.8 seconds delay

    // In a real implementation:
    // 1. Call your PIX provider's API to generate a new PIX charge.
    //    This would involve sending amount, description, customer details (name, CPF/CNPJ).
    //    const pixOrderResponse = await pixClient.charges.create({
    //      amount: planDetails.priceAmount, // in BRL cents
    //      description: `Pagamento para ${planDetails.name} - tell.me.more`,
    //      customer: { name: user.name, email: user.email, document: "user_cpf_or_cnpj" }, // CPF/CNPJ is often required
    //      // additional provider-specific parameters, like expiry time for the PIX code
    //    });
    //
    // 2. Optionally, create a preliminary payment record in your `payments` table.
    //    const paymentId = await ctx.db.insert("payments", {
    //      userId: user._id,
    //      planId: args.planId,
    //      amount: planDetails.priceAmount,
    //      currency: "brl",
    //      paymentProvider: "pix",
    //      externalPaymentId: pixOrderResponse.id, // ID from PIX provider's system
    //      status: "pending",
    //      description: planDetails.name,
    //    });
    //    console.log(`pixPayment: Pending PIX payment record created with ID: ${paymentId}`);
    //
    // 3. Return the PIX QR code data (string for "copia e cola" - EMV format) and/or payment ID.
    //    return {
    //      qrCodeData: pixOrderResponse.qr_code_emv, // Or similar field name
    //      paymentId: pixOrderResponse.id,
    //      expiresAt: pixOrderResponse.expires_at // Timestamp
    //    };

    const mockPixPaymentId = `pix_mock_${args.planId}_${Date.now()}`;
    // This is a simplified mock PIX "Copia e Cola" string. Real ones are more complex.
    const mockQrCodeData = `00020126580014BR.GOV.BCB.PIX0136${mockPixPaymentId.replace(/\./g, '')}520400005303986540${(planDetails.priceAmount / 100).toFixed(2).replace('.', '')}5802BR5913Mock User Name6009SAO PAULO62070503***6304ABCD`;
    const mockExpiryTime = Date.now() + (30 * 60 * 1000); // Mock expiry in 30 minutes

    console.log("pixPayment: Returning mock PIX data.");
    return {
      qrCodeData: mockQrCodeData,
      paymentId: mockPixPaymentId,
      expiresAt: mockExpiryTime
    };
  },
});
