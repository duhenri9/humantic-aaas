// src/config/integrations.ts
/**
 * Central placeholder for notes on integration configurations.
 * Actual API keys and sensitive URLs should be managed via environment variables.
 * Example: VITE_N8N_URL, VITE_SUPABASE_URL, etc. (using VITE_ prefix for Vite projects)
 *
 * n8n:
 *   - Base URL: process.env.VITE_N8N_URL
 *   - Webhook URLs for specific workflows (onboarding, agent updates) will be defined per workflow in n8n.
 *
 * Supabase:
 *   - Project URL: process.env.VITE_SUPABASE_URL
 *   - Anon Key: process.env.VITE_SUPABASE_ANON_KEY
 *
 * Stripe:
 *   - Publishable Key: process.env.VITE_STRIPE_PUBLISHABLE_KEY
 *   - Secret Key: Stored securely on the backend (e.g., Convex environment variables).
 *
 * Pagar.me:
 *   - API Key: Stored securely on the backend.
 *
 * Assini:
 *   - API Key: process.env.VITE_ASSINI_API_KEY (if client-side interaction) or backend.
 *
 * PDF Generation:
 *   - Could be an n8n workflow, or a dedicated service like APITemplate.io, DocRaptor, etc.
 *   - If using n8n, it would be invoked via n8nService.ts.
 *
 * Github + Jules (Google):
 *   - This refers to the development and deployment workflow, not a runtime integration typically.
 *   - Source control is GitHub.
 *   - Jules.google is the AI agent assisting with development.
 *   - Deployment might be to Replit or other hosting, potentially automated via GitHub Actions.
 */

export const integrationsConfigNotes = {
  info: "This file contains notes for developers regarding integration points and environment variable conventions.",
  lastUpdated: new Date().toISOString(),
};
