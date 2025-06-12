import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to upload files");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFile = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to save files");
    }

    const fileId = await ctx.db.insert("files", {
      name: args.name,
      type: args.type,
      size: args.size,
      storageId: args.storageId,
      uploadedBy: userId,
      uploadedAt: Date.now(),
      description: args.description,
    });

    return fileId;
  },
});

export const getUserFiles = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const files = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("uploadedBy", userId))
      .order("desc")
      .take(args.limit ?? 50);

    return Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.storageId),
      }))
    );
  },
});

export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to delete files");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    if (file.uploadedBy !== userId) {
      throw new Error("You can only delete your own files");
    }

    await ctx.storage.delete(file.storageId);
    await ctx.db.delete(args.fileId);
  },
});

export const getFileStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { totalFiles: 0, totalSize: 0 };
    }

    const files = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("uploadedBy", userId))
      .collect();

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    return {
      totalFiles: files.length,
      totalSize,
    };
  },
});
