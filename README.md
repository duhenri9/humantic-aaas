# HumanTic - AAAS (Agentes como Serviço)

HumanTic AAAS is a modern SaaS platform designed for creating, managing, and deploying advanced conversational AI agents utilizing the Model Context Protocol (MCP). This project is built with a strong emphasis on user experience, automation capabilities, and a robust backend infrastructure powered by Convex.

## Key Features

*   **Secure User Authentication:** Leverages Convex Auth for secure user sign-up, login, and session management.
*   **Multi-language Support:** Fully internationalized interface supporting English (EN) and Portuguese (PT) using `i18next`.
*   **File Upload & Management:** Intuitive drag & drop file uploads with support for various formats (PDF, JPG, PNG, DOCX, etc.), stored securely via Convex Storage. Users can list, download, and delete their files.
*   **Interactive Dashboard:**
    *   **Client Onboarding Journey:** A visual stepper component guiding users through the 7 key onboarding phases.
    *   **Key Statistics:** Displays important metrics like total files, active agents, and space used (currently populated with mock data).
    *   **Agent Status & Configuration:** Shows the status of advanced agents and configuration progress (mock data).
    *   **Usage Feedback & Performance:** Placeholder sections for future display of user feedback and agent performance indicators (mock data).
*   **Toast Notifications:** Provides non-intrusive feedback for user actions (e.g., success/error messages for uploads) using `react-hot-toast`.
*   **Responsive Design:** Core layout and components are designed to be responsive for various screen sizes.

## Tech Stack

*   **Frontend:**
    *   React (v18+)
    *   TypeScript
    *   Vite (Build tool & Dev Server)
    *   Tailwind CSS (Utility-first CSS framework)
    *   `lucide-react` (Icons)
*   **Backend:**
    *   Convex (Serverless backend platform: Database, Auth, Storage, Functions)
*   **Internationalization (i18n):**
    *   `i18next`
    *   `react-i18next`
*   **UI Feedback:**
    *   `react-hot-toast`

## Getting Started

Follow these instructions to get a local copy of the project up and running for development purposes.

### Prerequisites

*   **Node.js:** Version 18.x or later recommended.
*   **npm (or yarn):** Comes with Node.js.
*   **Convex Account:** You'll need a Convex account to deploy and manage the backend. Sign up at [convex.dev](https://www.convex.dev/).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <repo-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Convex Backend Setup

This project is pre-configured to connect to the Convex deployment named `dutiful-partridge-242`. If you are the original developer or have access to this deployment, ensure your Convex CLI is logged in (`npx convex login`).

If you are setting this up as a new, separate instance:

1.  **Initialize Convex for your account:**
    Run `npx convex init` in the project root. This will guide you to:
    *   Log in or create a Convex account.
    *   Create a new project or select an existing one in your account.
2.  **Deploy Backend Schema and Functions:**
    The easiest way is to start the development server (see below), which also runs `npx convex dev`. This command automatically deploys changes in your `convex/` directory. Alternatively, you can deploy manually:
    ```bash
    npx convex deploy
    ```
3.  **Environment Variable for Convex URL:**
    The `convex dev` command (or `npx convex init` if linking to a new project) should automatically create or update a `.env.local` file in your project root with your Convex deployment URL:
    ```
    VITE_CONVEX_URL=https://your-unique-project-name.convex.cloud
    ```
    Ensure this file and variable are present, as the frontend needs it to connect to your Convex backend.

### Environment Variables (Frontend)

Create a `.env.local` file in the project root if it doesn't exist. Add the following variables:

```plaintext
# Required for connecting to your Convex backend
VITE_CONVEX_URL=https://your-unique-project-name.convex.cloud

# Optional: For testing n8n onboarding integration
# Replace with your actual n8n webhook URL if you have one set up
VITE_N8N_ONBOARDING_WEBHOOK_URL=https://your-n8n-instance.com/webhook/onboarding-test

# Note: Other VITE_ prefixed variables for Supabase, Stripe, Pagar.me, Assini
# would be added here as those integrations are fully implemented.
```

### Running the Project

To start both the Vite frontend development server and the Convex local development backend:

```bash
npm run dev
```

This will typically:
*   Make the frontend available at `http://localhost:5173` (or another port if 5173 is busy).
*   Run your Convex backend functions locally, syncing with your cloud deployment.
*   Open the Convex dashboard in your browser.

## Integrations Overview

The platform is designed to integrate with several external services. Placeholder service files have been set up in `src/services/` for:

*   **n8n:** For workflow automation (e.g., onboarding, follow-ups).
*   **Supabase:** For logs, relational data, or features complementary to Convex.
*   **Stripe & Pagar.me:** For payment processing.
*   **Assini:** For digital document signatures.

These integrations are not yet fully implemented.

## Project Structure

*   `src/`: Contains all frontend code, including React components, pages, services, i18n locales, and assets.
*   `convex/`: Contains all backend code for Convex, including schema definitions, mutations, queries, and actions.

```
