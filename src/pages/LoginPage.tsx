// src/pages/LoginPage.tsx
import React, { useState } from 'react';
// import { useMutation } from "convex/react"; // Placeholder
// import { useConvexAuth } from 'convex/react'; // Placeholder

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const { isLoading } = useConvexAuth(); // Placeholder
  // const signIn = useMutation("convex-auth/signIn"); // Placeholder

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Simulating sign in with email: ${email}`);
    // await signIn({ email, password }); // Actual call
  };

  // if (isLoading) return <div>Loading...</div>; // Placeholder

  return (
    <div>
      <h2>Login Page</h2>
      <form onSubmit={handleSignIn}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default LoginPage;
