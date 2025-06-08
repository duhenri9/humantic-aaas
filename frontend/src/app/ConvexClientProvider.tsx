"use client"; // This component must be a client component

import { ConvexReactClient, ConvexProvider } from "convex/react";
import React from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  // This error will be thrown client-side if the variable is missing
  // It's better to also check server-side or at build time if possible,
  // but for NEXT_PUBLIC_ variables, this client-side check is common.
  console.error("FATAL: NEXT_PUBLIC_CONVEX_URL is not set.");
  // Optionally, render a fallback UI or throw an error to halt rendering
  // For now, we'll let it proceed and ConvexReactClient will likely throw its own error.
}

// Ensure the URL is defined before creating the client, even if just to prevent crashing.
const convex = new ConvexReactClient(convexUrl || "http://localhost:8000"); // Fallback to a dummy URL if undefined to prevent immediate crash
if (!convexUrl) {
  console.warn("ConvexClientProvider: NEXT_PUBLIC_CONVEX_URL is not set. Using a dummy URL. Ensure this is configured in .env.local");
}


export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  // We use ConvexProvider, which makes the Convex client available via hooks
  // and manages authentication state when used with Convex's auth system.
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
