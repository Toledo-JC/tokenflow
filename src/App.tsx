import React, { useState, useEffect } from 'react';
import { Account, Project, MigrationLog, ViewTab, ProjectAccountVersion, ProjectTask, GoogleUser } from './types';
import { 
  loadAccounts, 
  saveAccounts, 
  loadProjects, 
  saveProjects, 
  loadMigrationLogs, 
  saveMigrationLogs, 
  resetToDefaults, 
  exportDataAsJson 
} from './utils/storage';
import { loadGoogleSession, FullAppData } from './utils/googleDriveService';

import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { AccountCard } from './components/AccountCard';
import { ProjectCard } from './components/ProjectCard';
import { MigrationLogs } from './components/MigrationLogs';
import { QuickTokenAssistant } from './components/QuickTokenAssistant';

import { AccountModal } from './components/AccountModal';
import { ProjectModal } from './components/ProjectModal';
import { MigrationWizardModal } from './components/MigrationWizardModal';
import { AddProjectVersionModal } from './components/AddProjectVersionModal';
import { ProjectManagementModal } from './components/ProjectManagementModal';
import { BackupModal } from './components/BackupModal';
import { ConfirmModal } from './components/ConfirmModal';

import { Search, Plus, Filter, ArrowLeftRight, Check, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');

  // Core Persistent State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [migrationLogs, setMigrationLogs] = useState<MigrationLog[]>([]);

  // Google User Auth & Backup State
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Search & Filter States
  const [accountFilter, setAccountFilter] = useState<'all' | 'available' | 'low' | 'exhausted'>('all');
  const [accountSearch, setAccountSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');

  // Modals States
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const [isMigrationWizardOpen, setIsMigrationWizardOpen] = useState(false);
  const [migrationInitialProject, setMigrationInitialProject] = useState<Project | null>(null);

  const [isAddVersionModalOpen, setIsAddVersionModalOpen] = useState(false);
  const [versionTargetProject, setVersionTargetProject] = useState<Project | null>(null);

  const [isProjectManagementModalOpen, setIsProjectManagementModalOpen] = useState(false);
  const [managementTargetProject, setManagementTargetProject] = useState<Project | null>(null);

  // Confirmation Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    confirmVariant?: 'danger' | 'warning' | 'primary';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const openConfirmation = (config: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    confirmVariant?: 'danger' | 'warning' | 'primary';
  }) => {
    setConfirmConfig({
      isOpen: true,
      title: config.title,
      message: config.message,
      onConfirm: config.onConfirm,
      confirmText: config.confirmText,
      confirmVariant: config.confirmVariant,
    });
  };

  // Toast Notification Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Load from Storage
  useEffect(() => {
    setAccounts(loadAccounts());
    setProjects(loadProjects());
    setMigrationLogs(loadMigrationLogs());

    const savedGoogle = loadGoogleSession();
    if (savedGoogle) {
      setGoogleUser(savedGoogle);
    }
  }, []);

  // Restore full data from Google Drive or Local Backup
  const handleRestoreFullData = (data: FullAppData) => {
    if (data.accounts) {
      handleUpdateAccounts(data.accounts);
    }
    if (data.projects) {
      handleUpdateProjects(data.projects);
    }
    if (data.migrations) {
      handleUpdateLogs(data.migrations);
    }
  };

  // Save changes to storage
  const handleUpdateAccounts = (newAccs: Account[]) => {
    setAccounts(newAccs);
    saveAccounts(newAccs);
  };

  const handleUpdateProjects = (newProjs: Project[]) => {
    setProjects(newProjs);
    saveProjects(newProjs);
  };

  const handleUpdateLogs = (newLogs: MigrationLog[]) => {
    setMigrationLogs(newLogs);
    saveMigrationLogs(newLogs);
  };

  // Reset to default sample data
  const handleResetData = () => {
    openConfirmation({
      title: 'Restaurar Dados de Exemplo',
      message: 'Deseja restaurar as contas e projetos de exemplo? Todas as edições atuais serão redefinidas para o estado padrão.',
      confirmText: 'Restaurar Dados',
      confirmVariant: 'warning',
      onConfirm: () => {
        const defaults = resetToDefaults();
        setAccounts(defaults.accounts);
        setProjects(defaults.projects);
        setMigrationLogs(defaults.migrations);
        showToast('Dados de exemplo restaurados com sucesso!');
      },
    });
  };

  // Export JSON
  const handleExportData = () => {
    exportDataAsJson(accounts, projects, migrationLogs);
    showToast('Backup do histórico e contas exportado com sucesso!');
  };

  // --- Account Actions ---
  const handleSaveAccount = (accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => {
    const now = new Date().toISOString();
    if (id) {
      // Edit
      const updated = accounts.map((a) => (a.id === id ? { ...a, ...accountData, updatedAt: now } : a));
      handleUpdateAccounts(updated);
      showToast(`Conta ${accountData.email} atualizada!`);
    } else {
      // Create
      const newAcc: Account = {
        ...accountData,
        id: `acc-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newAcc, ...accounts];
      handleUpdateAccounts(updated);
      showToast(`Nova conta ${accountData.email} cadastrada!`);
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    const acc = accounts.find((a) => a.id === accountId);
    if (!acc) return;

    openConfirmation({
      title: 'Excluir Conta',
      message: `Tem certeza que deseja excluir a conta "${acc.email}" (@${acc.githubUsername})? Ela será removida da lista.`,
      confirmText: 'Excluir Conta',
      confirmVariant: 'danger',
      onConfirm: () => {
        const updated = accounts.filter((a) => a.id !== accountId);
        handleUpdateAccounts(updated);
        showToast(`Conta ${acc.email} removida com sucesso.`);
      },
    });
  };

  const handleUpdateAccountStatus = (
    accountId: string, 
    newStatus: Account['tokenStatus'], 
    newPercentage: number
  ) => {
    const now = new Date().toISOString();
    const updated = accounts.map((a) => {
      if (a.id === accountId) {
        return {
          ...a,
          tokenStatus: newStatus,
          tokenPercentage: newPercentage,
          updatedAt: now,
        };
      }
      return a;
    });
    handleUpdateAccounts(updated);
    showToast('Status da cota de tokens atualizado!');
  };

  // --- Project Actions & Version Management ---
  const handleSaveProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => {
    const now = new Date().toISOString();
    if (id) {
      // Edit
      const updated = projects.map((p) => (p.id === id ? { ...p, ...projectData, updatedAt: now } : p));
      handleUpdateProjects(updated);
      showToast(`Projeto "${projectData.name}" atualizado!`);
    } else {
      // Create initial project with first version entry
      const newVer: ProjectAccountVersion = {
        id: `ver-${Date.now()}`,
        accountId: projectData.currentAccountId,
        branch: projectData.currentBranch,
        version: projectData.currentVersion,
        assignedAt: now,
        status: 'active',
      };

      const newProj: Project = {
        ...projectData,
        id: `proj-${Date.now()}`,
        accountVersions: [newVer],
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newProj, ...projects];
      handleUpdateProjects(updated);
      showToast(`Projeto "${projectData.name}" cadastrado!`);
    }
  };

  const handleAddProjectVersion = (
    projectId: string,
    versionData: {
      accountId: string;
      branch: string;
      version: string;
      setAsActive: boolean;
      notes?: string;
    }
  ) => {
    const now = new Date().toISOString();
    const newVerItem: ProjectAccountVersion = {
      id: `ver-${Date.now()}`,
      accountId: versionData.accountId,
      branch: versionData.branch,
      version: versionData.version,
      assignedAt: now,
      status: versionData.setAsActive ? 'active' : 'archived',
      notes: versionData.notes,
    };

    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        const existingVersions = p.accountVersions || [];
        const newVersions = versionData.setAsActive
          ? existingVersions.map((v) => ({ ...v, status: 'archived' as const })).concat(newVerItem)
          : existingVersions.concat(newVerItem);

        return {
          ...p,
          accountVersions: newVersions,
          ...(versionData.setAsActive && {
            currentAccountId: versionData.accountId,
            currentBranch: versionData.branch,
            currentVersion: versionData.version,
            lastMigratedAt: now,
          }),
          updatedAt: now,
        };
      }
      return p;
    });

    handleUpdateProjects(updatedProjects);
    showToast('Nova conta e versão vinculadas ao projeto!');
  };

  const handleSwitchActiveVersion = (
    projectId: string,
    accountId: string,
    branch: string,
    version: string
  ) => {
    const now = new Date().toISOString();
    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        const updatedVers = (p.accountVersions || []).map((v) => ({
          ...v,
          status:
            v.accountId === accountId && v.branch === branch && v.version === version
              ? ('active' as const)
              : ('archived' as const),
        }));

        return {
          ...p,
          currentAccountId: accountId,
          currentBranch: branch,
          currentVersion: version,
          accountVersions: updatedVers,
          updatedAt: now,
        };
      }
      return p;
    });

    handleUpdateProjects(updatedProjects);
    showToast(`Versão ${version} ativada no projeto!`);
  };

  const handleDeleteProjectVersion = (projectId: string, versionId: string) => {
    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          accountVersions: (p.accountVersions || []).filter((v) => v.id !== versionId),
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    handleUpdateProjects(updatedProjects);
    showToast('Versão removida do projeto.');
  };

  const handleUpdateProjectTasks = (projectId: string, tasks: ProjectTask[]) => {
    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    handleUpdateProjects(updatedProjects);

    if (managementTargetProject && managementTargetProject.id === projectId) {
      setManagementTargetProject((prev) => (prev ? { ...prev, tasks } : null));
    }
  };

  const handleUpdateProjectDocs = (projectId: string, documentation: string) => {
    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          documentation,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    handleUpdateProjects(updatedProjects);

    if (managementTargetProject && managementTargetProject.id === projectId) {
      setManagementTargetProject((prev) => (prev ? { ...prev, documentation } : null));
    }
    showToast('Documentação do projeto salva!');
  };

  const handleUpdateProjectVersionChangelog = (projectId: string, versionId: string, changelog: string) => {
    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        const updatedVers = (p.accountVersions || []).map((v) => {
          if (v.id === versionId) {
            return { ...v, changelog, notes: changelog };
          }
          return v;
        });
        return {
          ...p,
          accountVersions: updatedVers,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    handleUpdateProjects(updatedProjects);

    if (managementTargetProject && managementTargetProject.id === projectId) {
      setManagementTargetProject((prev) => {
        if (!prev) return null;
        const updatedVers = (prev.accountVersions || []).map((v) => {
          if (v.id === versionId) {
            return { ...v, changelog, notes: changelog };
          }
          return v;
        });
        return { ...prev, accountVersions: updatedVers };
      });
    }
    showToast('Resumo da versão atualizado!');
  };

  const handleDeleteProject = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    openConfirmation({
      title: 'Excluir Projeto',
      message: `Tem certeza que deseja excluir o projeto "${proj.name}"? Esta ação removerá o registro do dashboard.`,
      confirmText: 'Excluir Projeto',
      confirmVariant: 'danger',
      onConfirm: () => {
        const updated = projects.filter((p) => p.id !== projectId);
        handleUpdateProjects(updated);
        showToast(`Projeto "${proj.name}" excluído com sucesso.`);
      },
    });
  };

  const handleDeleteLog = (logId: string) => {
    openConfirmation({
      title: 'Remover Registro de Histórico',
      message: 'Deseja remover este registro de migração do histórico?',
      confirmText: 'Remover Registro',
      confirmVariant: 'danger',
      onConfirm: () => {
        const updated = migrationLogs.filter((l) => l.id !== logId);
        handleUpdateLogs(updated);
        showToast('Registro de migração removido.');
      },
    });
  };

  // --- Migration Execution ---
  const handleExecuteMigration = (params: {
    projectId: string;
    toAccountId: string;
    toBranch: string;
    toVersion: string;
    reason: string;
    markPreviousExhausted: boolean;
  }) => {
    const now = new Date().toISOString();
    const proj = projects.find((p) => p.id === params.projectId);
    if (!proj) return;

    const fromAccount = accounts.find((a) => a.id === proj.currentAccountId);
    const toAccount = accounts.find((a) => a.id === params.toAccountId);

    if (!toAccount) return;

    // 1. Update Project Active Account, Branch & Append Version
    const newVerEntry: ProjectAccountVersion = {
      id: `ver-${Date.now()}`,
      accountId: params.toAccountId,
      branch: params.toBranch,
      version: params.toVersion,
      assignedAt: now,
      status: 'active',
      notes: params.reason,
    };

    const updatedProjects = projects.map((p) => {
      if (p.id === params.projectId) {
        const oldVers = (p.accountVersions || []).map((v) => ({ ...v, status: 'archived' as const }));
        return {
          ...p,
          currentAccountId: params.toAccountId,
          currentBranch: params.toBranch,
          currentVersion: params.toVersion,
          accountVersions: [...oldVers, newVerEntry],
          lastMigratedAt: now,
          updatedAt: now,
        };
      }
      return p;
    });
    handleUpdateProjects(updatedProjects);

    // 2. Mark previous account as exhausted if requested
    let updatedAccounts = accounts;
    if (fromAccount && params.markPreviousExhausted) {
      updatedAccounts = accounts.map((a) => {
        if (a.id === fromAccount.id) {
          return {
            ...a,
            tokenStatus: 'exhausted' as const,
            tokenPercentage: 0,
            updatedAt: now,
          };
        }
        return a;
      });
      handleUpdateAccounts(updatedAccounts);
    }

    // 3. Create Audit Migration Log
    const newLog: MigrationLog = {
      id: `log-${Date.now()}`,
      projectId: proj.id,
      projectName: proj.name,
      fromAccountId: fromAccount?.id || 'none',
      fromAccountEmail: fromAccount?.email || 'Nenhuma',
      fromGithubUsername: fromAccount?.githubUsername || '-',
      toAccountId: toAccount.id,
      toAccountEmail: toAccount.email,
      toGithubUsername: toAccount.githubUsername,
      fromBranch: proj.currentBranch,
      toBranch: params.toBranch,
      fromVersion: proj.currentVersion,
      toVersion: params.toVersion,
      reason: params.reason,
      timestamp: now,
      markPreviousExhausted: params.markPreviousExhausted,
    };

    handleUpdateLogs([newLog, ...migrationLogs]);

    showToast(`Projeto "${proj.name}" migrado com sucesso para ${toAccount.email}!`);
  };


  // --- Filtering Accounts & Projects ---
  const filteredAccounts = accounts.filter((acc) => {
    const matchesFilter = accountFilter === 'all' || acc.tokenStatus === accountFilter;
    const matchesSearch =
      acc.email.toLowerCase().includes(accountSearch.toLowerCase()) ||
      acc.githubUsername.toLowerCase().includes(accountSearch.toLowerCase()) ||
      acc.aiProvider.toLowerCase().includes(accountSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredProjects = projects.filter((proj) => {
    const acc = accounts.find((a) => a.id === proj.currentAccountId);
    const search = projectSearch.toLowerCase();
    return (
      proj.name.toLowerCase().includes(search) ||
      proj.currentBranch.toLowerCase().includes(search) ||
      proj.currentVersion.toLowerCase().includes(search) ||
      (acc && acc.email.toLowerCase().includes(search)) ||
      (acc && acc.githubUsername.toLowerCase().includes(search))
    );
  });

  const availableAccountsCount = accounts.filter((a) => a.tokenStatus === 'available').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased pb-16">
      
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewAccountModal={() => {
          setAccountToEdit(null);
          setIsAccountModalOpen(true);
        }}
        onOpenNewProjectModal={() => {
          setProjectToEdit(null);
          setIsProjectModalOpen(true);
        }}
        onOpenMigrationWizard={() => {
          setMigrationInitialProject(null);
          setIsMigrationWizardOpen(true);
        }}
        onExport={handleExportData}
        onResetData={handleResetData}
        availableAccountsCount={availableAccountsCount}
        totalAccountsCount={accounts.length}
        googleUser={googleUser}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Toast Floating Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fade-in border border-slate-700">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Global Stats bar on Dashboard tab */}
        {activeTab === 'dashboard' && (
          <StatsOverview
            accounts={accounts}
            projects={projects}
            migrationLogs={migrationLogs}
          />
        )}

        {/* --- TAB 1: DASHBOARD (PANEL) --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Quick Projects Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Projetos & Versões em Desenvolvimento
                  </h2>
                  <p className="text-xs text-slate-500">
                    Acompanhe em qual conta e branch cada software está sendo trabalhado
                  </p>
                </div>
                <button
                  onClick={() => {
                    setProjectToEdit(null);
                    setIsProjectModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Novo Projeto
                </button>
              </div>

              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {projects.map((proj) => {
                    const acc = accounts.find((a) => a.id === proj.currentAccountId);
                    const projMigrations = migrationLogs.filter((m) => m.projectId === proj.id);
                    return (
                      <ProjectCard
                        key={proj.id}
                        project={proj}
                        assignedAccount={acc}
                        accounts={accounts}
                        projectMigrations={projMigrations}
                        onEdit={(p) => {
                          setProjectToEdit(p);
                          setIsProjectModalOpen(true);
                        }}
                        onDelete={handleDeleteProject}
                        onMigrate={(p) => {
                          setMigrationInitialProject(p);
                          setIsMigrationWizardOpen(true);
                        }}
                        onViewHistory={() => setActiveTab('migrations')}
                        onOpenAddVersion={(p) => {
                          setVersionTargetProject(p);
                          setIsAddVersionModalOpen(true);
                        }}
                        onOpenManagement={(p) => {
                          setManagementTargetProject(p);
                          setIsProjectManagementModalOpen(true);
                        }}
                        onSwitchActiveVersion={handleSwitchActiveVersion}
                        onDeleteVersion={handleDeleteProjectVersion}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                  <p className="text-sm font-medium text-slate-600">Nenhum projeto registrado.</p>
                  <button
                    onClick={() => {
                      setProjectToEdit(null);
                      setIsProjectModalOpen(true);
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-xs"
                  >
                    Cadastrar Primeiro Projeto
                  </button>
                </div>
              )}
            </section>

            {/* Quick Accounts Status Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Saldo de Tokens das Contas IA
                  </h2>
                  <p className="text-xs text-slate-500">
                    Veja se há tokens suficientes antes de iniciar ou migrar um código
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('accounts')}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Ver todas as contas ({accounts.length}) ➔
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {accounts.map((acc) => {
                  const assigned = projects.filter((p) => p.currentAccountId === acc.id);
                  return (
                    <AccountCard
                      key={acc.id}
                      account={acc}
                      assignedProjects={assigned}
                      onEdit={(a) => {
                        setAccountToEdit(a);
                        setIsAccountModalOpen(true);
                      }}
                      onDelete={handleDeleteAccount}
                      onUpdateStatus={handleUpdateAccountStatus}
                      onQuickMigrateFromThis={(a) => {
                        const firstProj = assigned[0] || null;
                        setMigrationInitialProject(firstProj);
                        setIsMigrationWizardOpen(true);
                      }}
                    />
                  );
                })}
              </div>
            </section>

          </div>
        )}

        {/* --- TAB 2: MINHAS CONTAS --- */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Contas e Saldos de IA</h2>
                <p className="text-xs text-slate-500">
                  Gerencie seus e-mails e usernames do GitHub associados às plataformas de IA
                </p>
              </div>

              {/* Filters & Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por e-mail, github..."
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex rounded-xl bg-slate-100 p-1 text-xs border border-slate-200">
                  <button
                    onClick={() => setAccountFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      accountFilter === 'all' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Todas ({accounts.length})
                  </button>
                  <button
                    onClick={() => setAccountFilter('available')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      accountFilter === 'available' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    OK
                  </button>
                  <button
                    onClick={() => setAccountFilter('low')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      accountFilter === 'low' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Pouco
                  </button>
                  <button
                    onClick={() => setAccountFilter('exhausted')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      accountFilter === 'exhausted' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Esgotadas
                  </button>
                </div>

                <button
                  onClick={() => {
                    setAccountToEdit(null);
                    setIsAccountModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Nova Conta
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAccounts.map((acc) => {
                const assigned = projects.filter((p) => p.currentAccountId === acc.id);
                return (
                  <AccountCard
                    key={acc.id}
                    account={acc}
                    assignedProjects={assigned}
                    onEdit={(a) => {
                      setAccountToEdit(a);
                      setIsAccountModalOpen(true);
                    }}
                    onDelete={handleDeleteAccount}
                    onUpdateStatus={handleUpdateAccountStatus}
                    onQuickMigrateFromThis={(a) => {
                      setMigrationInitialProject(assigned[0] || null);
                      setIsMigrationWizardOpen(true);
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB 3: PROJETOS & BRANCHES --- */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Projetos & Branches GitHub</h2>
                <p className="text-xs text-slate-500">
                  Monitore em qual conta, versão e branch cada repositório está ativo
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por projeto, branch, versão..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <button
                  onClick={() => {
                    setProjectToEdit(null);
                    setIsProjectModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Novo Projeto
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((proj) => {
                const acc = accounts.find((a) => a.id === proj.currentAccountId);
                const projMigrations = migrationLogs.filter((m) => m.projectId === proj.id);
                return (
                  <ProjectCard
                    key={proj.id}
                    project={proj}
                    assignedAccount={acc}
                    accounts={accounts}
                    projectMigrations={projMigrations}
                    onEdit={(p) => {
                      setProjectToEdit(p);
                      setIsProjectModalOpen(true);
                    }}
                    onDelete={handleDeleteProject}
                    onMigrate={(p) => {
                      setMigrationInitialProject(p);
                      setIsMigrationWizardOpen(true);
                    }}
                    onViewHistory={() => setActiveTab('migrations')}
                    onOpenAddVersion={(p) => {
                      setVersionTargetProject(p);
                      setIsAddVersionModalOpen(true);
                    }}
                    onOpenManagement={(p) => {
                      setManagementTargetProject(p);
                      setIsProjectManagementModalOpen(true);
                    }}
                    onSwitchActiveVersion={handleSwitchActiveVersion}
                    onDeleteVersion={handleDeleteProjectVersion}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB 4: HISTÓRICO DE MIGRAÇÕES --- */}
        {activeTab === 'migrations' && (
          <MigrationLogs logs={migrationLogs} onDeleteLog={handleDeleteLog} />
        )}

        {/* --- TAB 5: ASSISTENTE DE ROTAÇÃO --- */}
        {activeTab === 'assistant' && (
          <QuickTokenAssistant
            accounts={accounts}
            projects={projects}
            onOpenMigrationWizard={() => {
              setMigrationInitialProject(null);
              setIsMigrationWizardOpen(true);
            }}
          />
        )}

      </main>

      {/* --- MODALS --- */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleSaveAccount}
        accountToEdit={accountToEdit}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        projectToEdit={projectToEdit}
        accounts={accounts}
      />

      <MigrationWizardModal
        isOpen={isMigrationWizardOpen}
        onClose={() => setIsMigrationWizardOpen(false)}
        projects={projects}
        accounts={accounts}
        initialProject={migrationInitialProject}
        onExecuteMigration={handleExecuteMigration}
      />

      <AddProjectVersionModal
        isOpen={isAddVersionModalOpen}
        onClose={() => setIsAddVersionModalOpen(false)}
        project={versionTargetProject}
        accounts={accounts}
        onAddVersion={handleAddProjectVersion}
      />

      <ProjectManagementModal
        isOpen={isProjectManagementModalOpen}
        onClose={() => setIsProjectManagementModalOpen(false)}
        project={managementTargetProject}
        accounts={accounts}
        onUpdateProjectTasks={handleUpdateProjectTasks}
        onUpdateProjectDocs={handleUpdateProjectDocs}
        onUpdateProjectVersionChangelog={handleUpdateProjectVersionChangelog}
        onSwitchActiveVersion={handleSwitchActiveVersion}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        googleUser={googleUser}
        onGoogleLoginSuccess={(user) => setGoogleUser(user)}
        onGoogleLogout={() => setGoogleUser(null)}
        accounts={accounts}
        projects={projects}
        migrations={migrationLogs}
        onRestoreData={handleRestoreFullData}
        showToast={(msg) => showToast(msg)}
      />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        confirmVariant={confirmConfig.confirmVariant}
      />

    </div>
  );
}
