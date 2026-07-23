import React, { useState } from 'react';
import { Account, Project } from '../types';
import { formatRelativeResetTime } from '../utils/storage';
import { 
  Github, 
  Mail, 
  Copy, 
  Check, 
  Clock, 
  Edit, 
  Trash2, 
  AlertCircle, 
  FolderGit2, 
  Zap, 
  ExternalLink 
} from 'lucide-react';

interface AccountCardProps {
  account: Account;
  assignedProjects: Project[];
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
  onUpdateStatus: (accountId: string, newStatus: Account['tokenStatus'], newPercentage: number) => void;
  onQuickMigrateFromThis?: (account: Account) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  assignedProjects,
  onEdit,
  onDelete,
  onUpdateStatus,
  onQuickMigrateFromThis,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedGithub, setCopiedGithub] = useState(false);

  const handleCopy = (text: string, type: 'email' | 'github') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedGithub(true);
      setTimeout(() => setCopiedGithub(false), 2000);
    }
  };

  const getStatusBadge = () => {
    switch (account.tokenStatus) {
      case 'available':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Tokens Disponíveis
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
            Poucos Tokens ({account.tokenPercentage}%)
          </span>
        );
      case 'exhausted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
            Tokens Esgotados
          </span>
        );
    }
  };

  const getProgressBarColor = () => {
    if (account.tokenStatus === 'exhausted' || account.tokenPercentage <= 5) return 'bg-rose-500';
    if (account.tokenStatus === 'low' || account.tokenPercentage <= 25) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden ${
      account.tokenStatus === 'exhausted' 
        ? 'border-rose-200/90 bg-slate-50/30' 
        : account.tokenStatus === 'low'
        ? 'border-amber-200/90'
        : 'border-slate-200'
    }`}>
      {/* Top Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge()}
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              {account.aiProvider}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => onEdit(account)}
              className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
              title="Editar conta"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(account.id)}
              className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Excluir conta"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email & GitHub Details */}
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between group text-sm font-semibold text-slate-900 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">{account.email}</span>
            </div>
            <button
              onClick={() => handleCopy(account.email, 'email')}
              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors shrink-0 cursor-pointer"
              title="Copiar email"
            >
              {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 truncate">
              <Github className="w-4 h-4 text-slate-700 shrink-0" />
              <span className="font-mono font-medium">@{account.githubUsername}</span>
            </div>
            <div className="flex items-center gap-1">
              <a
                href={`https://github.com/${account.githubUsername}`}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                title="Abrir perfil no GitHub"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => handleCopy(account.githubUsername, 'github')}
                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors shrink-0 cursor-pointer"
                title="Copiar username do GitHub"
              >
                {copiedGithub ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Token Balance & Progress Bar */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Cota de Tokens
            </span>
            <span className="font-bold text-slate-800">{account.tokenPercentage}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor()}`}
              style={{ width: `${Math.max(2, account.tokenPercentage)}%` }}
            />
          </div>

          {/* Quick status change buttons */}
          <div className="pt-2 flex items-center justify-between gap-1 text-[11px]">
            <span className="text-slate-400">Marcar como:</span>
            <div className="flex gap-1">
              <button
                onClick={() => onUpdateStatus(account.id, 'available', 100)}
                className={`px-2 py-0.5 rounded font-medium border cursor-pointer ${
                  account.tokenStatus === 'available'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50'
                }`}
              >
                100% OK
              </button>
              <button
                onClick={() => onUpdateStatus(account.id, 'low', 20)}
                className={`px-2 py-0.5 rounded font-medium border cursor-pointer ${
                  account.tokenStatus === 'low'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50'
                }`}
              >
                Pouco
              </button>
              <button
                onClick={() => onUpdateStatus(account.id, 'exhausted', 0)}
                className={`px-2 py-0.5 rounded font-medium border cursor-pointer ${
                  account.tokenStatus === 'exhausted'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50'
                }`}
              >
                Esgotado
              </button>
            </div>
          </div>
        </div>

        {/* Reset Date & Notes */}
        {account.tokenStatus === 'exhausted' && (
          <div className="mt-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-800 flex items-start gap-2">
            <Clock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Renovação de tokens:</p>
              <p className="text-rose-700">{formatRelativeResetTime(account.resetDate)}</p>
            </div>
          </div>
        )}

        {account.notes && (
          <p className="mt-3 text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
            "{account.notes}"
          </p>
        )}
      </div>

      {/* Card Footer: Currently Assigned Projects */}
      <div className="bg-slate-50 border-t border-slate-100 p-4">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-medium text-slate-700 flex items-center gap-1">
            <FolderGit2 className="w-3.5 h-3.5 text-indigo-600" />
            Projetos Ativos Nesta Conta ({assignedProjects.length})
          </span>

          {account.tokenStatus === 'exhausted' && assignedProjects.length > 0 && onQuickMigrateFromThis && (
            <button
              onClick={() => onQuickMigrateFromThis(account)}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
            >
              Migrar Projetos
            </button>
          )}
        </div>

        {assignedProjects.length > 0 ? (
          <div className="space-y-1.5">
            {assignedProjects.map((p) => (
              <div
                key={p.id}
                className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
              >
                <span className="font-medium text-slate-800 truncate max-w-[170px]">
                  {p.name}
                </span>
                <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {p.currentBranch}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic py-1 text-center">
            Nenhum projeto ativo nesta conta momento.
          </div>
        )}
      </div>
    </div>
  );
};
