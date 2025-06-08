import { query } from "./_generated/server";

// Get user record for the currently authenticated user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Not authenticated
      return null;
    }
    // `tokenIdentifier` includes the issuer prefix e.g. "https://<issuer>|<subject>"
    // It's the standard way to link auth provider data to your users table.
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      // This case implies that the user is authenticated (identity exists),
      // but their record is not in the `users` table with a matching `tokenIdentifier`.
      // This could happen if:
      // 1. The user just signed up, and the mechanism to populate the `users` table
      //    (e.g., a mutation called on first login) hasn't run or completed.
      // 2. There's a data consistency issue.
      // For now, we return null. A more robust app might return parts of the identity
      // or have a dedicated flow for new user data collection.
      console.warn(`User record not found for tokenIdentifier: ${identity.tokenIdentifier}. Identity:`, identity);
      // You could return basic info from identity if available and desired:
      // return { name: identity.name, email: identity.email, isNew: true };
      return null;
    }
    return user; // This will include custom fields like `chosenAgent` if they exist.
  },
});

// It's also common to have a mutation to store or update user data,
// often called after a user signs up or logs in.
// For example, `storeUser` as shown in Convex docs:
// https://docs.convex.dev/auth/react#linking-users-to-your-database
// This function would be called from the frontend after successful authentication.

/*
import { mutation } from "./_generated/server";
export const storeOrUpdateUser = mutation({
  args: {}, // Can take arguments if you want to pass additional info from client
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeOrUpdateUser without authentication present");
    }

    // Check if we've already stored this identity before.
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      // If we've seen this identity before, patch the user record if needed.
      // For example, if their name or email from the auth provider has changed.
      if (user.name !== identity.name || user.email !== identity.email) {
        await ctx.db.patch(user._id, { name: identity.name, email: identity.email });
      }
      return user._id;
    }

    // If it's a new identity, create a new user record.
    // This is where you would populate any default custom fields.
    return await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email,
      tokenIdentifier: identity.tokenIdentifier,
      chosenAgent: "defaultAgent", // Example default custom field
    });
  },
});
*/
