import React from 'react';
import { Account, Project, MigrationLog } from '../types';
import { formatRelativeResetTime } from '../utils/storage';
import { Users, CheckCircle2, AlertTriangle, XCircle, FolderGit2, ArrowLeftRight, Clock } from 'lucide-react';

interface StatsOverviewProps {
  accounts: Account[];
  projects: Project[];
  migrationLogs: MigrationLog[];
  onFilterStatus?: (status: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  accounts,
  projects,
  migrationLogs,
}) => {
  const availableAccounts = accounts.filter((a) => a.tokenStatus === 'available');
  const lowAccounts = accounts.filter((a) => a.tokenStatus === 'low');
  const exhaustedAccounts = accounts.filter((a) => a.tokenStatus === 'exhausted');

  // Find the next reset date among exhausted accounts
  const nextResetAccount = exhaustedAccounts
    .filter((a) => a.resetDate)
    .sort((a, b) => new Date(a.resetDate!).getTime() - new Date(b.resetDate!).getTime())[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Total & Available Accounts */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Contas de IA
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900">
            {accounts.length} <span className="text-sm font-normal text-slate-500">cadastradas</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="inline-flex items-center text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {availableAccounts.length} ok
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center text-amber-600 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              {lowAccounts.length} baixo
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center text-rose-600 font-medium">
              <XCircle className="w-3.5 h-3.5 mr-1" />
              {exhaustedAccounts.length} off
            </span>
          </div>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Projetos Ativos
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FolderGit2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900">
            {projects.length} <span className="text-sm font-normal text-slate-500">repositórios</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 truncate">
            {projects.length > 0 ? `Ativo: ${projects[0].name}` : 'Nenhum projeto registrado'}
          </p>
        </div>
      </div>

      {/* Migrations Executed */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Migrações Realizadas
          </span>
          <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900">
            {migrationLogs.length} <span className="text-sm font-normal text-slate-500">trocas de conta</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Histórico completo gravado
          </p>
        </div>
      </div>

      {/* Next Token Reset */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Próxima Renovação
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          {nextResetAccount ? (
            <>
              <div className="text-lg font-bold text-amber-700 truncate">
                {formatRelativeResetTime(nextResetAccount.resetDate)}
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate">
                Conta: <span className="font-medium text-slate-700">{nextResetAccount.email}</span>
              </p>
            </>
          ) : (
            <>
              <div className="text-base font-semibold text-emerald-600">
                Sem bloqueios de cota
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Todas as contas operacionais
              </p>
            </>
          )}
        </div>
      </div>

    </div>
  );
};
