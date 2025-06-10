// convex/proposals.ts
import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ProposalFormData type would ideally be shared from src/types.ts if possible,
// or redefined here if necessary. For now, defining args explicitly.
export const createProposalRecord = mutation({
  args: {
    clientName: v.string(),
    clientEmail: v.string(),
    projectName: v.string(),
    scope: v.string(),
    price: v.string(),
    currency: v.string(),
    paymentTerms: v.string(),
    validityPeriod: v.string(),
    generatedPdfUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db.query("users").withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique();
    if (!user) throw new Error("User not found");

    const proposalId = await ctx.db.insert("proposals", {
      ...args,
      userId: user._id, // User who created it
      tenantId: user.tenantId, // Associate with user's tenant
      assiniSignatureRequestId: undefined, // Ensure optional fields not in args are handled
      assiniSignatureStatus: "draft", // Initial status
      // _creationTime is automatically added by Convex
    });
    console.log(`[Proposals] Proposal ${proposalId} created by User ${user._id} for Tenant ${user.tenantId || 'N/A'}`);
    return proposalId;
  },
});

export const getProposalsForUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db.query("users").withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique();
    if (!user) return [];

    // Fetches proposals primarily by userId.
    const proposals = await ctx.db.query("proposals")
                              .withIndex("by_userId", q => q.eq("userId", user._id))
                              .order("desc")
                              .collect();

    // Further filter by tenant context for non-head_ops roles
    if (user.role === "head_ops") {
        // Head ops see all proposals they created.
        // A separate admin query would be needed to see all proposals across all tenants/users.
        return proposals;
    } else if (user.tenantId) {
        // Franchisee users or clients associated with a tenant only see proposals matching their tenantId
        return proposals.filter(p => p.tenantId === user.tenantId);
    } else {
        // Users not associated with any tenant (e.g. direct clients of HumanTic)
        // only see proposals that also have no tenantId.
        return proposals.filter(p => !p.tenantId);
    }
  },
});

export const updateProposalWithSignatureInfo = mutation({
     args: {
         proposalId: v.id("proposals"),
         signatureRequestId: v.string(),
         initialStatus: v.string() // e.g., "sent"
     },
     handler: async (ctx, args) => {
         const identity = await ctx.auth.getUserIdentity();
         if (!identity) throw new Error("Not authenticated");

         const proposal = await ctx.db.get(args.proposalId);
         if(!proposal) throw new Error("Proposal not found");

         const user = await ctx.db.query("users").withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique();
         if (!user) throw new Error("User not found");

         // Permission check: Only owner or relevant admin can update.
         // For simplicity, only owner who is also in the same tenant context (if applicable).
         if (proposal.userId !== user._id) {
            throw new Error("User does not have permission to update this proposal (not owner).");
         }
         if (user.role !== "head_ops" && proposal.tenantId !== user.tenantId) {
            throw new Error("User does not have permission to update this proposal (tenant mismatch).");
         }

         await ctx.db.patch(args.proposalId, {
             assiniSignatureRequestId: args.signatureRequestId,
             assiniSignatureStatus: args.initialStatus,
         });
         console.log(`[Proposals] Proposal ${args.proposalId} updated with signature info by User ${user._id}. Request ID: ${args.signatureRequestId}`);
     }
});

 // Internal mutation for webhook updates to proposal signature status
 export const updateProposalSignatureStatus = internalMutation({
     args: {
        signatureRequestId: v.string(),
        newStatus: v.string(),
        // Potentially include other details from webhook like signed_at, signed_by, etc.
        // signedDocumentUrl: v.optional(v.string())
     },
     handler: async (ctx, args) => {
         const proposal = await ctx.db.query("proposals")
             .withIndex("by_assini_request_id", q => q.eq("assiniSignatureRequestId", args.signatureRequestId)) // Assumes such an index exists
             .unique();

         if (proposal) {
             await ctx.db.patch(proposal._id, {
                assiniSignatureStatus: args.newStatus,
                // signedDocumentUrl: args.signedDocumentUrl
             });
             console.log(`[Proposals] Signature status for Assini Request ID ${args.signatureRequestId} (Proposal ${proposal._id}) updated to: ${args.newStatus}`);

             // If signed, potentially trigger next step in client journey or n8n workflow
             if (args.newStatus === "signed") {
                // Example: update client journey step for contract signature
                // const user = await ctx.db.get(proposal.userId);
                // if (user) {
                //    await ctx.db.patch(user._id, { journeyStep_Contract_Signed: true });
                // }
             }
         } else {
             console.warn(`[Proposals] No proposal found with Assini Signature Request ID: ${args.signatureRequestId}. Cannot update status.`);
         }
     }
 });
