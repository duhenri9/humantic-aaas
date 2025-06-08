"use client";

import React from 'react';

// Define a more structured Plan interface, aligning with potential backend definitions
export interface Plan {
  id: string; // e.g., "monthly_tier_1", "one_time_credits_pack_1_brl"
  name: string; // "Monthly Basic", "Pacote 50 Créditos"
  priceFormatted: string; // For display, e.g., "$5/month", "R$25"
  description: string;
  features: string[];

  // Data attributes for payment processing
  priceAmount: number; // Smallest currency unit (e.g., 500 for $5.00, 2500 for R$25.00)
  currency: string; // "usd", "brl"
  type: 'subscription' | 'one_time'; // Helps determine Stripe mode or payment flow

  ctaText?: string; // Call to Action text for the button
  disabled?: boolean; // If this specific plan card should be disabled
  tags?: string[]; // e.g., ["Popular", "Best Value"] for UI hints
}

interface SubscriptionCardProps {
  plan: Plan;
  onChoosePlan: (plan: Plan) => void; // Callback when plan is chosen
  // disabled prop can also be passed to override plan.disabled for contextual disabling
  isProcessing?: boolean;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ plan, onChoosePlan, isProcessing }) => {
  const isDisabled = plan.disabled || isProcessing;

  return (
    <div
      className={`p-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex flex-col h-full
        ${isDisabled ? 'bg-slate-200 dark:bg-slate-700 cursor-not-allowed opacity-70' : 'bg-white dark:bg-slate-800 hover:shadow-2xl'}`}
    >
      {plan.tags?.includes("Popular") && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="px-3 py-1 text-xs text-white bg-pink-500 rounded-full shadow-md">Popular</span>
        </div>
      )}
      <h3 className={`text-2xl font-bold mb-3 text-center ${isDisabled ? 'text-slate-500' : 'text-sky-600 dark:text-sky-400'}`}>{plan.name}</h3>
      <p className={`text-4xl font-extrabold mb-4 text-center ${isDisabled ? 'text-slate-600' : 'text-slate-800 dark:text-slate-200'}`}>{plan.priceFormatted}</p>
      <p className={`text-sm text-slate-600 dark:text-slate-400 mb-6 min-h-[40px] text-center`}>{plan.description}</p>

      <ul className="list-none text-left mb-8 space-y-2 flex-grow">
        {plan.features.map((feature, index) => (
          <li key={index} className={`flex items-start ${isDisabled ? 'text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
            <svg
              className={`w-5 h-5 mr-2 mt-0.5 flex-shrink-0 ${isDisabled ? 'text-slate-400' : 'text-green-500 dark:text-green-400'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onChoosePlan(plan)}
        disabled={isDisabled}
        type="button"
        className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors
          ${isDisabled
            ? 'bg-slate-400 text-slate-600'
            : 'bg-sky-600 hover:bg-sky-700 text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50'}`}
      >
        {isProcessing ? 'Processing...' : (plan.ctaText || "Choose Plan")}
      </button>
    </div>
  );
};
