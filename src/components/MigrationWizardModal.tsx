import React, { useState, useEffect } from 'react';
import { Project, Account } from '../types';
import { X, ArrowLeftRight, CheckCircle2, AlertTriangle, GitBranch, Tag, FileText, Sparkles, Mail, Github } from 'lucide-react';

interface MigrationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  accounts: Account[];
  initialProject?: Project | null;
  initialFromAccount?: Account | null;
  onExecuteMigration: (params: {
    projectId: string;
    toAccountId: string;
    toBranch: string;
    toVersion: string;
    reason: string;
    markPreviousExhausted: boolean;
  }) => void;
}

export const MigrationWizardModal: React.FC<MigrationWizardModalProps> = ({
  isOpen,
  onClose,
  projects,
  accounts,
  initialProject,
  initialFromAccount,
  onExecuteMigration,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedToAccountId, setSelectedToAccountId] = useState<string>('');
  const [toBranch, setToBranch] = useState<string>('');
  const [toVersion, setToVersion] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [markPreviousExhausted, setMarkPreviousExhausted] = useState<boolean>(true);

  // Derive current project and current account
  const currentProject = projects.find((p) => p.id === selectedProjectId);
  const currentAccount = accounts.find((a) => a.id === currentProject?.currentAccountId);

  useEffect(() => {
    if (isOpen) {
      if (initialProject) {
        setSelectedProjectId(initialProject.id);
        setToBranch(`${initialProject.currentBranch}-v2`);
        setToVersion(`${initialProject.currentVersion}.1`);
      } else if (projects.length > 0) {
        setSelectedProjectId(projects[0].id);
        setToBranch(`${projects[0].currentBranch}-v2`);
        setToVersion(`${projects[0].currentVersion}.1`);
      }

      // Default target account: pick an available account that is not the current one
      const currentAccId = initialProject?.currentAccountId || (projects[0]?.currentAccountId);
      const availableTarget = accounts.find((a) => a.id !== currentAccId && a.tokenStatus === 'available');
      const fallbackTarget = accounts.find((a) => a.id !== currentAccId);
      
      setSelectedToAccountId(availableTarget?.id || fallbackTarget?.id || '');
      setReason('Esgotamento de tokens na conta anterior. Código baixado e migrado para nova conta/branch.');
      setMarkPreviousExhausted(true);
    }
  }, [isOpen, initialProject, projects, accounts]);

  // Update branches/versions when project changes
  const handleProjectChange = (projId: string) => {
    setSelectedProjectId(projId);
    const proj = projects.find((p) => p.id === projId);
    if (proj) {
      setToBranch(`${proj.currentBranch}-migrated`);
      setToVersion(`${proj.currentVersion}.1`);

      // re-select best target account
      const availableTarget = accounts.find((a) => a.id !== proj.currentAccountId && a.tokenStatus === 'available');
      const fallbackTarget = accounts.find((a) => a.id !== proj.currentAccountId);
      setSelectedToAccountId(availableTarget?.id || fallbackTarget?.id || '');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedToAccountId) return;

    onExecuteMigration({
      projectId: selectedProjectId,
      toAccountId: selectedToAccountId,
      toBranch: toBranch.trim() || 'main-v2',
      toVersion: toVersion.trim() || 'v1.1.0',
      reason: reason.trim() || 'Migração por substituição de conta.',
      markPreviousExhausted,
    });

    onClose();
  };

  const targetAccount = accounts.find((a) => a.id === selectedToAccountId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Assistente de Migração de Projeto</h2>
              <p className="text-xs text-indigo-200">Troque a conta e branch quando os tokens acabarem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Step 1: Choose Project */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              1. Selecione o Projeto a Migrar <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium"
            >
              {projects.map((p) => {
                const acc = accounts.find((a) => a.id === p.currentAccountId);
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} (Conta atual: {acc?.email || 'Nenhuma'} | Branch: {p.currentBranch})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Current Account Origin Box */}
          {currentProject && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Origem (Conta Atual)
                </span>
                {currentAccount && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    currentAccount.tokenStatus === 'exhausted'
                      ? 'bg-rose-100 text-rose-800'
                      : currentAccount.tokenStatus === 'low'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentAccount.tokenStatus.toUpperCase()} ({currentAccount.tokenPercentage}%)
                  </span>
                )}
              </div>
              <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                {currentAccount?.email || 'Sem conta'}
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                Branch atual: <span className="text-slate-800 font-semibold">{currentProject.currentBranch}</span> ({currentProject.currentVersion})
              </div>
            </div>
          )}

          {/* Step 2: Choose Target Account */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              2. Selecione a Nova Conta Destino (Com Tokens Disponíveis) <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedToAccountId}
              onChange={(e) => setSelectedToAccountId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium"
            >
              {accounts.map((acc) => {
                const isCurrent = acc.id === currentProject?.currentAccountId;
                return (
                  <option
                    key={acc.id}
                    value={acc.id}
                    disabled={isCurrent}
                  >
                    {isCurrent ? '[Atual] ' : ''}{acc.email} (@{acc.githubUsername}) - Tokens: {acc.tokenPercentage}% ({acc.tokenStatus.toUpperCase()})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Target Account Preview Box */}
          {targetAccount && (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Destino Confirmado
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-200/80 text-emerald-900">
                  {targetAccount.tokenPercentage}% Tokens Livres
                </span>
              </div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {targetAccount.email}
              </div>
              <div className="text-slate-600 font-mono text-[11px] flex items-center gap-1">
                <Github className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                <span>GitHub: @{targetAccount.githubUsername}</span>
              </div>
            </div>
          )}

          {/* Step 3: New Branch & New Version */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Nova Branch na Nova Conta
              </label>
              <div className="relative">
                <GitBranch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="v2.0-migration"
                  value={toBranch}
                  onChange={(e) => setToBranch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Nova Tag de Versão
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="v2.0.0"
                  value={toVersion}
                  onChange={(e) => setToVersion(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Option: Mark Previous Account as Exhausted */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
            <input
              type="checkbox"
              id="markExhausted"
              checked={markPreviousExhausted}
              onChange={(e) => setMarkPreviousExhausted(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="markExhausted" className="font-semibold text-slate-700 cursor-pointer select-none">
              Marcar a conta anterior ({currentAccount?.email || 'origem'}) como "Tokens Esgotados"
            </label>
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Motivo / Detalhes da Migração
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Cota diária atingida no AI Studio. Código baixado em zip e sincronizado na conta de reserva."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedToAccountId}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Executar Migração Agora
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
