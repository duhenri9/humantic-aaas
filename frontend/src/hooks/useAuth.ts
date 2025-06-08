import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api"; // Path from frontend/src/hooks to frontend/convex/_generated/api

export const useAuth = () => {
  const { isLoading, isAuthenticated } = useConvexAuth();

  // Fetch user data only if authenticated.
  // The `api.users.getCurrentUser` refers to the `getCurrentUser` query in `backend/convex/users.ts`.
  // This query will return the user object from your `users` table or null.
  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip" // Skip the query if the user is not authenticated.
  );

  return {
    isLoadingAuth: isLoading, // True while Convex is checking authentication status
    isAuthenticated,        // True if the user is authenticated
    user: isAuthenticated ? currentUser : null, // The user object from your `users` table, or null
                                                // `currentUser` will be undefined while loading.
  };
};
