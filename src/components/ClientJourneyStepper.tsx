// src/components/ClientJourneyStepper.tsx
import React, { useState, useEffect } from 'react'; // Added useEffect
import { useTranslation } from 'react-i18next';
import { CheckCircle2, CircleDot, Circle, Zap, FileText, CreditCard, UserCheck, LayoutDashboard, Repeat, MessageSquareHeart, TrendingUp } from 'lucide-react'; // Added TrendingUp as a general "Journey" icon

interface JourneyStep {
  id: number;
  titleKey: string;
  descKey: string;
  icon: React.ElementType;
}

interface ClientJourneyStepperProps {
  paymentCompleted?: boolean; // New prop
}

const ClientJourneyStepper: React.FC<ClientJourneyStepperProps> = ({ paymentCompleted }) => {
  const { t } = useTranslation();
  const [currentDemoStep, setCurrentDemoStep] = useState(1);
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
  const PAYMENT_STEP_ID = 3;

  useEffect(() => {
    if (paymentCompleted) {
      if (!completedDemoSteps.includes(PAYMENT_STEP_ID)) {
        setCompletedDemoSteps(prev => [...new Set([...prev, PAYMENT_STEP_ID])].sort((a, b) => a - b));
      }
      if (currentDemoStep === PAYMENT_STEP_ID) {
         const nextStep = PAYMENT_STEP_ID + 1;
         setCurrentDemoStep(nextStep > journeySteps.length ? journeySteps.length : nextStep);
      }
    }
    // This effect primarily reacts to `paymentCompleted` prop.
    // If `paymentCompleted` becomes false (e.g. refund), this basic setup won't remove it from completed.
    // A more robust solution would involve syncing the entire completed steps array from backend user data.
  }, [paymentCompleted]); // Removed other dependencies to focus on prop change

  const getStepStatus = (stepId: number) => {
    if (stepId === PAYMENT_STEP_ID && paymentCompleted) return 'completed';
    if (completedDemoSteps.includes(stepId)) return 'completed';

    // Adjust active step if payment is completed and current was payment step
    if (paymentCompleted && currentDemoStep === PAYMENT_STEP_ID && stepId === PAYMENT_STEP_ID + 1) return 'active';
    if (stepId === currentDemoStep) return 'active';

    return 'pending';
  };

  const handleDemoStepLogic = (newStep: number, isAdvancing: boolean) => {
    if (isAdvancing) {
        // Mark current step as complete, unless it's the payment step and payment is not externally completed
        if (!completedDemoSteps.includes(currentDemoStep) && !(currentDemoStep === PAYMENT_STEP_ID && paymentCompleted)) {
            setCompletedDemoSteps(prev => [...new Set([...prev, currentDemoStep])].sort((a,b)=>a-b));
        }
    } else { // Moving backwards
        // Un-complete steps that are after or at the new current step, except for payment step if externally completed
        setCompletedDemoSteps(prev => prev.filter(s => s < newStep || (s === PAYMENT_STEP_ID && paymentCompleted)));
    }
    setCurrentDemoStep(newStep);
  };

  const handleDemoPrev = () => {
    handleDemoStepLogic(Math.max(1, currentDemoStep - 1), false);
  };
  const handleDemoNext = () => {
    handleDemoStepLogic(Math.min(journeySteps.length, currentDemoStep + 1), true);
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 mb-8">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
        <TrendingUp size={24} className="mr-3 text-human-blue" />
        {t('clientJourney.title')}
      </h2>
      <div className="space-y-4 sm:space-y-6">
        {journeySteps.map((step, index) => {
          const status = getStepStatus(step.id);
          const IconComponent = step.icon;

          return (
            <div
              key={step.id}
              className="flex items-start p-3 rounded-lg transition-all duration-200 ease-in-out"
              // Removed demo click handler from individual steps for clarity with prop-driven state
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
                    ${status === 'completed' || (status === 'active' && completedDemoSteps.includes(step.id -1) && !(step.id === PAYMENT_STEP_ID && paymentCompleted)) ? 'bg-emerald-500' : 'bg-gray-300'}`}
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
         <button onClick={handleDemoPrev}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
            {t('clientJourney.demoPrevButton', 'Previous Step (Demo)')}
         </button>
         <button onClick={handleDemoNext}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
            {t('clientJourney.demoNextButton', 'Next Step (Demo)')}
         </button>
      </div>
    </section>
  );
};

export default ClientJourneyStepper;
