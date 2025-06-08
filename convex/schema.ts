// convex/schema.ts
// Add 'files' table to the existing schema
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    tokenIdentifier: v.string(),
       isOnboardingWorkflowTriggered: v.optional(v.boolean()), // New field
  }).index("by_token", ["tokenIdentifier"]),

  files: defineTable({
    name: v.string(),
    type: v.string(), // Mime type
    size: v.number(),
    storageId: v.string(), // From Convex storage
    userId: v.id("users"), // Link to the user who uploaded it
    // Potentially add: SHA256 checksum for deduplication/integrity if needed later
  }).index("by_userId", ["userId"]),
  // ... other tables
});
