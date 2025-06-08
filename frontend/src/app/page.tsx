"use client";

import Image from "next/image";
import { SignInButton } from "@/components/SignInButton";
import { SignOutButton } from "@/components/SignOutButton";
// import { SpeechInput } from "@/components/SpeechInput"; // STT/TTS temporarily de-emphasized
// import { AudioOutput } from "@/components/AudioOutput"; // STT/TTS temporarily de-emphasized
import { SubscriptionCard, Plan } from "@/components/SubscriptionCard";
import { PaymentModal } from "@/components/PaymentModal";
import { ChatWindow } from "@/components/ChatWindow";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import React, { useState, useEffect } from 'react';

type AgentKey = "Sophia" | "Zayn";
const AVAILABLE_AGENTS: AgentKey[] = ["Sophia", "Zayn"];

// Mock plans data (remains for context, can be moved to a config file later)
const mockPlansData: Plan[] = [
  {
    id: "monthly_tier_1",
    name: "Monthly Basic",
    priceFormatted: "$5/month",
    description: "Access core features and a monthly credit allowance.",
    features: ["100 AI interaction credits/month", "Standard AI models", "Community support"],
    priceAmount: 500, currency: "usd", type: "subscription",
    tags: ["Popular"]
  },
  {
    id: "one_time_credits_pack_1",
    name: "Credit Booster Pack",
    priceFormatted: "$10",
    description: "One-time purchase of extra interaction credits.",
    features: ["120 extra AI interaction credits", "Use anytime", "No subscription needed"],
    priceAmount: 1000, currency: "usd", type: "one_time",
  },
  {
    id: "monthly_tier_1_brl",
    name: "Plano Mensal (BRL)",
    priceFormatted: "R$25/mês",
    description: "Acesso às funcionalidades básicas e créditos mensais.",
    features: ["100 créditos IA/mês", "Modelos IA padrão", "Suporte comunitário"],
    priceAmount: 2500, currency: "brl", type: "subscription",
    tags: ["Brasil"]
  },
];

export default function Home() {
  const { isLoadingAuth, isAuthenticated, user } = useAuth();
  // const [transcribedText, setTranscribedText] = useState<string>(""); // For STT/TTS if re-enabled
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<Plan | null>(null);

  const [currentConversationId, setCurrentConversationId] = useState<Id<"conversations"> | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [selectedAgentForNewConv, setSelectedAgentForNewConv] = useState<AgentKey | null>(null);

  const startNewConversationMutation = useMutation(api.conversation.startConversation);
  const updateUserAgentMutation = useMutation(api.conversation.updateUserChosenAgent);

  useEffect(() => {
    if (user?.chosenAgent) {
      setSelectedAgentForNewConv(user.chosenAgent as AgentKey);
    } else if (!user?.chosenAgent && AVAILABLE_AGENTS.length > 0) {
        // Default to the first available agent if none is chosen by the user yet
        setSelectedAgentForNewConv(AVAILABLE_AGENTS[0]);
    }
  }, [user?.chosenAgent]);

  const handleChoosePlan = (plan: Plan) => {
    if (!isAuthenticated) { alert("Please sign in to choose a plan."); return; }
    setSelectedPlanForPayment(plan);
    setIsPaymentModalOpen(true);
  };
  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPlanForPayment(null);
  };

  const handleSelectAgent = async (agent: AgentKey) => {
    if (!user) return;
    setSelectedAgentForNewConv(agent);
    try {
      await updateUserAgentMutation({ agentType: agent });
      // User object from useAuth should eventually reflect this change.
    } catch (error) { console.error("Failed to update chosen agent:", error); }
  };

  const handleStartConversation = async () => {
    if (!isAuthenticated || !selectedAgentForNewConv) {
      alert("Please sign in and select an agent."); return;
    }
    setIsLoadingConversation(true);
    try {
      const newConvId = await startNewConversationMutation({ agentType: selectedAgentForNewConv });
      setCurrentConversationId(newConvId);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      alert(`Error starting conversation: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const handleCloseChat = () => setCurrentConversationId(null);

  // Main Content Logic
  let mainContent;
  if (isLoadingAuth) {
    mainContent = <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div><p className="mt-4 text-slate-500">Loading session...</p></div>;
  } else if (!isAuthenticated) {
    mainContent = (
      <div className="auth-section mb-6 sm:mb-8 w-full max-w-md p-4 sm:p-6 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl shadow-xl text-center">
        <h2 className="text-xl font-semibold mb-4 text-sky-600 dark:text-sky-500">Access Your Space</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Sign in to begin your session, choose an AI companion, and explore premium features.</p>
        <SignInButton />
      </div>
    );
  } else if (currentConversationId) {
    mainContent = (
      <ChatWindow
        conversationId={currentConversationId}
        agentName={user?.chosenAgent || selectedAgentForNewConv || undefined}
        onCloseChat={handleCloseChat}
      />
    );
  } else {
    mainContent = (
      <div className="w-full max-w-lg text-center flex flex-col items-center">
        <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full">
          <h3 className="text-xl font-semibold mb-4 text-sky-600 dark:text-sky-400">
            {user?.chosenAgent ? `Your preferred AI companion: ${user.chosenAgent}` : "Choose Your AI Companion"}
          </h3>
          <div className="flex justify-center gap-x-3 sm:gap-x-4 mb-5">
            {AVAILABLE_AGENTS.map(agentName => (
              <button
                key={agentName}
                onClick={() => handleSelectAgent(agentName)}
                className={`px-5 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 ease-in-out transform hover:scale-105
                  ${selectedAgentForNewConv === agentName
                    ? 'bg-sky-600 text-white ring-2 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-900 ring-sky-500 shadow-lg'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-sky-100 dark:hover:bg-slate-600 shadow-sm'}`}
              >
                {agentName}
              </button>
            ))}
          </div>
          {selectedAgentForNewConv && (
            <button
              onClick={handleStartConversation}
              disabled={isLoadingConversation}
              className="w-full max-w-xs mx-auto py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-lg disabled:opacity-60 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isLoadingConversation ? "Starting..." : `Start Chat with ${selectedAgentForNewConv}`}
            </button>
          )}
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg mb-8 w-full">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Signed in as: <span className="font-semibold">{user?.name || user?.email}</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Status: {user?.subscriptionStatus || "Free Tier"}
                {user?.activePlanId && ` (Plan: ${user.activePlanId})`}
                {user?.availableCredits !== undefined && ` | Credits: ${user.availableCredits}`}
            </p>
            <SignOutButton />
        </div>

        <section className="plans-section w-full max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-slate-700 dark:text-slate-200">Explore Plans & Credits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {mockPlansData.map(plan => ( <SubscriptionCard key={plan.id} plan={plan} onChoosePlan={handleChoosePlan} /> ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-900 dark:to-sky-800 text-slate-800 dark:text-slate-200 selection:bg-sky-500 selection:text-white">
      <header className="my-6 sm:my-8 text-center w-full">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-sky-700 dark:text-sky-400">
          tell me<span className="text-sky-500 dark:text-sky-300">.</span>more
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mt-1">
          Psicologia guiada por IA com empatia real
        </p>
      </header>

      <main className="w-full flex flex-col items-center justify-center flex-grow mb-8">
        {mainContent}
      </main>

      <PaymentModal isOpen={isPaymentModalOpen} onClose={handleClosePaymentModal} selectedPlan={selectedPlanForPayment} />

      <footer className="w-full mt-auto pt-8 pb-6 text-center text-sm text-slate-500 dark:text-slate-400">
        <div className="mb-3">
          <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" aria-label="Powered by Next.js">
            <Image className="dark:invert mx-auto opacity-60 hover:opacity-100 transition-opacity" src="/next.svg" alt="Next.js logo" width={90} height={19} priority />
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} tell me.more. All rights reserved.</p>
      </footer>
    </div>
  );
}
