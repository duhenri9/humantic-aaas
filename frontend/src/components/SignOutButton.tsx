"use client";

import { useConvexAuth, useConvex } from "convex/react";
import { useRouter } from "next/navigation";

export const SignOutButton = () => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const convex = useConvex(); // Get the Convex client instance
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await convex.signOut();
      // After sign out, you might want to redirect or refresh to reflect the change
      // For example, redirect to home page using Next.js router
      router.push("/"); // Or router.refresh() if staying on the same page
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Error signing out. Check console for details.");
    }
  };

  if (isLoading) {
    // Don't show a loading state here if Sign In button also shows one, could be redundant
    return null;
  }

  if (!isAuthenticated) {
    return null; // Don't show sign-out button if not authenticated
  }

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Sign Out
    </button>
  );
};
