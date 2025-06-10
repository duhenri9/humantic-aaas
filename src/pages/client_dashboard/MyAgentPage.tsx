// src/pages/client_dashboard/MyAgentPage.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Power, BookOpen, Edit, History } from 'lucide-react'; // Relevant icons

interface PlaceholderCardProps {
  titleKey: string;
  contentKey: string;
  icon?: React.ElementType;
  // Allow children for more complex content later if needed
  children?: React.ReactNode;
}

const PlaceholderCard: React.FC<PlaceholderCardProps> = ({ titleKey, contentKey, icon: Icon, children }) => {
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

const MyAgentPage = () => {
  const { t } = useTranslation();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
         <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
             <Bot size={30} className="mr-3 text-human-blue flex-shrink-0"/>
             {t('clientDashboardPages.myAgentTitle')}
         </h1>
         {/* Future: Quick actions like "Pause Agent" could go here
             Example: <button className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600">Pause Agent</button>
         */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <PlaceholderCard
             titleKey="myAgentPage.agentNameTitle"
             contentKey="myAgentPage.agentNamePlaceholder"
             icon={Bot}
         />
         <PlaceholderCard
             titleKey="myAgentPage.agentStatusTitle"
             contentKey="myAgentPage.agentStatusPlaceholder"
             icon={Power}
         />
      </div>

      <PlaceholderCard
         titleKey="myAgentPage.behaviorTitle"
         contentKey="myAgentPage.behaviorPlaceholder"
         icon={BookOpen}
      />

      {/* This is where the "Update Context" button from Header.tsx leads. */}
      {/* The actual form for context editing will be implemented here later. */}
      <PlaceholderCard
         titleKey="myAgentPage.contextEditingTitle"
         contentKey="myAgentPage.contextEditingPlaceholder"
         icon={Edit}
      >
        {/* Example of adding more specific placeholder content if needed:
        <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
            <p className="text-sm text-gray-500 italic">
                {t('myAgentPage.contextFormPlaceholder', 'Context update form will appear here...')}
            </p>
        </div>
        */}
      </PlaceholderCard>

      <PlaceholderCard
         titleKey="myAgentPage.revisionHistoryTitle"
         contentKey="myAgentPage.revisionHistoryPlaceholder"
         icon={History}
      />
    </div>
  );
};

export default MyAgentPage;
