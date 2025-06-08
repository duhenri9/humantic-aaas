import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
  args: {
    author: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    // Placeholder: In a real app, you would insert the message into the database.
    // Example: await ctx.db.insert("messages", { author: args.author, body: args.body });
    console.log(`Message from ${args.author}: ${args.body}`);
    // Return the "id" of the created message, or some confirmation.
    return { success: true, messageId: `temp-${Date.now()}` };
  },
});
