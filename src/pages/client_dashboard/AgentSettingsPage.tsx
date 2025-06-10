// src/pages/client_dashboard/AgentSettingsPage.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, SlidersHorizontal, Bell, Puzzle, CreditCard } from 'lucide-react'; // Relevant icons

// Reusable PlaceholderCard component (can be moved to a shared components folder later)
const PlaceholderCard: React.FC<{ titleKey: string, contentKey: string, icon?: React.ElementType, children?: React.ReactNode }> =
  ({ titleKey, contentKey, icon: Icon, children }) => {
    const { t } = useTranslation();
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
          {Icon && <Icon size={22} className="mr-3 text-human-blue flex-shrink-0" />}
          {t(titleKey)}
        </h2>
        <p className="text-gray-600 text-sm">{t(contentKey)}</p>
        {children}
      </div>
    );
};

const AgentSettingsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
         <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
             <SlidersHorizontal size={30} className="mr-3 text-human-blue flex-shrink-0"/>
             {t('clientDashboardPages.agentSettingsTitle')}
         </h1>
         {/* Future: Save Settings button could go here, disabled initially
             Example: <button className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-md hover:bg-emerald-600 disabled:opacity-50" disabled>Save Settings</button>
         */}
      </div>

      <PlaceholderCard
         titleKey="agentSettingsPage.generalTitle"
         contentKey="agentSettingsPage.generalPlaceholder"
         icon={Settings}
      />

      <PlaceholderCard
         titleKey="agentSettingsPage.channelTitle"
         contentKey="agentSettingsPage.channelPlaceholder"
         icon={Puzzle} // Using Puzzle for channels as it implies connecting pieces
      />

      <PlaceholderCard
         titleKey="agentSettingsPage.notificationsTitle"
         contentKey="agentSettingsPage.notificationsPlaceholder"
         icon={Bell}
      />

      <PlaceholderCard
         titleKey="agentSettingsPage.integrationsTitle"
         contentKey="agentSettingsPage.integrationsPlaceholder"
         icon={Puzzle} // Re-using Puzzle, or another specific one like Link2 or Share2
      />

      <PlaceholderCard
         titleKey="agentSettingsPage.billingTitle"
         contentKey="agentSettingsPage.billingPlaceholder"
         icon={CreditCard}
      />
    </div>
  );
};

export default AgentSettingsPage;
