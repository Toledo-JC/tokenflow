import React, { useState, useEffect } from 'react';
import { Account, DEFAULT_AI_PROVIDERS, TokenStatus } from '../types';
import { X, Mail, Github, Zap, Calendar, Cpu, Plus } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  accountToEdit?: Account | null;
  existingProviders?: string[];
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accountToEdit,
  existingProviders = [],
}) => {
  const [email, setEmail] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('Google AI Studio / Gemini');
  const [customProviderName, setCustomProviderName] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('available');
  const [tokenPercentage, setTokenPercentage] = useState<number>(100);
  const [resetDate, setResetDate] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Combine default providers with any custom existing ones
  const allProvidersList = Array.from(
    new Set([...DEFAULT_AI_PROVIDERS, ...existingProviders])
  );

  useEffect(() => {
    if (accountToEdit) {
      setEmail(accountToEdit.email);
      setGithubUsername(accountToEdit.githubUsername);
      
      if (allProvidersList.includes(accountToEdit.aiProvider)) {
        setSelectedProvider(accountToEdit.aiProvider);
        setIsCustomMode(false);
        setCustomProviderName('');
      } else {
        setSelectedProvider('CUSTOM');
        setIsCustomMode(true);
        setCustomProviderName(accountToEdit.aiProvider);
      }

      setTokenStatus(accountToEdit.tokenStatus);
      setTokenPercentage(accountToEdit.tokenPercentage);
      setResetDate(accountToEdit.resetDate ? accountToEdit.resetDate.slice(0, 16) : '');
      setNotes(accountToEdit.notes || '');
    } else {
      setEmail('');
      setGithubUsername('');
      setSelectedProvider('Google AI Studio / Gemini');
      setIsCustomMode(false);
      setCustomProviderName('');
      setTokenStatus('available');
      setTokenPercentage(100);
      setResetDate('');
      setNotes('');
    }
  }, [accountToEdit, isOpen]);

  if (!isOpen) return null;

  const handleProviderSelectChange = (val: string) => {
    if (val === 'CUSTOM') {
      setSelectedProvider('CUSTOM');
      setIsCustomMode(true);
    } else {
      setSelectedProvider(val);
      setIsCustomMode(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !githubUsername.trim()) return;

    const finalProvider = isCustomMode
      ? customProviderName.trim() || 'Outra Plataforma'
      : selectedProvider;

    onSave(
      {
        email: email.trim(),
        githubUsername: githubUsername.trim().replace(/^@/, ''),
        aiProvider: finalProvider,
        tokenStatus,
        tokenPercentage,
        resetDate: resetDate ? new Date(resetDate).toISOString() : undefined,
        notes: notes.trim(),
      },
      accountToEdit?.id
    );

    onClose();
  };

  const handleQuickResetHour = (hours: number) => {
    const future = new Date(Date.now() + hours * 60 * 60 * 1000);
    // Format YYYY-MM-THH:mm for datetime-local input
    const isoStr = future.toISOString().slice(0, 16);
    setResetDate(isoStr);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-base font-bold text-slate-900">
            {accountToEdit ? 'Editar Conta de IA' : 'Cadastrar Nova Conta'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Email */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              E-mail da Conta <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="exemplo.dev@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* GitHub Username */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Usuário do GitHub <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Github className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="nome-de-usuario-github"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* AI Provider */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Plataforma de IA</span>
              <span className="text-[10px] text-indigo-600 font-semibold">Suporta qualquer plataforma</span>
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => handleProviderSelectChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium"
            >
              {allProvidersList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value="CUSTOM">➕ Cadastrar Outra Plataforma de IA...</option>
            </select>

            {isCustomMode && (
              <div className="mt-2.5 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1.5 animate-fadeIn">
                <label className="block font-bold text-indigo-950 text-[11px] flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  Nome da Nova Plataforma de IA:
                </label>
                <input
                  type="text"
                  required={isCustomMode}
                  placeholder="Ex: DeepSeek R1, SambaNova, Ollama Local, Bedrock..."
                  value={customProviderName}
                  onChange={(e) => setCustomProviderName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
                <p className="text-[10px] text-indigo-700/80">
                  Sua nova plataforma ficará cadastrada e disponível para outros filtros e relatórios.
                </p>
              </div>
            )}
          </div>

          {/* Token Status & Percentage Slider */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-500" />
                Status dos Tokens
              </label>
              <span className="font-bold text-slate-900">{tokenPercentage}%</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setTokenStatus('available');
                  setTokenPercentage(100);
                }}
                className={`py-1.5 rounded-lg font-medium border text-center transition-all cursor-pointer ${
                  tokenStatus === 'available'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50'
                }`}
              >
                Disponível
              </button>
              <button
                type="button"
                onClick={() => {
                  setTokenStatus('low');
                  if (tokenPercentage > 30 || tokenPercentage === 0) setTokenPercentage(20);
                }}
                className={`py-1.5 rounded-lg font-medium border text-center transition-all cursor-pointer ${
                  tokenStatus === 'low'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'
                }`}
              >
                Pouco Token
              </button>
              <button
                type="button"
                onClick={() => {
                  setTokenStatus('exhausted');
                  setTokenPercentage(0);
                }}
                className={`py-1.5 rounded-lg font-medium border text-center transition-all cursor-pointer ${
                  tokenStatus === 'exhausted'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50'
                }`}
              >
                Esgotado
              </button>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={tokenPercentage}
              onChange={(e) => {
                const val = Number(e.target.value);
                setTokenPercentage(val);
                if (val === 0) setTokenStatus('exhausted');
                else if (val <= 25) setTokenStatus('low');
                else setTokenStatus('available');
              }}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Reset Date & Time */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Data/Hora da Próxima Renovação</span>
              <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="datetime-local"
                value={resetDate}
                onChange={(e) => setResetDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            
            {/* Quick date presets */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400">Atalhos:</span>
              <button
                type="button"
                onClick={() => handleQuickResetHour(6)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-medium text-slate-600 cursor-pointer"
              >
                +6 horas
              </button>
              <button
                type="button"
                onClick={() => handleQuickResetHour(24)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-medium text-slate-600 cursor-pointer"
              >
                +24 horas (Amanhã)
              </button>
              <button
                type="button"
                onClick={() => handleQuickResetHour(72)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-medium text-slate-600 cursor-pointer"
              >
                +3 dias
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Observações
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Conta de uso diário do AI Studio..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs cursor-pointer"
            >
              {accountToEdit ? 'Salvar Alterações' : 'Cadastrar Conta'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
