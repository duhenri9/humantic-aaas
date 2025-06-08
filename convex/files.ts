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
    });
  },
});

// Query to get files for the current user
export const getFilesForUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return []; // Or throw error, depending on desired behavior for unauthenticated access
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return []; // User not found in our DB, so no files
    }

    return await ctx.db
      .query("files")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc") // Show newest files first
      .collect();
  },
});

export const getFileDownloadUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    return url;
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files"), storageId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    const user = await ctx.db.query("users").withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique();
    if (!user || file.userId !== user._id) {
      throw new Error("User does not have permission to delete this file");
    }

    await ctx.db.delete(args.fileId);
    await ctx.storage.delete(args.storageId);
  },
});
