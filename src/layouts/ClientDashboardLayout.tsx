// src/layouts/ClientDashboardLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/client_dashboard/Sidebar'; // Adjust path if needed
import Header from '../components/client_dashboard/Header'; // Adjust path if needed


const ClientDashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar /> {/* Use the actual Sidebar component */}

      {/* Main content area: takes remaining space and handles scrolling */}
      <div className="flex-1 flex flex-col sm:ml-64"> {/* ml-0 by default, sm:ml-64 when sidebar appears */}

        <Header /> {/* Use the actual Header component */}

        {/* Page content for nested routes */}
        {/* This main element will render the content of child routes via <Outlet /> */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto"> {/* Main content scrolls */}
          <Outlet /> {/* Nested routes will render their components here */}
        </main>
      </div>
    </div>
  );
};

export default ClientDashboardLayout;
