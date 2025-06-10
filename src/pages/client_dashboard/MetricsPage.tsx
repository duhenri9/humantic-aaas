// src/pages/client_dashboard/MetricsPage.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const MetricsPage = () => {
  const { t } = useTranslation();
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">{t('clientDashboardPages.metricsTitle')}</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">{t('general.contentPlaceholder', 'Content for this section will be implemented soon.')}</p>
        {/* Placeholder for: charts, stats, export options */}
      </div>
    </div>
  );
};
export default MetricsPage;
