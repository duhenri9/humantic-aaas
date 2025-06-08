// Placeholder main.tsx
// This file is the entry point for the Vite application.

import React from 'react';
import ReactDOM from 'react-dom/client';

// Placeholder App component (will need to be created)
// import App from './App';

// Placeholder index.css (should be created for Tailwind)
// import './index.css';

console.log("main.tsx loaded");

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      {/* <App /> */}
      <div>Hello from main.tsx!</div>
    </React.StrictMode>,
  );
} else {
  console.error("Failed to find the root element");
}
