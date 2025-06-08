// src/pages/CreateProposalPage.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { generateProposalPdf } from '../../services/n8nService'; // Adjust path if needed
import { sendForSignature } from '../../services/signatureService'; // Adjust path
import type { ProposalFormData } from '../../types'; // Adjust path if needed
import { Mail, AlertTriangle, CheckCircle } from 'lucide-react'; // Add icons
import { logAuditEvent } from '../../services/supabaseService'; // Adjust path
import { useQuery } from 'convex/react'; // To get current user for logging
import { api as userApi } from '../../convex/_generated/api'; // Alias for user api
import type { UserData } from '../../components/UserInitializer'; // Or from types.ts
  price: string; // Using string for input, can be number later
  currency: string;
  paymentTerms: string;
  validityPeriod: string;
}

const CreateProposalPage = () => {
  const { t } = useTranslation();
  const currentUser = useQuery(userApi.auth.getCurrentUser) as UserData | null;
  const [formData, setFormData] = useState<ProposalFormData>({
    clientName: '',
    clientEmail: '',
    projectName: '',
    scope: '',
    price: '',
    currency: 'BRL',
    paymentTerms: t('proposalForm.paymentTermsDefault', '50% upfront, 50% on project completion.'),
    validityPeriod: t('proposalForm.validityPeriodDefault', 'This proposal is valid for 15 days from the date of issue.'),
  });
  const [isLoadingPdf, setIsLoadingPdf] = useState(false); // Renamed for clarity
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [isSendingForSignature, setIsSendingForSignature] = useState(false);
  const [signatureInfo, setSignatureInfo] = useState<{id?: string, error?: string, status?: string} | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setGeneratedPdfUrl(null); // Reset PDF if form data changes
    setSignatureInfo(null); // Reset signature info if form changes
  };

  const handleGeneratePdfSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingPdf(true);
    setGeneratedPdfUrl(null);
    setSignatureInfo(null);
    const toastId = 'pdfGenerateToast'; // Changed toastId for clarity
    toast.loading(t('proposalForm.generatingInProgress', 'Generating proposal...'), { id: toastId });

    try {
      const result = await generateProposalPdf(formData);
      if (result.pdfUrl) {
        toast.success(t('proposalForm.generateSuccess', 'Proposal generated successfully!'), { id: toastId });
        setGeneratedPdfUrl(result.pdfUrl);
        // Log proposal generation event
        logAuditEvent('PROPOSAL_GENERATED',
          { clientName: formData.clientName, projectName: formData.projectName, pdfUrl: result.pdfUrl },
          currentUser?._id as string
        ).then(() => console.log('[CreateProposalPage] PROPOSAL_GENERATED event logged to Supabase.'))
          .catch(err => console.error('[CreateProposalPage] Supabase logging error for PROPOSAL_GENERATED:', err));
      } else {
        throw new Error(result.error || t('proposalForm.generateErrorUnknown', 'Unknown error generating PDF.'));
      }
    } catch (error: any) {
      toast.error(`${t('proposalForm.generateError', 'Error generating proposal')}: ${error.message}`, { id: toastId, duration: 7000 });
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const handleSendForSignature = async () => {
    if (!generatedPdfUrl) {
      toast.error(t('proposalForm.errorNoPdfForSignature', 'No PDF generated to send for signature.'));
      return;
    }
    if (!formData.clientEmail) {
      toast.error(t('proposalForm.errorNoClientEmailForSignature', 'Client email not provided for signature.'));
      return;
    }

    setIsSendingForSignature(true);
    setSignatureInfo(null);
    const toastId = 'signatureToast';
    toast.loading(t('proposalForm.sendingForSignatureInProgress', 'Sending for signature...'), { id: toastId });

    try {
      const result = await sendForSignature(generatedPdfUrl, formData.clientEmail);
      if (result.signatureRequestId) {
        toast.success(t('proposalForm.sendForSignatureSuccess', 'Proposal sent for signature!'), { id: toastId });
        setSignatureInfo({ id: result.signatureRequestId, status: result.status || 'pending_simulation' });
        // Log signature request event
        logAuditEvent('SIGNATURE_REQUESTED',
          { clientEmail: formData.clientEmail, pdfUrl: generatedPdfUrl, signatureRequestId: result.signatureRequestId },
          currentUser?._id as string
        ).then(() => console.log('[CreateProposalPage] SIGNATURE_REQUESTED event logged to Supabase.'))
          .catch(err => console.error('[CreateProposalPage] Supabase logging error for SIGNATURE_REQUESTED:', err));
      } else {
        const errorMessage = result.error || t('proposalForm.sendForSignatureErrorUnknown', 'Unknown error sending for signature.');
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      toast.error(`${t('proposalForm.sendForSignatureError', 'Error sending for signature')}: ${error.message}`, { id: toastId, duration: 7000 });
      setSignatureInfo({ error: error.message });
    } finally {
      setIsSendingForSignature(false);
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-human-blue focus:border-human-blue sm:text-sm disabled:bg-gray-100";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 flex items-center">
      <div className="max-w-2xl w-full mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          {t('proposalForm.title')}
        </h1>
        <form onSubmit={handleGeneratePdfSubmit} className="space-y-5">
          {/* Input fields remain the same as in the previous version of this file */}
          {/* Client Name, Email, Project Name, Scope, Price, Currency, Payment Terms, Validity Period */}
          <div>
            <label htmlFor="clientName" className={labelClass}>{t('proposalForm.clientNameLabel')}</label>
            <input type="text" name="clientName" id="clientName" value={formData.clientName} onChange={handleChange} placeholder={t('proposalForm.clientNamePlaceholder')} className={inputClass} required disabled={isLoadingPdf || isSendingForSignature} />
          </div>

          <div>
            <label htmlFor="clientEmail" className={labelClass}>{t('proposalForm.clientEmailLabel')}</label>
            <input type="email" name="clientEmail" id="clientEmail" value={formData.clientEmail} onChange={handleChange} placeholder={t('proposalForm.clientEmailPlaceholder')} className={inputClass} required disabled={isLoadingPdf || isSendingForSignature} />
          </div>

          <div>
            <label htmlFor="projectName" className={labelClass}>{t('proposalForm.projectNameLabel')}</label>
            <input type="text" name="projectName" id="projectName" value={formData.projectName} onChange={handleChange} placeholder={t('proposalForm.projectNamePlaceholder')} className={inputClass} required disabled={isLoadingPdf || isSendingForSignature} />
          </div>

          <div>
            <label htmlFor="scope" className={labelClass}>{t('proposalForm.scopeLabel')}</label>
            <textarea name="scope" id="scope" value={formData.scope} onChange={handleChange} placeholder={t('proposalForm.scopePlaceholder')} rows={5} className={inputClass} required disabled={isLoadingPdf || isSendingForSignature} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
             <div>
               <label htmlFor="price" className={labelClass}>{t('proposalForm.priceLabel')}</label>
               <input type="text" name="price" id="price" value={formData.price} onChange={handleChange} placeholder={t('proposalForm.pricePlaceholder')} className={inputClass} required disabled={isLoadingPdf || isSendingForSignature} />
             </div>
             <div>
               <label htmlFor="currency" className={labelClass}>{t('proposalForm.currencyLabel')}</label>
               <input type="text" name="currency" id="currency" value={formData.currency} onChange={handleChange} placeholder={t('proposalForm.currencyPlaceholder')} className={inputClass} required disabled={isLoadingPdf || isSendingForSignature} />
             </div>
          </div>

          <div>
            <label htmlFor="paymentTerms" className={labelClass}>{t('proposalForm.paymentTermsLabel')}</label>
            <input type="text" name="paymentTerms" id="paymentTerms" value={formData.paymentTerms} onChange={handleChange} placeholder={t('proposalForm.paymentTermsPlaceholder')} className={inputClass} required disabled={isLoadingPdf || isSendingForSignature} />
          </div>

          <div>
            <label htmlFor="validityPeriod" className={labelClass}>{t('proposalForm.validityPeriodLabel')}</label>
            <input type="text" name="validityPeriod" id="validityPeriod" value={formData.validityPeriod} onChange={handleChange} placeholder={t('proposalForm.validityPeriodPlaceholder')} className={inputClass} required disabled={isLoadingPdf || isSendingForSignature} />
          </div>

          <div> {/* Submit button for PDF Generation */}
            <button
              type="submit"
              disabled={isLoadingPdf || !!generatedPdfUrl || isSendingForSignature}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-70 disabled:bg-gray-400"
            >
              {isLoadingPdf ? t('general.loadingSimple', 'Loading...') : (generatedPdfUrl ? t('proposalForm.regenerateButton', 'Generate New Proposal') : t('proposalForm.generateButton'))}
            </button>
          </div>
        </form>

        {generatedPdfUrl && !signatureInfo?.id && ( // Show Send for Signature button only if PDF generated AND not already sent
          <div className="mt-4 pt-4 border-t">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md mb-4">
                <h3 className="text-md font-semibold text-emerald-700">{t('proposalForm.pdfReadyTitle', 'Proposal Ready!')}</h3>
                <p className="text-sm text-gray-700 mt-1">
                    {t('proposalForm.pdfReadyMessage', 'Your PDF proposal has been generated:')}
                </p>
                <a
                    href={generatedPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-human-blue hover:underline break-all"
                >
                    {generatedPdfUrl}
                </a>
            </div>
            <button
              onClick={handleSendForSignature}
              disabled={isSendingForSignature || !generatedPdfUrl} // Also disable if somehow URL is null again
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-human-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human-blue transition-colors disabled:opacity-70 disabled:bg-gray-400"
            >
              {isSendingForSignature ? t('general.loadingSimple', 'Loading...') : t('proposalForm.sendForSignatureButton', 'Enviar para Assinatura Digital')}
            </button>
          </div>
        )}

        {signatureInfo && (
             <div className="mt-6 pt-4 border-t">
               <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                 {signatureInfo.id ? <CheckCircle size={18} className="text-emerald-500 mr-2" /> : <AlertTriangle size={18} className="text-red-500 mr-2" />}
                 {t('proposalForm.signatureStatusTitle', 'Status da Assinatura')}
               </h3>
               <div className={`p-3 rounded-md text-sm ${signatureInfo.id ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                 {signatureInfo.id && (
                   <p className="flex items-start">
                     <Mail size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                     <span>{t('proposalForm.signatureReqInfo', 'Solicitação de assinatura enviada:')} ID <strong>{signatureInfo.id}</strong> (Status: {signatureInfo.status || 'N/A'})</span>
                   </p>
                 )}
                 {signatureInfo.error && (
                   <p className="flex items-start">
                     <AlertTriangle size={16} className="text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                     <span>{t('proposalForm.signatureReqError', 'Falha ao enviar para assinatura:')} {signatureInfo.error}</span>
                   </p>
                 )}
               </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CreateProposalPage;
