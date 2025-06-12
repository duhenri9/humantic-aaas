import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  files: defineTable({
    name: v.string(),
    type: v.string(),
    size: v.number(),
    storageId: v.id("_storage"),
    uploadedBy: v.id("users"),
    uploadedAt: v.number(),
    description: v.optional(v.string()),
  })
    .index("by_user", ["uploadedBy"])
    .index("by_upload_date", ["uploadedAt"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
