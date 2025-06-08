"use client";

import React, { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Plan } from './SubscriptionCard';

// For Stripe.js (optional, if you want to use Elements for card input directly)
// import { loadStripe } from '@stripe/stripe-js';
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: Plan | null;
}

type PaymentProviderOption = "stripe" | "pix" | "crypto";
type CryptoType = "ETH" | "USDC_ETH" | "BTC" | "SOL_USDC"; // Align with backend cryptoTypeSchema

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, selectedPlan }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<"options" | "crypto_select" | "details">("options");
  const [selectedProvider, setSelectedProvider] = useState<PaymentProviderOption | null>(null);

  // Payment details state
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixExpiresAt, setPixExpiresAt] = useState<number | null>(null);
  const [cryptoDetails, setCryptoDetails] = useState<{ address: string; amount: string; currency: string } | null>(null);
  const [selectedCryptoType, setSelectedCryptoType] = useState<CryptoType>("USDC_ETH"); // Default crypto

  // Convex mutations
  const createStripeSessionMutation = useMutation(api.stripePayment.createStripeCheckoutSession);
  const createPixOrderMutation = useMutation(api.pixPayment.createPixOrder);
  const createCryptoIntentMutation = useMutation(api.cryptoPayment.createCryptoPaymentIntent);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setPaymentStep("options");
      setSelectedProvider(null);
      setPixQrCode(null);
      setCryptoDetails(null);
      setPixExpiresAt(null);
    }
  }, [isOpen, selectedPlan]);

  if (!isOpen || !selectedPlan) return null;

  const handleStripePayment = async () => {
    setSelectedProvider("stripe");
    setIsLoading(true);
    setError(null);
    try {
      const result = await createStripeSessionMutation({ planId: selectedPlan.id });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl; // Redirect to Stripe
      } else {
        throw new Error("Stripe session URL not received from backend.");
      }
    } catch (e: any) {
      console.error("Stripe payment error:", e);
      setError(`Stripe Error: ${e.data?.value || e.message || 'Failed to initiate Stripe payment.'}`);
      setIsLoading(false);
    }
    // setIsLoading(false) is effectively handled by redirect or error state.
  };

  const handlePixPayment = async () => {
    setSelectedProvider("pix");
    setIsLoading(true);
    setError(null);
    try {
      const result = await createPixOrderMutation({ planId: selectedPlan.id });
      setPixQrCode(result.qrCodeData);
      setPixExpiresAt(result.expiresAt);
      setPaymentStep("details");
    } catch (e: any) {
      console.error("PIX payment error:", e);
      setError(`PIX Error: ${e.data?.value || e.message || 'Failed to create PIX order.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCryptoPaymentIntent = async () => {
    // This function is called after crypto type is selected and confirmed.
    setSelectedProvider("crypto"); // Ensure provider is set if coming from crypto_select step
    setIsLoading(true);
    setError(null);
    try {
      const result = await createCryptoIntentMutation({ planId: selectedPlan.id, cryptoType: selectedCryptoType });
      setCryptoDetails({ address: result.paymentAddress, amount: result.amountDue, currency: result.currency });
      setPaymentStep("details");
    } catch (e: any) {
      console.error("Crypto payment error:", e);
      setError(`Crypto Error: ${e.data?.value || e.message || 'Failed to create crypto payment intent.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPaymentOptions = () => (
    <>
      <h3 className="text-xl font-semibold mb-1 text-center">Choose Payment Method</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center">
        For plan: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedPlan.name}</span> ({selectedPlan.priceFormatted})
      </p>
      <div className="space-y-3">
        <button onClick={handleStripePayment} disabled={isLoading} className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-60 transition-opacity">
          {isLoading && selectedProvider === "stripe" ? "Processing..." : "Pay with Card (Stripe)"}
        </button>
        {/* Conditionally render PIX button, e.g., if plan currency is BRL */}
        {(selectedPlan.currency.toLowerCase() === 'brl') && (
          <button onClick={handlePixPayment} disabled={isLoading} className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium disabled:opacity-60 transition-opacity">
            {isLoading && selectedProvider === "pix" ? "Processing..." : "Pay with PIX"}
          </button>
        )}
        <button onClick={() => { setSelectedProvider("crypto"); setPaymentStep("crypto_select"); }} disabled={isLoading} className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium disabled:opacity-60 transition-opacity">
          {isLoading && selectedProvider === "crypto" && paymentStep !== "crypto_select" ? "Processing..." : "Pay with Crypto"}
        </button>
      </div>
    </>
  );

  const renderCryptoSelect = () => (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-center">Select Cryptocurrency</h3>
      <select
        value={selectedCryptoType}
        onChange={(e) => setSelectedCryptoType(e.target.value as CryptoType)}
        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg mb-6 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500"
      >
        <option value="USDC_ETH">USDC (Ethereum ERC-20)</option>
        <option value="ETH">Ethereum (ETH)</option>
        <option value="BTC">Bitcoin (BTC)</option>
        <option value="SOL_USDC">USDC (Solana SPL)</option>
      </select>
      <button onClick={handleCryptoPaymentIntent} disabled={isLoading} className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium disabled:opacity-60 transition-opacity">
        {isLoading ? "Generating Details..." : "Confirm Crypto & Get Address"}
      </button>
      <button onClick={() => { setPaymentStep("options"); setSelectedProvider(null); setError(null); }} className="mt-3 text-sm w-full text-center text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-500">
        &larr; Back to payment options
      </button>
    </div>
  );

  const renderPaymentDetails = () => {
    if (selectedProvider === "pix" && pixQrCode) {
      return (
        <div>
          <h3 className="text-xl font-semibold mb-2 text-center">PIX Payment</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 text-center">Scan the QR code with your bank app or copy the code below. Valid for ~{Math.round((pixExpiresAt! - Date.now())/60000)} minutes.</p>
          <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md text-center mb-3">
            <div className="w-48 h-48 bg-slate-300 dark:bg-slate-600 mx-auto mb-3 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 rounded-md shadow-inner">Mock QR Code Area</div>
            <p className="text-xs break-all font-mono p-2 bg-white dark:bg-slate-800 rounded shadow-sm">{pixQrCode}</p>
          </div>
          <button onClick={() => { setPaymentStep("options"); setPixQrCode(null); setSelectedProvider(null); setError(null); }} className="text-sm w-full text-center text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-500">
            &larr; Choose another payment method
          </button>
        </div>
      );
    }
    if (selectedProvider === "crypto" && cryptoDetails) {
      return (
        <div>
          <h3 className="text-xl font-semibold mb-2 text-center">Crypto Payment ({cryptoDetails.currency})</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 text-center">Send exactly:</p>
          <p className="text-lg font-mono p-3 bg-slate-100 dark:bg-slate-700 rounded-md mb-3 text-center shadow-sm">{cryptoDetails.amount} {cryptoDetails.currency}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 text-center">To address:</p>
          <p className="text-sm font-mono p-3 bg-slate-100 dark:bg-slate-700 rounded-md break-all mb-3 shadow-sm">{cryptoDetails.address}</p>
          <p className="text-xs text-red-500 dark:text-red-400 mb-4 text-center">Ensure you send the correct amount of {cryptoDetails.currency} to this address on the correct network. Underpayments or sending other assets may result in loss of funds.</p>
          <button onClick={() => { setPaymentStep("crypto_select"); setCryptoDetails(null); setError(null); }} className="text-sm w-full text-center text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-500">
            &larr; Choose different crypto or back to options
          </button>
        </div>
      );
    }
    return null;
  };

  let currentStepComponent;
  if (paymentStep === "options") {
    currentStepComponent = renderPaymentOptions();
  } else if (paymentStep === "crypto_select") {
    currentStepComponent = renderCryptoSelect();
  } else if (paymentStep === "details") {
    currentStepComponent = renderPaymentDetails();
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-75 backdrop-blur-md flex items-center justify-center p-4 z-[100] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className={`bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Payment</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-3xl leading-none">&times;</button>
        </div>

        {error && <p className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg text-sm mb-4" role="alert">{error}</p>}

        {currentStepComponent}

        {isLoading && paymentStep !== "details" && !(selectedProvider === "crypto" && paymentStep === "crypto_select" && !isLoading) && (
          <div className="mt-6 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-600 dark:border-sky-400"></div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Processing your request...</p>
          </div>
        )}
      </div>
    </div>
  );
};
