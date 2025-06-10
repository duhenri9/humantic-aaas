// src/types.ts
import type { Id } from "../convex/_generated/dataModel"; // Path for types file in src/

export type ConvexId<T extends string> = string & { __tableName?: T };
export type ConvexUserId = ConvexId<"users">;

export interface UserData {
  _id: Id<"users">;
  _creationTime: number;
  email: string;
  name?: string;
  companyName?: string;
  tokenIdentifier: string; // From Convex Auth Identity, used to link
  role: string; // e.g., "client", "franchisee_admin", "head_ops"
  tenantId?: Id<"tenants">;

  // Optional fields from previous phases (ensure these match your users table schema)
  isOnboardingWorkflowTriggered?: boolean;
  stripeCustomerId?: string;
  stripePaymentStatus?: string;
  lastStripeCheckoutSessionId?: string;
  journeyStep_Payment_Completed?: boolean;
  // Add any other fields from users schema if they need to be accessed on client:
  // e.g. profileImageUrl?: string;
}

export interface ProposalFormData {
  clientName: string;
  clientEmail: string;
  projectName: string;
  scope: string;
  price: string;
  currency: string;
  paymentTerms: string;
  validityPeriod: string;
  // Consider adding userId and tenantId here if they are part of the form's data context
  // userId?: ConvexUserId | string;
  // tenantId?: ConvexId<"tenants"> | string;
}

export interface FileEntry {
   _id: Id<"files">; // Using Convex Id type
   name: string;
   type: string; // Mime type
   size: number;
   storageId: string;
   userId: Id<"users">; // Ensuring this uses Convex Id type
   tenantId?: Id<"tenants">; // Optional tenant association
   _creationTime: number;
}

// This was defined in n8nService.ts, can be shared here if used by other frontend parts
export interface OnboardingData {
     userId: ConvexUserId | string;
     email?: string;
     planId?: string;
     timestamp: string;
}

// Example for ClientJourneyStep if it were to be managed via props/state widely
// export interface ClientJourneyStep {
//   id: number;
//   titleKey: string;
//   descKey: string;
//   status: 'completed' | 'active' | 'pending';
//   icon: React.ElementType;
// }
