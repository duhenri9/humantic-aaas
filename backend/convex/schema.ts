import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// --- Plan and Payment Types (from previous setup) ---
const planIdType = v.string(); // Example: "monthly_tier_1", "one_time_extra_minutes_pack_1"
const paymentProviderType = v.union(
  v.literal("stripe"),
  v.literal("pix"),
  v.literal("crypto"),
  v.literal("mock")
);
const paymentStatusType = v.union(
  v.literal("pending"),
  v.literal("processing"),
  v.literal("succeeded"),
  v.literal("failed"),
  v.literal("requires_action"),
  v.literal("canceled")
);
const subscriptionStatusType = v.union(
  v.literal("free_trial"),
  v.literal("active"),
  v.literal("past_due"),
  v.literal("canceled"),
  v.literal("ended"),
  v.literal("incomplete")
);
// --- End of Plan and Payment Types ---

// --- Conversation Types ---
const agentTypeSchema = v.union(
  v.literal("Sophia"), // Empathetic, reflective agent
  v.literal("Zayn"),   // Action-oriented, practical agent
  v.literal("System") // For system messages within a conversation (e.g., "Session started")
);
const conversationStatusSchema = v.union(
  v.literal("active"),
  v.literal("ended_by_user"),
  v.literal("ended_by_agent"), // e.g. if agent has a specific goal and achieves it
  v.literal("ended_by_timeout"), // If inactive for too long
  v.literal("archived") // User archives it
);
const messageSenderSchema = v.union(
  v.literal("user"),
  v.literal("agent"),
  v.literal("system") // For meta-messages like "Conversation started with Sophia"
);
// --- End of Conversation Types ---


export default defineSchema({
  users: defineTable({
    // Auth related
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    // pictureUrl: v.optional(v.string()),

    // App-specific user settings
    chosenAgent: v.optional(agentTypeSchema), // User's preferred agent type

    // Subscription & Credits
    activePlanId: v.optional(planIdType),
    subscriptionStatus: v.optional(subscriptionStatusType),
    subscriptionId: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    availableCredits: v.optional(v.number()), // General purpose credits for interactions

    // Payment provider specific
    stripeCustomerId: v.optional(v.string()),

  }).index("by_token", ["tokenIdentifier"])
    .index("by_stripe_customer_id", ["stripeCustomerId"])
    .index("by_subscription_id", ["subscriptionId"]),

  payments: defineTable({
    userId: v.id("users"),
    planId: v.optional(planIdType),
    description: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    paymentProvider: paymentProviderType,
    externalPaymentId: v.string(),
    status: paymentStatusType,
  }).index("by_userId", ["userId"])
    .index("by_externalPaymentId", ["externalPaymentId"])
    .index("by_status", ["status"]),

  // New 'conversations' table
  conversations: defineTable({
    userId: v.id("users"),
    agentType: agentTypeSchema,
    startTime: v.number(),
    lastActivityTime: v.number(),
    status: conversationStatusSchema,
    title: v.optional(v.string()), // User-set or auto-generated title (e.g., first few words of user message)
    // summary: v.optional(v.string()), // AI-generated summary upon conversation end
  }).index("by_user_and_status", ["userId", "status"])
    .index("by_userId_and_lastActivity", ["userId", "lastActivityTime"]),

  // New 'messages' table
  messages: defineTable({
    conversationId: v.id("conversations"),
    // userId: v.id("users"), // Denormalizing userId here can be useful but also redundant if always fetching via conversation.
                           // If messages can exist outside a user's conversation (e.g. system announcements), then it's needed.
                           // For this app, messages are tightly coupled to a conversation, which has a userId.
    sender: messageSenderSchema,
    text: v.string(),
    timestamp: v.number(),

    // Optional fields for agent messages (LLM interaction details)
    llmModelUsed: v.optional(v.string()),
    // llmPrompt: v.optional(v.string()), // Can be very large, consider if truly needed on every message vs. storing elsewhere or reconstructing
    llmPromptTokens: v.optional(v.number()),
    llmResponseTokens: v.optional(v.number()),
    llmResponseId: v.optional(v.string()), // ID from LLM provider for tracing/logging

    // Optional fields for user messages if using STT
    // audioUrl: v.optional(v.string()), // URL to stored audio of user's message
    // audioDurationMs: v.optional(v.number()),

    // Optional for message feedback
    // rating: v.optional(v.number()), // e.g., 1-5 stars
    // feedbackText: v.optional(v.string()), // User comments on the message
  }).index("by_conversation_and_timestamp", ["conversationId", "timestamp"]),
});
