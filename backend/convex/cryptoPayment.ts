import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Utility function for simulating delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Define supported crypto types - could be expanded
const cryptoTypeSchema = v.union(
  v.literal("ETH"),
  v.literal("USDC_ETH"), // USDC on Ethereum (ERC-20)
  v.literal("BTC"),
  v.literal("SOL_USDC") // USDC on Solana (SPL Token)
);

// Mock plan details (could be shared or fetched from a common source)
interface PlanDetails {
  id: string;
  name: string;
  priceUSD: number; // Price in USD for conversion reference
}
const MOCK_PLANS_USD_VALUE: Record<string, PlanDetails> = {
  "monthly_tier_1": { id: "monthly_tier_1", name: "Monthly Basic Plan", priceUSD: 5.00 },
  "one_time_credits_pack_1": { id: "one_time_credits_pack_1", name: "100 Credits Pack", priceUSD: 10.00 },
};

// Highly simplified mock conversion rates - DO NOT USE IN PRODUCTION
const MOCK_EXCHANGE_RATES: Record<string, number> = {
  "ETH": 3000,  // 1 ETH = 3000 USD
  "USDC_ETH": 1, // 1 USDC = 1 USD
  "BTC": 60000, // 1 BTC = 60000 USD
  "SOL_USDC": 1, // 1 USDC on Solana = 1 USD
};

export const createCryptoPaymentIntent = mutation({
  args: {
    planId: v.string(),        // e.g., "monthly_tier_1"
    cryptoType: cryptoTypeSchema, // e.g., "ETH", "USDC_ETH"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated to create a crypto payment intent.");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("Authenticated user not found in database.");
    }

    // TODO: Integrate with a crypto payment processor (e.g., Coinbase Commerce, BitPay)
    // OR use direct wallet interaction logic (more complex, involves managing private keys securely if generating addresses on the fly).
    // const cryptoPaymentProcessorApiKey = process.env.CRYPTO_PROCESSOR_API_KEY;
    // if (!cryptoPaymentProcessorApiKey && !process.env.IS_DIRECT_CRYPTO_HANDLING_ENABLED) {
    //   throw new Error("Crypto payment provider not configured.");
    // }

    console.log(`cryptoPayment: User ${user._id} creating ${args.cryptoType} payment intent for plan: ${args.planId}`);

    const planDetails = MOCK_PLANS_USD_VALUE[args.planId];
    if (!planDetails) {
      throw new Error(`Invalid planId for crypto payment: ${args.planId}. USD value not found.`);
    }

    // Simulate fetching current exchange rate and calculating crypto amount
    // IMPORTANT: In a real app, use a reliable oracle or exchange API for rates.
    const rate = MOCK_EXCHANGE_RATES[args.cryptoType];
    if (!rate) {
      throw new Error(`Unsupported crypto type or missing exchange rate: ${args.cryptoType}`);
    }
    const amountDueInCrypto = (planDetails.priceUSD / rate).toFixed(8); // Format to typical crypto precision

    await delay(700); // Simulate address generation or API call to processor

    // In a real implementation with a payment processor:
    // 1. Call the processor's API to create a charge/invoice.
    //    const charge = await cryptoProcessor.charges.create({
    //      name: planDetails.name,
    //      description: `Payment for ${planDetails.name} - tell.me.more`,
    //      pricing_type: "fixed_price", // Or "no_price" if you send crypto amounts directly
    //      local_price: { amount: planDetails.priceUSD.toString(), currency: "USD" },
    //      // requested_info: ['email'], // If you want processor to collect email
    //      metadata: { convexUserId: user._id, planId: args.planId, requestedCrypto: args.cryptoType }
    //    });
    //
    // 2. Optionally, store a preliminary payment record in your `payments` table.
    //    const paymentId = await ctx.db.insert("payments", {
    //      userId: user._id,
    //      planId: args.planId,
    //      amount: parseFloat(amountDueInCrypto) * (10**8), // Example: store in smallest unit like satoshis for BTC, wei for ETH
    //      currency: args.cryptoType,
    //      paymentProvider: "crypto",
    //      externalPaymentId: charge.code, // Processor's charge ID/code
    //      status: "pending",
    //      description: planDetails.name,
    //    });
    //
    // 3. Return payment details (deposit address, QR code data, amounts) from the processor's response.
    //    The processor provides addresses or a hosted payment page.
    //    return {
    //      paymentId: charge.code,
    //      paymentAddress: charge.addresses[args.cryptoType], // Example structure
    //      amountDue: charge.pricing[args.cryptoType].amount,
    //      currency: args.cryptoType,
    //      hostedUrl: charge.hosted_url, // Link to processor's payment page
    //    };

    // If handling directly (very complex, generally not recommended for many use cases):
    // - Generate a unique, unused address for this user and payment from your HD wallet.
    // - Monitor blockchain for incoming transaction to this address for the specific amount.

    const mockPaymentId = `crypto_mock_${args.planId}_${args.cryptoType}_${Date.now()}`;
    const mockPaymentAddress = args.cryptoType === "BTC"
      ? `mock_btc_address_${user._id.substring(0,4)}_${Date.now().toString().slice(-3)}`
      : `0xMock${args.cryptoType.replace('_', '')}Addr${user._id.substring(0,4)}${Date.now().toString().slice(-3)}`;

    console.log("cryptoPayment: Returning mock crypto payment details.");
    return {
      paymentId: mockPaymentId,
      paymentAddress: mockPaymentAddress,
      amountDue: amountDueInCrypto,
      currency: args.cryptoType,
      // Example QR code data (varies by crypto)
      // qrCodeData: args.cryptoType === "BTC" ? `bitcoin:${mockPaymentAddress}?amount=${amountDueInCrypto}` : `ethereum:${mockPaymentAddress}?value=${amountDueInCrypto}e18` (for ETH in wei)
    };
  },
});
