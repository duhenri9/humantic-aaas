import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { FileUpload } from "./components/FileUpload";
import { FileList } from "./components/FileList";
import { Dashboard } from "./components/Dashboard";
import { LandingPage } from "./components/LandingPage";
import { LanguageToggle } from "./components/LanguageToggle";
import { useLanguage } from './hooks/useLanguage';
import { useState } from "react";

export default function App() {
  const [showGuestMode, setShowGuestMode] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Unauthenticated>
        {!showGuestMode && !showLoginForm ? (
          <LandingPage 
            onGuestAccess={() => setShowGuestMode(true)}
            onLogin={() => setShowLoginForm(true)}
          />
        ) : showLoginForm ? (
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="absolute top-6 right-6">
              <LanguageToggle />
            </div>
            <div className="w-full max-w-md space-y-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-4xl font-bold" style={{ color: '#6D7AFF' }}>Human</span>
                  <span className="text-4xl font-bold text-black">Tic</span>
                </div>
                <p className="text-slate-600">{t('landing.loginToPlatform')}</p>
              </div>
              <SignInForm />
              <button
                onClick={() => setShowLoginForm(false)}
                className="w-full text-center text-slate-600 hover:text-slate-800 transition-colors"
              >
                ← Voltar
              </button>
            </div>
          </div>
        ) : (
          <GuestMode onBackToLanding={() => setShowGuestMode(false)} />
        )}
      </Unauthenticated>

      <Authenticated>
        <AuthenticatedApp />
      </Authenticated>
      
      <Toaster position="top-right" />
    </div>
  );
}

function GuestMode({ onBackToLanding }: { onBackToLanding: () => void }) {
  const { t } = useLanguage();

  return (
    <>
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md h-16 flex justify-between items-center border-b border-slate-200 shadow-sm px-4 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6D7AFF' }}>
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <h2 className="text-xl font-bold">
            <span style={{ color: '#6D7AFF' }}>Human</span>
            <span className="text-black">Tic</span>
          </h2>
          <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
            Modo Visitante
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageToggle />
          <button
            onClick={onBackToLanding}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            ← Voltar
          </button>
        </div>
      </header>
      
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">
              {t('dashboard.welcome')} Visitante!
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Explore nossa plataforma em modo limitado. Para acessar todas as funcionalidades, faça login ou crie uma conta.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-yellow-800 text-sm">
                ⚠️ Modo visitante: Funcionalidades limitadas
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-800">Demo - Upload de Arquivos</h2>
              <div className="bg-white rounded-xl p-8 border border-slate-200 opacity-75">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-slate-200 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-slate-600">Faça login para fazer upload de arquivos</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-800">Demo - Seus Arquivos</h2>
              <div className="bg-white rounded-xl p-8 border border-slate-200 opacity-75">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-slate-200 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-600">Faça login para ver seus arquivos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function AuthenticatedApp() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const { t } = useLanguage();

  if (loggedInUser === undefined) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#6D7AFF' }}></div>
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md h-16 flex justify-between items-center border-b border-slate-200 shadow-sm px-4 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6D7AFF' }}>
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <h2 className="text-xl font-bold">
            <span style={{ color: '#6D7AFF' }}>Human</span>
            <span className="text-black">Tic</span>
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageToggle />
          <SignOutButton />
        </div>
      </header>
      
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">
              {t('dashboard.welcome')}, {loggedInUser?.email?.split('@')[0]}!
            </h1>
            <p className="text-slate-600">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <Dashboard />
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-800">{t('files.upload')}</h2>
              <FileUpload />
            </div>
            
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-800">{t('files.yourFiles')}</h2>
              <FileList />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
