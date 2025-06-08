// convex/users.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
// Removed Id import as it's not directly used here, v.id("users") is sufficient for args.
// import { Id } from "./_generated/dataModel";

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()), // Though email changes might be complex with auth
      isOnboardingWorkflowTriggered: v.optional(v.boolean()),
      // Add other updatable fields here
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userToUpdate = await ctx.db.get(args.userId);
    // Ensure the logged-in user matches the userId they are trying to update,
    // OR that they have admin privileges (not implemented here).
    // For now, we only allow users to update their own record based on tokenIdentifier.
    if (!userToUpdate || userToUpdate.tokenIdentifier !== identity.tokenIdentifier) {
     throw new Error("User not found or permission denied to update this user.");
    }

    await ctx.db.patch(args.userId, args.updates);
    console.log(`[convex/users.ts] User ${args.userId} patched with:`, args.updates);
    return true; // Indicate success
  },
});
