import { query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    // Placeholder: In a real app, you would fetch messages from the database.
    // For now, we'll return a static list or an empty array.
    // Example: return await ctx.db.query("messages").collect();
    return [
      { author: "System", body: "Welcome! No messages yet.", _id: "1", _creationTime: Date.now() },
    ];
  },
});
