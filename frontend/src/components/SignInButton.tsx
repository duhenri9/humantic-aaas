"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";

export const SignInButton = () => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const convexUrlFromEnv = process.env.NEXT_PUBLIC_CONVEX_URL;

  const handleSignIn = () => {
    if (!convexUrlFromEnv) {
      console.error("NEXT_PUBLIC_CONVEX_URL is not set in .env.local");
      alert("Configuration error: Convex URL not set.");
      return;
    }
    // The CONVEX_URL in .env.local is the API URL, e.g., https://<your-deployment>.convex.cloud/api
    // The login URL is at the root of the deployment, e.g., https://<your-deployment>.convex.cloud
    const siteUrl = convexUrlFromEnv.replace("/api", "");

    // For the "fake" provider set up with applicationID: "convex"
    const loginUrl = `${siteUrl}/login?provider=convex`;

    // Redirect to the Convex login page for the fake provider
    window.location.href = loginUrl;
  };

  if (isLoading) {
    return <button className="px-4 py-2 bg-gray-200 text-gray-500 rounded cursor-not-allowed" disabled>Loading Auth...</button>;
  }

  if (isAuthenticated) {
    return null; // Or some other UI indicating user is signed in
  }

  return (
    <button
      onClick={handleSignIn}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Sign In
    </button>
  );
};
