// convex/files.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
// import { internal } from "./_generated/api"; // For potential internal calls - not used in this snippet

// Mutation to generate a short-lived upload URL for the client
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Mutation to save file metadata after client confirms upload
export const saveFile = mutation({
  args: {
    storageId: v.string(),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    // userId will be derived from authentication context
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated.");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found.");
    }

    await ctx.db.insert("files", {
      name: args.name,
      type: args.type,
      size: args.size,
      storageId: args.storageId,
      userId: user._id,
       tenantId: user.tenantId, // Assign user's tenantId to the file
    });
  },
});

export const getFilesForUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
     if (!identity) return [];

    const user = await ctx.db
      .query("users")
       .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
     if (!user) return [];

     // This query fetches files primarily by userId.
     // Further client-side filtering or more complex queries might be needed for strict tenant views for admins.
     // For a typical user (client, franchisee_user), they should only see their own files.
     // If they belong to a tenant, their files will be tagged with that tenantId.
     const files = await ctx.db
      .query("files")
       .withIndex("by_userId", (q) => q.eq("userId", user._id)) // Ensures users only see their own files
       .order("desc")
      .collect();

     // If strict tenant separation is required for non-head_ops roles at the query level:
     if (user.role === "head_ops") {
         // Head ops can see all files they uploaded, regardless of tenantId (some might be null, some might be associated if they acted within a tenant context)
         return files;
     } else if (user.tenantId) {
         // Franchisee users or clients associated with a tenant only see files matching their tenantId
         return files.filter(file => file.tenantId === user.tenantId);
     } else {
         // Users not associated with any tenant (e.g. direct clients of HumanTic before tenancy model fully applied)
         // only see files that also have no tenantId.
         return files.filter(file => !file.tenantId);
     }
  },
});

export const getFileDownloadUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
     // Basic permission check: ensure user is authenticated before providing a download URL.
     // More granular checks (e.g., does this user own the file or have tenant access?) would require
     // passing fileId or more context, or this query could be internal and wrapped by another.
     const identity = await ctx.auth.getUserIdentity();
     if (!identity) throw new Error("Not authenticated to get download URL.");

     // For now, if authenticated, allow URL generation. Access control to the storageId itself is key.
    const url = await ctx.storage.getUrl(args.storageId);
    return url;
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files"), storageId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

     const user = await ctx.db.query("users").withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique();
     if (!user) throw new Error("User not found");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

     // Ownership check
     if (file.userId !== user._id) {
       throw new Error("User does not have permission to delete this file (not owner).");
    }

     // Tenant scope check
     if (user.role !== "head_ops" && file.tenantId !== user.tenantId) {
         // Non-head_ops users can only delete files matching their own tenantId context,
         // or files without a tenantId if they themselves don't have one.
         throw new Error("User does not have permission to delete this file (tenant mismatch).");
     }
     // Head_ops can delete any file they own, regardless of tenantId mismatch (e.g. if they uploaded files into various tenant contexts or outside of them)
     // For deleting files not owned by them, a separate adminDeleteFile mutation would be required.

    await ctx.db.delete(args.fileId);
    await ctx.storage.delete(args.storageId);
     console.log(`File ${args.fileId} (StorageID: ${args.storageId}) deleted by user ${user._id}`);
  },
});
