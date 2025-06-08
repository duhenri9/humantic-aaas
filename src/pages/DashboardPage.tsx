// src/pages/DashboardPage.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import ClientJourneyStepper from '../components/ClientJourneyStepper';
import { useConvexAuth, useQuery } from 'convex/react'; // Ensure useQuery is imported
import { api } from '../../convex/_generated/api'; // Import full api object
import type { UserData } from '../components/UserInitializer'; // Or your defined UserData type
import { Link } from 'react-router-dom';
import { BarChart3, UserCheck, TrendingUp, Settings2, LayoutGrid, CheckSquare, MessageCircleWarning, ExternalLink, Loader2, HardDrive } from 'lucide-react'; // Added HardDrive

// Helper function to format bytes
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const DashboardPage = () => {
  const { t } = useTranslation(); // Removed i18n as it wasn't used directly here
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const currentUser = useQuery(api.auth.getCurrentUser) as UserData | null;
  const userFiles = useQuery(api.files.getFilesForUser); // Fetch user's files

  const userName = currentUser?.name || currentUser?.email || t('dashboard.defaultUserName', "User");

  // Calculate dynamic file stats
  const totalFilesCount = userFiles?.length ?? 0;
  const totalSpaceUsedBytes = userFiles?.reduce((acc, file) => acc + (file.size ?? 0), 0) ?? 0;
  const formattedSpaceUsed = formatBytes(totalSpaceUsedBytes);
  const filesLoading = userFiles === undefined;


  if (authLoading) {
    return <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-gray-700">
        <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
        <p className="text-lg">{t('general.loadingAuth')}</p>
      </div>;
   }
  if (!isAuthenticated) {
    return (
     <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-center p-4">
       <LayoutGrid size={48} className="text-human-blue mb-4" />
       <h1 className="text-2xl font-semibold mb-2">{t('auth.accessDenied')}</h1>
       <p className="mb-4 text-gray-600">{t('auth.pleaseLoginDashboard')}</p>
       <Link
         to="/login"
         className="px-6 py-2 text-white bg-human-blue rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
       >
         {t('auth.goToLogin')}
       </Link>
     </div>
   );
  }

  const paymentCompleted = currentUser?.journeyStep_Payment_Completed === true || currentUser?.stripePaymentStatus === 'paid';

  // Determine MCP Agent Status based on payment
  const mcpAgentDisplayStatus = paymentCompleted ? 'active' : 'pending_payment';


  // Update dashboardStats to use dynamic file data
  const dashboardStats = {
    totalFiles: filesLoading ? 0 : totalFilesCount,
    activeAgents: 2, // Remains mock
    spaceUsed: filesLoading ? t('general.loadingSimple', 'Loading...') : formattedSpaceUsed,
    mcpAgentStatus: mcpAgentDisplayStatus, // Use derived status
    configProgressPercent: 85, // Remains mock
    feedbackItems: [ /* ... (mock data from previous step) ... */
      { id: 1, type: "positive", textKey: "dashboard.feedbackExamplePositive", channel: "WhatsApp", time: "2 hours ago" },
      { id: 2, type: "neutral", textKey: "dashboard.feedbackExampleNeutral", channel: "Website Chat", time: "1 day ago" },
      { id: 3, type: "action_needed", textKey: "dashboard.feedbackExampleAction", channel: "CRM", time: "3 days ago" },
    ],
    performanceIndicators: { /* ... (mock data from previous step) ... */
      engagementRate: "75%",
      leadsGenerated: 15,
      commonQueries: ["Preço", "Funcionalidades", "Suporte"]
    }
  };

  // const paymentStepCompleted = ... (already defined above)

  const getAgentStatusPill = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full">{t('dashboard.agentStatusActive')}</span>;
      case 'pending_setup': // This case might be used later if we have more granular states
        return <span className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full">{t('dashboard.agentStatusPending', 'Pending Setup')}</span>;
      case 'pending_payment':
        return <span className="px-3 py-1 text-xs font-semibold text-orange-500 bg-orange-100 rounded-full">{t('dashboard.agentStatusPendingPayment', 'Pending Payment')}</span>;
      case 'needs_attention':
        return <span className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">{t('dashboard.agentStatusAttention', 'Needs Attention')}</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">{status}</span>;
    }
  };

  const getFeedbackIcon = (type: string) => {
     if (type === 'positive') return <CheckSquare size={18} className="text-emerald-500 mr-2 flex-shrink-0" />;
     if (type === 'action_needed') return <MessageCircleWarning size={18} className="text-red-500 mr-2 flex-shrink-0" />;
     return <MessageCircleWarning size={18} className="text-amber-500 mr-2 flex-shrink-0" />; // Neutral or other
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
           {t('dashboard.greeting', { userName: userName })}
        </h1>
        <p className="text-gray-600 mb-8">{t('dashboard.welcomeSubtitle', "Here's what's happening with your account today.")}</p>

         <ClientJourneyStepper paymentCompleted={paymentStepCompleted} />

        {/* Statistics Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
            <BarChart3 size={20} className="mr-2 text-human-blue" />
            {t('dashboard.overview')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition-shadow">
                 <h3 className="text-md font-medium text-gray-600 flex items-center">
                   <Settings2 size={16} className="mr-2 text-gray-400" /> {/* Icon for files */}
                   {t('dashboard.totalFiles')}
                 </h3>
                 <p className="text-3xl font-bold text-gray-800">
                   {filesLoading ? <Loader2 size={28} className="animate-spin text-human-blue" /> : dashboardStats.totalFiles}
                 </p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition-shadow">
              <h3 className="text-md font-medium text-gray-600">{t('dashboard.activeAgents')}</h3>
              <p className="text-3xl font-bold text-gray-800">{dashboardStats.activeAgents}</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition-shadow">
                 <h3 className="text-md font-medium text-gray-600 flex items-center">
                   <HardDrive size={16} className="mr-2 text-gray-400" /> {/* Icon for space */}
                   {t('dashboard.spaceUsed')}
                 </h3>
                 <p className="text-3xl font-bold text-gray-800">
                   {filesLoading ? <Loader2 size={28} className="animate-spin text-human-blue" /> : dashboardStats.spaceUsed}
                 </p>
            </div>
          </div>
        </section>

        {/* Agent Status & Configuration Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
            <UserCheck size={20} className="mr-2 text-emerald-500" />
            {t('dashboard.agentStatusConfig')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition-shadow">
              <h3 className="text-md font-medium text-gray-600 mb-2">{t('dashboard.mcpActivation')}</h3>
              {getAgentStatusPill(dashboardStats.mcpAgentStatus)}
              <button className="mt-3 text-sm text-human-blue hover:underline flex items-center">
                {t('dashboard.manageAgentButton')} <ExternalLink size={14} className="ml-1" />
              </button>
            </div>
            <div className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition-shadow">
              <h3 className="text-md font-medium text-gray-600 mb-2">{t('dashboard.configProgress')}</h3>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-1">
                <div
                  className="bg-human-blue h-4 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${dashboardStats.configProgressPercent}%` }}
                ></div>
              </div>
              <p className="text-sm text-right text-gray-600">
                {t('dashboard.configComplete', { progress: dashboardStats.configProgressPercent })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {dashboardStats.configProgressPercent < 100 ? t('dashboard.configNextStep') : t('dashboard.configIsComplete', 'Configuration is complete!')}
              </p>
            </div>
          </div>
        </section>

        {/* Usage Feedback & Performance Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
            <TrendingUp size={20} className="mr-2 text-purple-500" />
            {t('dashboard.usageFeedbackPerformance')}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition-shadow">
                 <h3 className="text-md font-medium text-gray-600 mb-3">{t('dashboard.recentFeedback', 'Recent Feedback')}</h3>
                 <div className="space-y-3">
                     {dashboardStats.feedbackItems.map(item => (
                         <div key={item.id} className="flex items-start text-sm">
                             {getFeedbackIcon(item.type)}
                             <div>
                                 <span className="font-medium">{t(item.textKey, "Feedback text missing")}</span>
                                 <span className="text-gray-500 text-xs block">via {item.channel} - {item.time}</span>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
             <div className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition-shadow">
                 <h3 className="text-md font-medium text-gray-600 mb-3">{t('dashboard.keyMetrics', 'Key Metrics')}</h3>
                 <ul className="space-y-2 text-sm">
                     <li className="flex justify-between"><span>{t('dashboard.metricEngagementRate', 'Engagement Rate')}:</span> <span className="font-semibold">{dashboardStats.performanceIndicators.engagementRate}</span></li>
                     <li className="flex justify-between"><span>{t('dashboard.metricLeadsGenerated', 'Leads Generated')}:</span> <span className="font-semibold">{dashboardStats.performanceIndicators.leadsGenerated}</span></li>
                     <li className="mt-2">
                         <span className="font-medium">{t('dashboard.metricCommonQueries', 'Most Common Queries')}:</span>
                         <div className="flex flex-wrap gap-2 mt-1">
                             {dashboardStats.performanceIndicators.commonQueries.map(query => (
                                 <span key={query} className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">{query}</span>
                             ))}
                         </div>
                     </li>
                 </ul>
             </div>
          </div>
        </section>

        {/* File Management Section - Existing */}
         <section>
           <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
             <Settings2 size={20} className="mr-2 text-teal-500" />
             {t('dashboard.fileManagement')}
           </h2>
           <div className="bg-white p-5 rounded-lg shadow">
             <FileUpload />
             <FileList />
           </div>
         </section>
      </div>
    </div>
  );
};
export default DashboardPage;
