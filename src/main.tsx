// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n'; // Initialize i18next
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth } from "convex/react"; // Corrected import
// import { auth } from "convex/auth_client"; // This might be needed depending on specific auth setup

const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  throw new Error("VITE_CONVEX_URL environment variable not set!");
}

const convex = new ConvexReactClient(convexUrl);
// const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!); // Simpler if sure it's set

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ConvexProviderWithAuth client={convex}>
        <App />
      </ConvexProviderWithAuth>
    </React.StrictMode>,
  );
} else {
  console.error("Failed to find the root element");
}
