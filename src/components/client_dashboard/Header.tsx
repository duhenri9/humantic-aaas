// src/components/client_dashboard/Header.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, Bot, Edit3, Power, Menu } from 'lucide-react'; // Added Menu icon

// Mock agent status for now, will be dynamic later
type AgentStatus = 'active' | 'validating' | 'paused';
const currentAgentStatus: AgentStatus = 'active'; // Example

const Header = () => {
  const { t } = useTranslation();

  const getStatusIndicator = (status: AgentStatus) => {
    switch (status) {
      case 'active':
        return <div className="flex items-center"><Power size={14} className="text-emerald-500 mr-1.5" /> <span className="text-emerald-500 font-medium">{t('clientDashboardHeader.statusActive')}</span></div>;
      case 'validating':
        return <div className="flex items-center"><Power size={14} className="text-amber-500 mr-1.5" /> <span className="text-amber-500 font-medium">{t('clientDashboardHeader.statusValidating')}</span></div>;
      case 'paused':
        return <div className="flex items-center"><Power size={14} className="text-red-500 mr-1.5" /> <span className="text-red-500 font-medium">{t('clientDashboardHeader.statusPaused')}</span></div>;
      default:
        // Should not happen with TypeScript, but good practice for JS
        const exhaustiveCheck: never = status;
        return null;
    }
  };

  // Placeholder data - will come from user/agent context later
  const clientName = t('clientDashboardHeader.clientNamePlaceholder');
  const agentName = t('clientDashboardHeader.agentNamePlaceholder');


  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-20 h-16 border-b border-gray-200"> {/* z-20 to be above sidebar if it ever overlays */}
      <div className="flex items-center space-x-2 sm:space-x-4">
         <div className="sm:hidden"> {/* Mobile Menu Button Placeholder */}
           <button
             onClick={() => alert('Mobile menu toggle - to be implemented')}
             className="p-2 text-gray-600 hover:text-human-blue focus:outline-none focus:ring-2 focus:ring-inset focus:ring-human-blue rounded-md"
             title={t('clientDashboardHeader.toggleNavigation', 'Toggle navigation')}
           >
             <Menu size={24} />
           </button>
         </div>
         {/* Client/Agent Info */}
         <div>
             <div className="flex items-center text-sm text-gray-500">
                 <Briefcase size={15} className="mr-1.5 text-gray-400" />
                 <span>{clientName}</span>
             </div>
             <div className="flex items-center text-lg font-semibold text-gray-800 mt-0.5">
                 <Bot size={18} className="mr-1.5 text-human-blue" />
                 <span className="truncate max-w-xs sm:max-w-sm md:max-w-md">{agentName}</span> {/* Responsive truncation */}
             </div>
         </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-sm hidden sm:flex items-center"> {/* Hide status on very small screens if needed, or adjust layout */}
          <span className="text-gray-500 mr-1">{t('clientDashboardHeader.statusLabel')}</span>
          {getStatusIndicator(currentAgentStatus)}
        </div>
        <button
          onClick={() => alert(t('clientDashboardHeader.updateContextButton') + ' - Functionality to be implemented')}
          className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-human-blue rounded-md hover:bg-opacity-90 transition-colors flex items-center"
          title={t('clientDashboardHeader.updateContextButton')}
        >
          <Edit3 size={16} className="mr-0 sm:mr-2" /> {/* Icon only on small screens, text + icon on larger */}
          <span className="hidden sm:inline">{t('clientDashboardHeader.updateContextButton')}</span>
        </button>
        {/* User profile/logout could go here eventually, but AuthButtons is in main App header for now */}
      </div>
    </header>
  );
};

export default Header;
