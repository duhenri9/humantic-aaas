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
