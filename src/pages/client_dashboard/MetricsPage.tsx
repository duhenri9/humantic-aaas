// src/pages/client_dashboard/MetricsPage.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChartBig, TrendingUp, Tags, FileDown, Info, AlertTriangle } from 'lucide-react'; // Added AlertTriangle for placeholder value

// Reusable PlaceholderCard component (can be moved to a shared components folder later if not already done)
// For this subtask, assuming it's defined locally or imported from a shared location if that was done in MyAgentPage.tsx subtask.
// To ensure it's self-contained for this file if run independently:
const PlaceholderCard: React.FC<{ titleKey: string, contentKey?: string, contentElement?: React.ReactNode, icon?: React.ElementType, children?: React.ReactNode }> =
  ({ titleKey, contentKey, contentElement, icon: Icon, children }) => {
    const { t } = useTranslation();
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
          {Icon && <Icon size={22} className="mr-3 text-human-blue flex-shrink-0" />}
          {t(titleKey)}
        </h2>
        {contentKey && <p className="text-gray-600 text-sm">{t(contentKey)}</p>}
        {contentElement}
        {children}
      </div>
    );
};

const KpiCard: React.FC<{ titleKey: string, value: string | number, icon?: React.ElementType }> = ({ titleKey, value, icon: Icon }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-gray-50 p-4 rounded-lg shadow hover:bg-gray-100 transition-colors">
            <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                {Icon && <Icon size={16} className="mr-2 text-gray-400" />}
                {t(titleKey)}
            </h4>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">{value}</p>
        </div>
    );
};


const MetricsPage = () => {
  const { t } = useTranslation();

  const kpiValuePlaceholder = (
    <span className="flex items-center text-gray-400">
        <AlertTriangle size={18} className="mr-1.5" />
        {t('metricsPage.kpiPlaceholderValue')}
    </span>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
         <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
             <BarChartBig size={30} className="mr-3 text-human-blue flex-shrink-0"/>
             {t('clientDashboardPages.metricsTitle')}
         </h1>
         {/* Future: Date range picker or other controls could go here
             Example: <input type="date" className="px-3 py-2 border border-gray-300 rounded-md"/>
         */}
      </div>

      {/* KPIs Summary Section */}
      <PlaceholderCard titleKey="metricsPage.kpiSummaryTitle" icon={Info}>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
             <KpiCard titleKey="metricsPage.kpiTotalInteractions" value={kpiValuePlaceholder} />
             <KpiCard titleKey="metricsPage.kpiAvgResponseTime" value={kpiValuePlaceholder} />
             <KpiCard titleKey="metricsPage.kpiPositiveFeedback" value={kpiValuePlaceholder} />
         </div>
      </PlaceholderCard>

      <PlaceholderCard
         titleKey="metricsPage.performanceChartTitle"
         contentKey="metricsPage.performanceChartPlaceholder"
         icon={TrendingUp}
      />

      <PlaceholderCard
         titleKey="metricsPage.tagsBreakdownTitle"
         contentKey="metricsPage.tagsBreakdownPlaceholder"
         icon={Tags}
      />

      <PlaceholderCard
         titleKey="metricsPage.dataExportTitle"
         contentKey="metricsPage.dataExportPlaceholder"
         icon={FileDown}
      />
    </div>
  );
};

export default MetricsPage;
