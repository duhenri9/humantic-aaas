const authConfig = {
  providers: [
    {
      // This is a "fake" provider for development purposes.
      // It allows users to sign in by picking a username.
      // Users created this way are not secure, but it's useful for local testing.
      // IMPORTANT: Replace with your actual Convex project's issuer URL
      // found in your Convex dashboard under Settings -> Auth.
      // It will look like: https://<your-deployment-name>.convex.cloud
      domain: "https://replace-with-your-convex-dev-issuer-url.convex.cloud",
      applicationID: "convex", // Standard for the fake provider
    },
  ],
};

export default authConfig;
