import React, { useState, useEffect } from 'react';
import { Project, Account, ProjectAccountVersion } from '../types';
import { X, GitBranch, Tag, Mail, Plus, Sparkles, Check } from 'lucide-react';

interface AddProjectVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  accounts: Account[];
  onAddVersion: (
    projectId: string,
    versionData: {
      accountId: string;
      branch: string;
      version: string;
      setAsActive: boolean;
      notes?: string;
    }
  ) => void;
}

export const AddProjectVersionModal: React.FC<AddProjectVersionModalProps> = ({
  isOpen,
  onClose,
  project,
  accounts,
  onAddVersion,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [branch, setBranch] = useState('main');
  const [versionTag, setVersionTag] = useState('v1.1.0');
  const [setAsActive, setSetAsActive] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && project) {
      // Pick default account: either first available account or first account in list
      const available = accounts.find((a) => a.tokenStatus === 'available') || accounts[0];
      setSelectedAccountId(available?.id || '');
      
      // Auto-increment version suggestion
      const currentVer = project.currentVersion || 'v1.0.0';
      const versionNumber = currentVer.replace(/^v/, '');
      const parts = versionNumber.split('.');
      if (parts.length === 3 && !isNaN(Number(parts[1]))) {
        parts[1] = String(Number(parts[1]) + 1);
        setVersionTag(`v${parts.join('.')}`);
      } else {
        setVersionTag(`${currentVer}.1`);
      }

      setBranch(`${project.currentBranch || 'main'}-v2`);
      setSetAsActive(true);
      setNotes('');
    }
  }, [isOpen, project, accounts]);

  if (!isOpen || !project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId || !branch.trim() || !versionTag.trim()) return;

    onAddVersion(project.id, {
      accountId: selectedAccountId,
      branch: branch.trim(),
      version: versionTag.trim(),
      setAsActive,
      notes: notes.trim(),
    });

    onClose();
  };

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fadeIn">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Vincular Nova Conta / Versão
            </h2>
            <p className="text-xs text-slate-500">Projeto: <span className="font-semibold text-slate-800">{project.name}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Account Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Conta de IA a Vincular a este Projeto <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    🤖 IA: {acc.aiProvider} — {acc.email} (@{acc.githubUsername}) [{acc.tokenPercentage}% Tokens]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account Preview Box */}
          {selectedAccount && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700">Plataforma: {selectedAccount.aiProvider}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedAccount.tokenStatus === 'available'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedAccount.tokenStatus === 'low'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {selectedAccount.tokenStatus.toUpperCase()} ({selectedAccount.tokenPercentage}%)
                </span>
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                GitHub: @{selectedAccount.githubUsername}
              </div>
            </div>
          )}

          {/* Branch & Version Tag */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Branch para esta Conta <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <GitBranch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="feature/v1.2-nova-conta"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Versão (Tag) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="v1.2.0"
                  value={versionTag}
                  onChange={(e) => setVersionTag(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Set as Active Account Checkbox */}
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="setAsActiveCheck"
              checked={setAsActive}
              onChange={(e) => setSetAsActive(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="setAsActiveCheck" className="font-semibold text-indigo-950 cursor-pointer select-none">
              Definir esta conta e versão como a <span className="text-indigo-600 font-bold">Ativa no Projeto</span> agora
            </label>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Observações desta Versão (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Nova versão criada para rodar testes na conta Gemini 2..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
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
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Vincular Conta e Criar Versão
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
