// src/components/client_dashboard/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Bot, BarChart2, Settings, FileText, MessageSquare, Globe } from 'lucide-react';

// Define the shape of translation keys for type safety, relative to clientDashboardSidebar
type ClientDashboardSidebarKeys =
  | 'home'
  | 'myAgent'
  | 'metrics'
  | 'settings'
  | 'documents'
  | 'support'
  | 'language' // Even though language is special, it's good to have its key for title attribute
  | 'clientPanelTitle'; // Added this one

interface NavItem {
  to: string;
  labelKey: ClientDashboardSidebarKeys;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { to: 'overview', labelKey: 'home', icon: Home },
  { to: 'my-agent', labelKey: 'myAgent', icon: Bot },
  { to: 'metrics', labelKey: 'metrics', icon: BarChart2 },
  { to: 'settings', labelKey: 'settings', icon: Settings },
  { to: 'documents', labelKey: 'documents', icon: FileText },
  { to: 'support', labelKey: 'support', icon: MessageSquare },
];

const Sidebar = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'pt' : 'en';
    i18n.changeLanguage(newLang);
  };

  const baseLinkClass = "flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out";
  const inactiveLinkClass = "text-emerald-100 hover:bg-emerald-700 hover:text-white";
  const activeLinkClass = "bg-emerald-700 text-white shadow-inner";

  return (
    <div className="w-64 bg-emerald-600 text-white p-4 fixed h-full overflow-y-auto flex-col shadow-lg hidden sm:flex z-30"> {/* Added z-30 for good measure */}
      {/* Logo Placeholder */}
      <div className="py-3 mb-6 text-center border-b border-emerald-700">
        <h1 className="text-2xl font-bold text-white">
          {/* Using direct colors as it's a logo */}
          <span style={{ color: '#FFFFFF' }}>Human</span>
          <span style={{ color: '#A7F3D0' }}>Tic</span> {/* Lighter emerald for contrast within emerald-600 bg */}
        </h1>
        <p className="text-xs text-emerald-200 mt-1">{t('clientDashboardSidebar.clientPanelTitle')}</p>
      </div>

      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => {
             const IconComponent = item.icon;
             return (
                 <li key={item.labelKey}>
                 <NavLink
                     to={item.to} // These are relative to the parent route where ClientDashboardLayout is used
                     className={({ isActive }) =>
                     `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
                     }
                 >
                     <IconComponent size={20} className="flex-shrink-0" />
                     <span>{t(`clientDashboardSidebar.${item.labelKey}`)}</span>
                 </NavLink>
                 </li>
             );
          })}
        </ul>
      </nav>

      {/* Language Toggle Section */}
      <div className="mt-auto pt-4 border-t border-emerald-700">
         <button
             onClick={toggleLanguage}
             className={`${baseLinkClass} ${inactiveLinkClass} w-full justify-start`}
             title={t('clientDashboardSidebar.language')}
         >
             <Globe size={20} className="flex-shrink-0" />
             <span>{i18n.language.toUpperCase()}</span>
         </button>
      </div>
    </div>
  );
};

export default Sidebar;
