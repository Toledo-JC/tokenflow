import React, { useState } from 'react';
import { Project, Account, MigrationLog } from '../types';
import { formatDatePortuguese } from '../utils/storage';
import { 
  FolderGit2, 
  GitBranch, 
  Tag, 
  ExternalLink, 
  ArrowLeftRight, 
  Mail, 
  Github, 
  History, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  ChevronDown,
  ChevronUp,
  Layers,
  Check,
  Cpu,
  UserCheck,
  ListTodo,
  BookOpen
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  assignedAccount?: Account;
  accounts: Account[];
  projectMigrations: MigrationLog[];
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onMigrate: (project: Project) => void;
  onViewHistory: (project: Project) => void;
  onOpenAddVersion: (project: Project) => void;
  onOpenManagement?: (project: Project) => void;
  onSwitchActiveVersion: (projectId: string, accountId: string, branch: string, version: string) => void;
  onDeleteVersion?: (projectId: string, versionId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  assignedAccount,
  accounts,
  projectMigrations,
  onEdit,
  onDelete,
  onMigrate,
  onViewHistory,
  onOpenAddVersion,
  onOpenManagement,
  onSwitchActiveVersion,
  onDeleteVersion,
}) => {
  const [showAllVersions, setShowAllVersions] = useState(true);

  const accountVersions = project.accountVersions && project.accountVersions.length > 0
    ? project.accountVersions
    : [
        {
          id: `ver-default-${project.id}`,
          accountId: project.currentAccountId,
          branch: project.currentBranch,
          version: project.currentVersion,
          assignedAt: project.createdAt,
          status: 'active' as const,
        }
      ];

  const getAccountStatusBadge = () => {
    if (!assignedAccount) {
      return (
        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
          Sem conta vinculada
        </span>
      );
    }

    switch (assignedAccount.tokenStatus) {
      case 'available':
        return (
          <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            <CheckCircle className="w-3 h-3 mr-1 text-emerald-500" />
            Tokens OK ({assignedAccount.tokenPercentage}%)
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" />
            Tokens Poucos ({assignedAccount.tokenPercentage}%)
          </span>
        );
      case 'exhausted':
        return (
          <span className="inline-flex items-center text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
            <XCircle className="w-3 h-3 mr-1 text-rose-500" />
            Esgotado!
          </span>
        );
    }
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden ${
      assignedAccount?.tokenStatus === 'exhausted' ? 'border-rose-300 ring-1 ring-rose-100' : 'border-slate-200'
    }`}>
      <div className="p-5">
        {/* Header Title & Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-snug">
                {project.name}
              </h3>
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs text-indigo-600 hover:underline mt-0.5"
                >
                  Repositório GitHub <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            {onOpenManagement && (
              <button
                onClick={() => onOpenManagement(project)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                title="Gerenciar tarefas, histórico de versões e documentação do projeto"
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>Tarefas & Docs</span>
              </button>
            )}
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
              title="Editar projeto e contas vinculadas"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Excluir projeto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {project.description && (
          <p className="mt-2.5 text-xs text-slate-600 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Section: Linked Accounts List (Contas & Versões Vinculadas) */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              Contas Vinculadas ao Projeto ({accountVersions.length})
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onOpenAddVersion(project)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                title="Vincular outra conta de IA ao projeto"
              >
                <Plus className="w-3 h-3" />
                <span>+ Conta</span>
              </button>

              <button
                onClick={() => setShowAllVersions(!showAllVersions)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showAllVersions ? "Ocultar lista" : "Expandir lista"}
              >
                {showAllVersions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* List of accounts stacked vertically */}
          {showAllVersions && (
            <div className="space-y-2">
              {accountVersions.map((ver) => {
                const verAcc = accounts.find((a) => a.id === ver.accountId);
                const isActive =
                  ver.accountId === project.currentAccountId &&
                  ver.branch === project.currentBranch &&
                  ver.version === project.currentVersion;

                return (
                  <div
                    key={ver.id}
                    className={`p-3 rounded-xl border transition-all space-y-2 ${
                      isActive
                        ? 'bg-indigo-50/40 border-indigo-200 ring-1 ring-indigo-100/60 shadow-2xs'
                        : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {/* Header line: Git Account & Email */}
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Github className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                        <span className="font-bold font-mono text-slate-900 truncate">
                          @{verAcc?.githubUsername || 'git-user'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="text-slate-600 truncate font-medium text-[11px]">
                          {verAcc?.email || 'Conta não encontrada'}
                        </span>
                      </div>

                      {/* Active Status Badge / Activate Button */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isActive ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3" /> ATIVA
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              onSwitchActiveVersion(
                                project.id,
                                ver.accountId,
                                ver.branch,
                                ver.version
                              )
                            }
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                            title="Alternar para esta conta"
                          >
                            Ativar
                          </button>
                        )}

                        {onDeleteVersion && !isActive && (
                          <button
                            onClick={() => onDeleteVersion(project.id, ver.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Desvincular versão"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Meta line: IA, Versão, Branch */}
                    <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-200/60 text-[11px]">
                      {/* IA Platform */}
                      <div className="flex items-center gap-1 text-slate-700 min-w-0">
                        <Cpu className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="font-semibold truncate" title={verAcc?.aiProvider}>
                          {verAcc?.aiProvider || 'IA Padrão'}
                        </span>
                      </div>

                      {/* Versão */}
                      <div className="flex items-center gap-1 font-mono font-bold text-slate-800 min-w-0">
                        <Tag className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{ver.version}</span>
                      </div>

                      {/* Branch */}
                      <div className="flex items-center gap-1 font-mono text-slate-600 font-medium min-w-0">
                        <GitBranch className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate" title={ver.branch}>
                          {ver.branch}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Last migration timestamp if any */}
        {project.lastMigratedAt && (
          <div className="mt-3.5 text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Última rotação em {formatDatePortuguese(project.lastMigratedAt)}</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-slate-50 border-t border-slate-100 p-3.5 flex items-center gap-2">
        {onOpenManagement && (
          <button
            onClick={() => onOpenManagement(project)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer border border-slate-200"
            title="Gerenciar tarefas, roadmap e documentação"
          >
            <ListTodo className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tarefas & Docs</span>
          </button>
        )}

        <button
          onClick={() => onMigrate(project)}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            assignedAccount?.tokenStatus === 'exhausted'
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs animate-bounce-short'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          Rotacionar / Migrar
        </button>

        <button
          onClick={() => onViewHistory(project)}
          className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title={`Ver histórico de migrações (${projectMigrations.length})`}
        >
          <History className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </div>
  );
};
