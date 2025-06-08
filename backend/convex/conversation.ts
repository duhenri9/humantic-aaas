import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api"; // For potential internal calls
import { agentTypeSchema } from "./schema"; // Import if defined in schema.ts and exported

// Agent definitions for mock responses
// Ensure agent names here match exactly those in `agentTypeSchema` in schema.ts
const AGENT_PERSONAS = {
  "Sophia": {
    name: "Sophia" as const, // Use "as const" for stronger typing if agentTypeSchema is very specific
    greeting: "Hello there. I'm Sophia, here to listen and help you reflect. What's on your mind today?",
    mockResponses: [
      "That sounds like an important realization. How does that make you feel?",
      "I hear you. It takes courage to explore these feelings. What comes up for you as you say that?",
      "Thank you for sharing that. It seems like you're navigating a complex situation.",
      "Let's pause on that for a moment. What sensations are you noticing in your body as you consider this?",
      "That's a very insightful point. What do you make of it?",
    ],
  },
  "Zayn": {
    name: "Zayn" as const,
    greeting: "Hi, I'm Zayn. I'm here to help you find practical steps and solutions. What challenge are we tackling?",
    mockResponses: [
      "Understood. What's the first small step you could take towards that?",
      "Okay, that's clear. What resources do you have available, and what might you need?",
      "That makes sense. Have you considered an alternative approach, like X or Y?",
      "Let's break that down. What are the key obstacles, and how can we address them one by one?",
      "Good. What would success look like for this particular issue?",
    ],
  },
  "System": { // Fallback, should not be chosen by user directly for conversation
    name: "System" as const,
    greeting: "System is ready.",
    mockResponses: ["Message acknowledged by System."]
  }
};

// Utility for simulated delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mutation to allow user to set their chosenAgent
export const updateUserChosenAgent = mutation({
    args: {
      // Use the same v.union as in schema.ts for agentType if it's simple enough,
      // or import agentTypeSchema if exported from schema.ts
      agentType: v.union(v.literal("Sophia"), v.literal("Zayn"))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("User must be authenticated.");

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();
        if (!user) throw new Error("User not found in database.");

        await ctx.db.patch(user._id, { chosenAgent: args.agentType });
        console.log(`User ${user._id} updated chosenAgent to ${args.agentType}`);
        return { success: true, chosenAgent: args.agentType };
    },
});

export const startConversation = mutation({
  args: {
    // agentType is now required to start a conversation.
    // UI should ensure user.chosenAgent is used or user selects one.
    agentType: v.union(v.literal("Sophia"), v.literal("Zayn")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User must be authenticated.");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found.");

    const agentToUse = args.agentType;
    // Ensure chosenAgent is also updated on the user if this startConversation implies a selection
    if (user.chosenAgent !== agentToUse) {
        await ctx.db.patch(user._id, { chosenAgent: agentToUse });
    }

    const now = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      userId: user._id,
      agentType: agentToUse,
      startTime: now,
      lastActivityTime: now,
      status: "active",
      title: `Chat with ${agentToUse} - ${new Date(now).toLocaleDateString()}` // Example title
    });

    const agentPersona = AGENT_PERSONAS[agentToUse];
    await ctx.db.insert("messages", {
        conversationId: conversationId,
        sender: "agent",
        text: agentPersona.greeting,
        timestamp: now + 1,
        llmModelUsed: "greeting_logic_v1",
    });

    console.log(`conversation.startConversation: User ${user._id} started conv ${conversationId} with ${agentToUse}.`);
    return conversationId;
  },
});

export const sendMessageToAgent = mutation({
  args: {
    conversationId: v.id("conversations"),
    userMessageText: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User must be authenticated.");

    const user = await ctx.db.query("users").withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique();
    if (!user) throw new Error("User not found.");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== user._id) throw new Error("Conversation not found or access denied.");
    if (conversation.status !== "active") throw new Error("This conversation is no longer active.");

    // TODO: Implement credit/usage limit checks using user.availableCredits
    // if (user.availableCredits !== undefined && user.availableCredits <= 0) {
    //   await ctx.db.insert("messages", { /* system message: out of credits */ });
    //   throw new Error("You have run out of interaction credits.");
    // }

    const now = Date.now();
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      sender: "user",
      text: args.userMessageText,
      timestamp: now,
    });
    await ctx.db.patch(args.conversationId, { lastActivityTime: now });

    const agentType = conversation.agentType;
    const agentPersona = AGENT_PERSONAS[agentType] || AGENT_PERSONAS["System"];

    // --- Mock LLM Call & Agent Response ---
    // TODO: Replace with actual LLM API call (e.g., OpenAI, Anthropic, Gemini)
    // 1. Retrieve LLM API Key from Convex environment variables (e.g., process.env.OPENAI_API_KEY)
    // 2. Construct the prompt:
    //    - Include system prompt (agent persona, instructions).
    //    - Format conversation history (last N messages).
    //    - Add current user message.
    // 3. Make the API call to the LLM provider.
    // 4. Handle LLM response (extract text, token counts, response ID).
    // 5. Implement error handling for LLM API calls.

    await delay(700 + Math.random() * 800); // Simulate LLM response latency

    const mockAgentResponseText = agentPersona.mockResponses[
      Math.floor(Math.random() * agentPersona.mockResponses.length)
    ];

    // TODO: Decrement user credits if applicable (e.g., based on token usage or per-message)
    // if (user.availableCredits !== undefined) {
    //   await ctx.db.patch(user._id, { availableCredits: user.availableCredits - 1 });
    // }

    const agentMessageTimestamp = Date.now();
    const agentMessage = {
      conversationId: args.conversationId,
      sender: "agent" as "agent",
      text: mockAgentResponseText,
      timestamp: agentMessageTimestamp,
      llmModelUsed: "mock_rules_v1",
    };
    await ctx.db.insert("messages", agentMessage);
    await ctx.db.patch(args.conversationId, { lastActivityTime: agentMessageTimestamp });

    console.log(`conversation.sendMessageToAgent: User ${user._id} to conv ${args.conversationId}. Agent ${agentType} mock reply.`);
    return agentMessage;
  },
});

export const getConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User must be authenticated.");

    const user = await ctx.db.query("users").withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique();
    if (!user) throw new Error("User not found.");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== user._id) throw new Error("Conversation not found or access denied.");

    return await ctx.db
      .query("messages")
      .withIndex("by_conversation_and_timestamp", q => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
  },
});

// (Optional: Mutation to end a conversation)
// export const endConversation = mutation({
//   args: { conversationId: v.id("conversations"), reason: conversationStatusSchema },
//   handler: async (ctx, args) => { /* ... update conversation.status ... */ }
// });
