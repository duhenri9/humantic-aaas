// src/components/ClientJourneyStepper.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, CircleDot, Circle, Zap, FileText, CreditCard, UserCheck, LayoutDashboard, Repeat, MessageSquareHeart, TrendingUp } from 'lucide-react'; // Added TrendingUp as a general "Journey" icon

interface JourneyStep {
  id: number;
  titleKey: string;
  descKey: string;
  icon: React.ElementType;
}

const ClientJourneyStepper = () => {
  const { t } = useTranslation();
  // Simulate current step for UI development. In a real app, this would come from user data.
  const [currentDemoStep, setCurrentDemoStep] = useState(1); // Start at step 1
  const [completedDemoSteps, setCompletedDemoSteps] = useState<number[]>([]);

  const journeySteps: JourneyStep[] = [
    { id: 1, titleKey: 'clientJourney.step1_title', descKey: 'clientJourney.step1_desc', icon: FileText },
    { id: 2, titleKey: 'clientJourney.step2_title', descKey: 'clientJourney.step2_desc', icon: FileText },
    { id: 3, titleKey: 'clientJourney.step3_title', descKey: 'clientJourney.step3_desc', icon: CreditCard },
    { id: 4, titleKey: 'clientJourney.step4_title', descKey: 'clientJourney.step4_desc', icon: Zap },
    { id: 5, titleKey: 'clientJourney.step5_title', descKey: 'clientJourney.step5_desc', icon: LayoutDashboard },
    { id: 6, titleKey: 'clientJourney.step6_title', descKey: 'clientJourney.step6_desc', icon: Repeat },
    { id: 7, titleKey: 'clientJourney.step7_title', descKey: 'clientJourney.step7_desc', icon: MessageSquareHeart },
  ];

  const getStepStatus = (stepId: number) => {
    if (completedDemoSteps.includes(stepId)) return 'completed';
    if (stepId === currentDemoStep) return 'active';
    return 'pending';
  };

  const isStepClickable = (stepId: number) => {
    // Allow clicking current step, or any previous step to "revisit"
    // Or the next step if the current one is considered "completable" by clicking next
    // For demo, let's allow clicking any step to see its state easily
    return true;
  };

  const handleStepClick = (stepId: number) => {
    // For demo: set current step and mark previous ones as complete
    setCurrentDemoStep(stepId);
    const newCompleted: number[] = [];
    for (let i = 1; i < stepId; i++) {
        newCompleted.push(i);
    }
    setCompletedDemoSteps(newCompleted);
  };


  return (
    <section className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 mb-8">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
        <TrendingUp size={24} className="mr-3 text-human-blue" /> {/* Journey Icon */}
        {t('clientJourney.title')}
      </h2>
      <div className="space-y-4 sm:space-y-6"> {/* Adjusted spacing for smaller screens */}
        {journeySteps.map((step, index) => {
          const status = getStepStatus(step.id);
          const IconComponent = step.icon;

          return (
            <div
              key={step.id}
              className={`flex items-start p-3 rounded-lg transition-all duration-200 ease-in-out ${isStepClickable(step.id) ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}`}
              onClick={() => isStepClickable(step.id) && handleStepClick(step.id)}
            >
              <div className="flex flex-col items-center mr-4 pt-1">
                {status === 'completed' ? (
                  <CheckCircle2 size={28} className="text-emerald-500" />
                ) : status === 'active' ? (
                  <CircleDot size={28} className="text-human-blue" />
                ) : (
                  <Circle size={28} className="text-gray-300" />
                )}
                {index < journeySteps.length - 1 && (
                  <div className={`w-0.5 h-10 sm:h-12 mt-2
                    ${status === 'completed' || (status === 'active' && completedDemoSteps.includes(step.id -1)) ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  />
                )}
              </div>
              <div className={` ${status === 'pending' ? 'opacity-70' : ''}`}>
                <h3 className={`font-semibold text-md sm:text-lg ${status === 'active' ? 'text-human-blue' : 'text-gray-800'}`}>
                  {t(step.titleKey)}
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">{t(step.descKey)}</p>
              </div>
            </div>
          );
        })}
      </div>
      {/* Demo buttons to change step - remove in production */}
      <div className="mt-6 space-x-2 flex justify-center border-t pt-4">
         <button onClick={() => handleStepClick(Math.max(1, currentDemoStep - 1))}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
            Previous Step (Demo)
         </button>
         <button onClick={() => handleStepClick(Math.min(journeySteps.length, currentDemoStep + 1))}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
            Next Step (Demo)
         </button>
      </div>
    </section>
  );
};

export default ClientJourneyStepper;
