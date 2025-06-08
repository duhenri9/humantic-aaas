// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
// import { useMutation } from "convex/react"; // Placeholder
// import { useConvexAuth } from 'convex/react'; // Placeholder

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const { isLoading } = useConvexAuth(); // Placeholder
  // const signUp = useMutation("convex-auth/signUp"); // Placeholder

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Simulating sign up with email: ${email}`);
    // await signUp({ email, password }); // Actual call
  };

  // if (isLoading) return <div>Loading...</div>; // Placeholder

  return (
    <div>
      <h2>Register Page</h2>
      <form onSubmit={handleSignUp}>
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
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default RegisterPage;
