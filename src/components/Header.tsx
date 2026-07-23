import React from 'react';
import { ViewTab, GoogleUser } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  FolderGit2, 
  History, 
  Sparkles, 
  Plus, 
  ArrowLeftRight, 
  Download, 
  RotateCcw,
  Cloud,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  onOpenNewAccountModal: () => void;
  onOpenNewProjectModal: () => void;
  onOpenMigrationWizard: () => void;
  onExport: () => void;
  onResetData: () => void;
  availableAccountsCount: number;
  totalAccountsCount: number;
  googleUser: GoogleUser | null;
  onOpenBackupModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewAccountModal,
  onOpenNewProjectModal,
  onOpenMigrationWizard,
  onExport,
  onResetData,
  availableAccountsCount,
  totalAccountsCount,
  googleUser,
  onOpenBackupModal,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Brand & App Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Gestor de Contas & Tokens IA
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  {availableAccountsCount} de {totalAccountsCount} ativas
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Gerenciamento de repositórios GitHub, migrações de versão e saldo de cotas
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Google Drive / Auth Button */}
            <button
              onClick={onOpenBackupModal}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                googleUser
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
              }`}
              title="Google Drive Backup & Login"
            >
              {googleUser ? (
                <>
                  {googleUser.picture ? (
                    <img
                      src={googleUser.picture}
                      alt={googleUser.name}
                      className="w-4 h-4 rounded-full"
                    />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  )}
                  <span className="max-w-[100px] truncate">{googleUser.name}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4 text-indigo-600" />
                  <span>Google Drive / Login</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenMigrationWizard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
              title="Migrar projeto para outra conta GitHub"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Migrar
            </button>

            <button
              onClick={onOpenNewAccountModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Conta
            </button>

            <button
              onClick={onOpenNewProjectModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Projeto
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

            <button
              onClick={onExport}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Exportar backup local em JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onResetData}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Restaurar dados de exemplo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>


        {/* Tab Navigation */}
        <nav className="flex space-x-1 border-t border-slate-100 pt-1 -mb-px overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-md'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Visão Geral
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'accounts'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-md'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            Contas de IA ({totalAccountsCount})
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'projects'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-md'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            Projetos & Branches
          </button>

          <button
            onClick={() => setActiveTab('migrations')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'migrations'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-md'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <History className="w-4 h-4" />
            Histórico de Migrações
          </button>

          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'assistant'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-md'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Assistente de Rotação
          </button>
        </nav>
      </div>
    </header>
  );
};
