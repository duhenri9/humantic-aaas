// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define roles as a union type for better type safety if used in functions,
// though in schema it's just v.string() for now.
// export type UserRole = "client" | "franchisee_admin" | "franchisee_user" | "head_ops";

export default defineSchema({
  tenants: defineTable({
    name: v.string(), // Franchisee's business name
    ownerUserId: v.id("users"), // The main admin user ID for this tenant
    customDomain: v.optional(v.string()),
    brandingLogoUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    // createdAt will be automatically added by Convex (_creationTime)
  }).index("by_ownerUserId", ["ownerUserId"]),

  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    companyName: v.optional(v.string()), // Client's company name, or Franchisee's if they are a user
    tokenIdentifier: v.string(), // From Convex Auth
    role: v.string(), // e.g., "client", "franchisee_admin", "head_ops"
    tenantId: v.optional(v.id("tenants")), // Link to the tenant if user belongs to one

    // Existing fields from previous phases
    isOnboardingWorkflowTriggered: v.optional(v.boolean()),
    stripeCustomerId: v.optional(v.string()),
    stripePaymentStatus: v.optional(v.string()),
    lastStripeCheckoutSessionId: v.optional(v.string()),
    journeyStep_Payment_Completed: v.optional(v.boolean()),
  })
  .index("by_token", ["tokenIdentifier"])
  .index("by_email", ["email"]) // Good to have for lookups if email is unique identifier
  .index("by_tenantId", ["tenantId"]) // For querying users by tenant
  .index("by_stripe_customer_id", ["stripeCustomerId"]), // Existing index

  files: defineTable({
    userId: v.id("users"),
    tenantId: v.optional(v.id("tenants")), // For data segregation by tenant
    name: v.string(),
    type: v.string(), // Mime type
    size: v.number(),
    storageId: v.string(), // From Convex storage
  })
  .index("by_userId", ["userId"]) // Existing index
  .index("by_tenantId_userId", ["tenantId", "userId"]), // New compound index

  proposals: defineTable({
    userId: v.id("users"), // User who created/owns this proposal (could be franchisee or Head Ops)
    tenantId: v.optional(v.id("tenants")), // Tenant this proposal belongs to (if created by/for a franchisee's client)
    clientName: v.string(),
    clientEmail: v.string(),
    projectName: v.string(),
    scope: v.string(), // Potentially large text
    price: v.string(), // Or v.number()
    currency: v.string(),
    paymentTerms: v.string(),
    validityPeriod: v.string(),
    generatedPdfUrl: v.optional(v.string()),
    assiniSignatureRequestId: v.optional(v.string()),
    assiniSignatureStatus: v.optional(v.string()), // e.g., "sent", "signed", "declined"
    // status: v.string() // Overall proposal status e.g. "draft", "sent", "accepted", "declined"
  })
  .index("by_userId", ["userId"])
  .index("by_tenantId", ["tenantId"])
  .index("by_clientEmail", ["clientEmail"]) // If proposals are often looked up by client email
  .index("by_assini_request_id", ["assiniSignatureRequestId"]), // For webhook updates
});
