// src/types.ts
export type ConvexId<T extends string> = string & { __tableName?: T };
export type ConvexUserId = ConvexId<"users">;

// You can add other global types here, for example:
export interface UserProfile {
  _id: ConvexUserId;
  name?: string;
  email: string;
  // other fields from your 'users' table
}

export interface FileEntry {
  _id: ConvexId<"files">;
  name: string;
  type: string; // Mime type
  size: number;
  storageId: string;
  userId: ConvexUserId;
  _creationTime: number;
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
  // Add any other fields that might be needed by the PDF generation
}
