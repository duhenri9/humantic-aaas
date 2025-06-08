// src/pages/DashboardPage.tsx
import React from 'react';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import { useConvexAuth } from 'convex/react'; // To check auth status
import { Link } from 'react-router-dom';    // For login link
import { BarChart3, UserCheck, Settings2, TrendingUp, LayoutGrid, Loader2 } from 'lucide-react';

const DashboardPage = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  // Dummy data for placeholders - will be replaced by actual data queries later
  const stats = {
    totalFiles: 0, // Will be derived from FileList length or a dedicated query
    activeAgents: 1,
    spaceUsed: "0 MB"
  };
  const agentConfigProgress = 25; // Example percentage

  // This loading state is for Convex Auth initializing
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-gray-700">
        <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
        <p className="text-lg">Loading authentication status...</p>
      </div>
    );
  }

  // If not authenticated, show a message and link to login
  // This is a fallback, ProtectedRoute should handle redirection primarily.
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-center p-4">
        <LayoutGrid size={48} className="text-blue-500 mb-4" />
        <h1 className="text-2xl font-semibold mb-2 text-gray-800">Access Denied</h1>
        <p className="mb-6 text-gray-600">Please log in to view your dashboard.</p>
        <Link
          to="/login"
          className="px-8 py-3 text-lg font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors"
          style={{ backgroundColor: '#6D7AFF' }}
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto"> {/* Increased max-width for more content */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">My Dashboard</h1>

        {/* Statistics Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
            <BarChart3 size={24} className="mr-3 text-blue-600" />
            Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-medium text-gray-500 mb-1">Total Files</h3>
              <p className="text-4xl font-bold text-gray-800">{stats.totalFiles}</p> {/* Replace with actual data */}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-medium text-gray-500 mb-1">Active Agents (MCP)</h3>
              <p className="text-4xl font-bold text-gray-800">{stats.activeAgents}</p> {/* Replace with actual data */}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-medium text-gray-500 mb-1">Space Used</h3>
              <p className="text-4xl font-bold text-gray-800">{stats.spaceUsed}</p> {/* Replace with actual data */}
            </div>
          </div>
        </section>

        {/* Agent Status & Configuration Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
            <UserCheck size={24} className="mr-3 text-green-600" />
            Agent Status & Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-medium text-gray-600 mb-2">Advanced Agent (MCP) Activation</h3>
              <p className="text-xl text-green-500 font-semibold">Active</p> {/* Placeholder */}
              <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium py-2 px-4 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                Manage Agent
              </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-medium text-gray-600 mb-3">Configuration Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-5 mb-1 overflow-hidden">
                <div
                  className="bg-blue-600 h-5 rounded-full flex items-center justify-center text-xs font-medium text-white"
                  style={{ width: `${agentConfigProgress}%`, backgroundColor: '#6D7AFF' }}
                >
                  {agentConfigProgress}%
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Next step: Finalize integration settings</p> {/* Placeholder */}
            </div>
          </div>
        </section>

        {/* Feedback and Performance Section - Placeholder */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
            <TrendingUp size={24} className="mr-3 text-purple-600" />
            Usage Feedback & Performance
          </h2>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <p className="text-gray-600">Detailed feedback and performance indicators will be displayed here (e.g., engagement by channel, feature usage metrics).</p>
            <p className="mt-3 text-sm text-gray-400 italic">(Content to be implemented in a future update)</p>
          </div>
        </section>

        {/* File Management Section - Existing */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
            <Settings2 size={24} className="mr-3 text-teal-600" />
            File Management
          </h2>
          <div className="bg-white p-6 rounded-xl shadow-lg"> {/* Removed hover effect for this larger section to avoid distraction */}
            <FileUpload />
            <div className="mt-8"> {/* Added margin-top for spacing */}
              <FileList />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default DashboardPage;
