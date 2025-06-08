// convex/auth.ts
import { mutation, query } from "./_generated/server";
import { Auth, UserIdentity } from "convex/server";
import { v } from "convex/values";

// Store user-specific data.
export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity: UserIdentity | null = await ctx.auth.getUserIdentity();
    if (identity === null) {
      // User is not authenticated, or session is invalid
      console.log("User not authenticated, cannot store user.");
      return null;
    }

    // Check if we've already stored this user.
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      // If we've seen this identity before but the name has changed, patch the user.
      // Also check email, as it might be populated or changed.
      if (user.name !== identity.name || user.email !== identity.email) {
        await ctx.db.patch(user._id, { name: identity.name, email: identity.email });
      }
      return user._id;
    }
    // If it's a new identity, create a new user.
    return await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email!, // Email should be present with most auth providers
      tokenIdentifier: identity.tokenIdentifier,
    });
  },
});

// Get the current user from the identity, or null if not authenticated.
// This is useful for loading user data on the client.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null; // Not authenticated
    }
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
  },
});
