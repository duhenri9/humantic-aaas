// convex/auth.ts
import { mutation, query } from "./_generated/server";
import { UserIdentity } from "convex/server";
import { v } from "convex/values";
// import { Id } from "./_generated/dataModel"; // Not strictly needed here

// Default role for new users if not specified otherwise
const DEFAULT_USER_ROLE = "client";

export const storeUser = mutation({
  args: {
    // Optional: Explicitly pass role/tenantId if the calling context (e.g. an admin panel or specific signup flow) knows it.
    // For generic post-authentication call, these might be harder to determine without more logic.
    // role: v.optional(v.string()),
    // tenantId: v.optional(v.id("tenants")),
  },
  handler: async (ctx) => {
    const identity: UserIdentity | null = await ctx.auth.getUserIdentity();
    if (identity === null) {
      console.log("User not authenticated, cannot store user.");
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (user !== null) {
      // User exists. Patch if name/email changed. Role/tenantId typically not changed here by storeUser.
      let updates: Partial<typeof user> = {};
      if (user.name !== identity.name) updates.name = identity.name;
      if (user.email !== identity.email) updates.email = identity.email;
      // companyName could be updated if identity provides it, e.g. identity.companyName
      // For now, assume companyName is set via updateUser mutation or at creation if passed as arg.

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(user._id, updates);
      }
      return user._id;
    }

    // New user: Insert with default role. TenantId would ideally come from context (e.g. invite)
    // or be set by an admin later. For now, new users might not have a tenantId directly from storeUser.
    console.log(`[storeUser] Creating new user: ${identity.email}, Name: ${identity.name}`);
    return await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email!,
      companyName: undefined, // Or from identity if available, e.g. identity.companyName
      tokenIdentifier: identity.tokenIdentifier,
      role: DEFAULT_USER_ROLE, // Default role for new users
      tenantId: undefined, // New users created this way don't get a tenantId by default
                           // This needs to be assigned via another process (e.g. admin, franchisee invite)
      // Initialize other optional fields
      isOnboardingWorkflowTriggered: false,
      journeyStep_Payment_Completed: false,
      stripePaymentStatus: 'unpaid', // Default payment status
      // lastStripeCheckoutSessionId will be undefined initially
    });
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return null;

    // Potentially fetch tenant details if tenantId exists and role is franchisee_admin/user
    // For now, just return the user object which includes role and tenantId.
    return user;
  },
});
