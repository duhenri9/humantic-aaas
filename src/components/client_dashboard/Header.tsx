// src/components/client_dashboard/Header.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Briefcase, Bot, Edit3, Power, Menu } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { UserData } from '../../../types';

type AgentStatus = 'active' | 'validating' | 'paused';
// const currentAgentStatus: AgentStatus = 'active'; // This will be dynamic

const Header = () => {
  const { t } = useTranslation();
  const currentUser = useQuery(api.auth.getCurrentUser) as UserData | null;
  const navigate = useNavigate(); // Instantiate useNavigate

  // Mock agent status for now, will be dynamic later
  // In a real scenario, this would come from agent data linked to the user
  const currentAgentStatus: AgentStatus = currentUser?.stripePaymentStatus === 'paid' ? 'active' : 'paused'; // Example: link to payment status for demo


  const getStatusIndicator = (status: AgentStatus) => {
    const statusConfig = {
      active: { icon: Power, color: 'text-emerald-500', labelKey: 'clientDashboardHeader.statusActive' },
      validating: { icon: Power, color: 'text-amber-500', labelKey: 'clientDashboardHeader.statusValidating' },
      paused: { icon: Power, color: 'text-red-500', labelKey: 'clientDashboardHeader.statusPaused' },
    };
    const config = statusConfig[status];
    if (!config) return null;
    const IconComponent = config.icon;
    return <div className="flex items-center"><IconComponent size={14} className={`${config.color} mr-1.5`} /> <span className={`${config.color} font-medium`}>{t(config.labelKey)}</span></div>;
  };

  // Determine display name for client/company
  let displayClientName: string | undefined | null = t('clientDashboardHeader.clientNamePlaceholder');
  if (currentUser === undefined) { // Still loading
     displayClientName = t('general.loadingSimple', 'Loading...');
  } else if (currentUser) {
     displayClientName = currentUser.companyName || currentUser.name || currentUser.email;
  } else { // User is null (not authenticated, though ProtectedRoute should prevent this view)
     displayClientName = t('clientDashboardHeader.clientNamePlaceholder');
  }

  // Agent name remains placeholder for now
  const agentName = t('clientDashboardHeader.agentNamePlaceholder');


  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-20 h-16 border-b border-gray-200">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="sm:hidden">
          <button
            onClick={() => navigate('/client/overview')} // Example: make mobile menu navigate home for now, or open sidebar
            className="p-2 text-gray-600 hover:text-human-blue focus:outline-none focus:ring-2 focus:ring-inset focus:ring-human-blue rounded-md"
            title={t('clientDashboardHeader.toggleNavigation', 'Toggle navigation')}
          >
            <Menu size={24} />
          </button>
        </div>
        <div> {/* Client/Agent Info */}
            <div className="flex items-center text-sm text-gray-500">
                <Briefcase size={15} className="mr-1.5 text-gray-400" />
                <span className="truncate max-w-[120px] xs:max-w-[150px] sm:max-w-xs">{displayClientName}</span>
            </div>
            <div className="flex items-center text-lg font-semibold text-gray-800 mt-0.5">
                <Bot size={18} className="mr-1.5 text-human-blue" />
                <span className="truncate max-w-xs sm:max-w-sm md:max-w-md">{agentName}</span>
            </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-sm hidden sm:flex items-center">
          <span className="text-gray-500 mr-1.5">{t('clientDashboardHeader.statusLabel')}</span>
          {getStatusIndicator(currentAgentStatus)}
        </div>
        <button
          onClick={() => navigate('/client/my-agent')} // Navigate to My Agent page
          className="px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-white bg-human-blue rounded-md hover:bg-opacity-90 transition-colors flex items-center"
          title={t('clientDashboardHeader.updateContextButton')}
        >
          <Edit3 size={16} className="mr-0 sm:mr-2 flex-shrink-0" />
          <span className="hidden xs:inline sm:hidden">{t('clientDashboardHeader.updateContextButtonShort', 'Contexto')}</span>
          <span className="hidden sm:inline">{t('clientDashboardHeader.updateContextButton')}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
