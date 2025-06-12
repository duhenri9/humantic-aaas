# Sistema Completo HumanTic com Melhorias Modernas
  
This is a project built with [Chef](https://chef.convex.dev) using [Convex](https://convex.dev) as its backend.
  
This project is connected to the Convex deployment named [`dutiful-partridge-242`](https://dashboard.convex.dev/d/dutiful-partridge-242).
  
## Project structure
  
The frontend code is in the `src` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.

## App authentication

Chef apps use [Convex Auth](https://auth.convex.dev/) with Anonymous auth for easy sign in. You may wish to change this before deploying your app.

### Convex Backend Setup

This project is pre-configured to connect to the Convex deployment named `dutiful-partridge-242`. If you are the original developer or have access to this deployment, ensure your Convex CLI is logged in (`npx convex login`).

**Important Note on Convex CLI Usage (e.g., `npx convex login`, `npx convex dev`):**
These Convex command-line tools often need to download packages or connect to Convex cloud services. If you are in an environment with restricted network access, you might encounter errors (like `E403 Forbidden` when trying to download packages). Ensure you are running these commands in an environment with open internet access, or consult your network administrator if you face connectivity issues.

## Developing and deploying your app

Check out the [Convex docs](https://docs.convex.dev/) for more information on how to develop with Convex.
* If you're new to Convex, the [Overview](https://docs.convex.dev/understanding/) is a good place to start
* Check out the [Hosting and Deployment](https://docs.convex.dev/production/) docs for how to deploy your app
* Read the [Best Practices](https://docs.convex.dev/understanding/best-practices/) guide for tips on how to improve you app further

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.
