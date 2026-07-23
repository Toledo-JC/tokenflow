import React, { useState, useEffect } from 'react';
import { Project, Account, ProjectAccountVersion } from '../types';
import { 
  X, 
  FolderGit2, 
  GitBranch, 
  Tag, 
  Link, 
  Mail, 
  Plus, 
  Trash2, 
  Check, 
  UserCheck, 
  Cpu, 
  Github,
  Sparkles,
  Info
} from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  projectToEdit?: Project | null;
  accounts: Account[];
}

interface LinkedVersionFormItem {
  id: string;
  accountId: string;
  branch: string;
  version: string;
  notes: string;
  isActive: boolean;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectToEdit,
  accounts,
}) => {
  const [name, setName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'paused' | 'completed'>('active');

  const [linkedVersions, setLinkedVersions] = useState<LinkedVersionFormItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    if (projectToEdit) {
      setName(projectToEdit.name || '');
      setRepoUrl(projectToEdit.repoUrl || '');
      setDescription(projectToEdit.description || '');
      setStatus(projectToEdit.status || 'active');

      if (projectToEdit.accountVersions && projectToEdit.accountVersions.length > 0) {
        const mapped = projectToEdit.accountVersions.map((v) => ({
          id: v.id || `ver-${Math.random()}`,
          accountId: v.accountId,
          branch: v.branch,
          version: v.version,
          notes: v.notes || v.changelog || '',
          isActive:
            v.accountId === projectToEdit.currentAccountId &&
            v.branch === projectToEdit.currentBranch &&
            v.version === projectToEdit.currentVersion,
        }));

        // If none was marked active for some reason, mark first as active
        if (!mapped.some((m) => m.isActive) && mapped.length > 0) {
          mapped[0].isActive = true;
        }

        setLinkedVersions(mapped);
      } else {
        // Fallback for single current account
        setLinkedVersions([
          {
            id: `ver-${Date.now()}`,
            accountId: projectToEdit.currentAccountId || (accounts[0]?.id || ''),
            branch: projectToEdit.currentBranch || 'main',
            version: projectToEdit.currentVersion || 'v1.0.0',
            notes: 'Versão inicial do projeto',
            isActive: true,
          },
        ]);
      }
    } else {
      // Create New Project defaults
      setName('');
      setRepoUrl('');
      setDescription('');
      setStatus('active');
      setLinkedVersions([
        {
          id: `ver-${Date.now()}`,
          accountId: accounts[0]?.id || '',
          branch: 'main',
          version: 'v1.0.0',
          notes: 'Versão inicial do projeto',
          isActive: true,
        },
      ]);
    }
  }, [projectToEdit, isOpen, accounts]);

  if (!isOpen) return null;

  const handleAddAccountRow = () => {
    // Pick first unused account or fallback to first account
    const usedAccountIds = linkedVersions.map((lv) => lv.accountId);
    const unusedAccount = accounts.find((a) => !usedAccountIds.includes(a.id)) || accounts[0];

    const lastItem = linkedVersions[linkedVersions.length - 1];
    let nextVersion = 'v1.1.0';
    if (lastItem) {
      const verParts = lastItem.version.replace(/^v/, '').split('.');
      if (verParts.length === 3 && !isNaN(Number(verParts[1]))) {
        verParts[1] = String(Number(verParts[1]) + 1);
        nextVersion = `v${verParts.join('.')}`;
      }
    }

    setLinkedVersions([
      ...linkedVersions,
      {
        id: `ver-${Date.now()}-${Math.random()}`,
        accountId: unusedAccount?.id || '',
        branch: lastItem ? `${lastItem.branch}-v2` : 'feature/v1.1',
        version: nextVersion,
        notes: '',
        isActive: linkedVersions.length === 0, // active if first
      },
    ]);
  };

  const handleRemoveAccountRow = (id: string) => {
    if (linkedVersions.length <= 1) return; // keep at least 1
    const updated = linkedVersions.filter((item) => item.id !== id);
    // If we deleted the active one, make the first one active
    if (!updated.some((item) => item.isActive)) {
      updated[0].isActive = true;
    }
    setLinkedVersions(updated);
  };

  const handleSetRowActive = (id: string) => {
    setLinkedVersions(
      linkedVersions.map((item) => ({
        ...item,
        isActive: item.id === id,
      }))
    );
  };

  const handleItemChange = (
    id: string,
    field: keyof LinkedVersionFormItem,
    value: string
  ) => {
    setLinkedVersions(
      linkedVersions.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Find active item or default to first
    const activeItem = linkedVersions.find((item) => item.isActive) || linkedVersions[0];

    // Format accountVersions
    const formattedVersions: ProjectAccountVersion[] = linkedVersions.map((item) => ({
      id: item.id,
      accountId: item.accountId,
      branch: item.branch || 'main',
      version: item.version || 'v1.0.0',
      assignedAt: new Date().toISOString(),
      status: item.isActive ? 'active' : 'archived',
      notes: item.notes,
      changelog: item.notes,
    }));

    onSave(
      {
        name: name.trim(),
        repoUrl: repoUrl.trim(),
        description: description.trim(),
        currentAccountId: activeItem?.accountId || (accounts[0]?.id || ''),
        currentBranch: activeItem?.branch || 'main',
        currentVersion: activeItem?.version || 'v1.0.0',
        status,
        accountVersions: formattedVersions,
      },
      projectToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fadeIn max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-indigo-600" />
              {projectToEdit ? 'Editar Projeto & Vincular Contas' : 'Novo Projeto / Software'}
            </h2>
            <p className="text-xs text-slate-500">
              Gerencie informações do software e vincule múltiplas contas com branch/versão.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
          
          {/* Main Info Box */}
          <div className="space-y-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              1. Dados Principais do Projeto
            </h3>

            {/* Name & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome do Projeto / Software <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FolderGit2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: App Web SaaS, Sistema de Vendas, Mobile App"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status do Projeto
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                >
                  <option value="active">🟢 Em Desenvolvimento</option>
                  <option value="paused">🟡 Pausado</option>
                  <option value="completed">🔵 Concluído</option>
                </select>
              </div>
            </div>

            {/* GitHub Repo URL */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                URL do Repositório GitHub
              </label>
              <div className="relative">
                <Link className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://github.com/seu-usuario/meu-repositorio"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Descrição e Objetivo do Software
              </label>
              <textarea
                rows={2}
                placeholder="Breve resumo do projeto e tecnologias utilizadas..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Linked Accounts & Versions Section */}
          <div className="space-y-3">
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-amber-950 text-[11px] leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Desvinculação Flexível (Email x IA):</span> Um mesmo e-mail e usuário do Git/GitHub pode ser utilizado em múltiplas plataformas de IA (Gemini, Claude, ChatGPT, Cursor, Windsurf, v0, Bolt, etc.). Selecione a IA e conta específica associada a cada branch e versão.
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  2. Contas de IA & Versões Vinculadas ({linkedVersions.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Marque com <span className="font-bold text-emerald-600">"CONTA ATIVA"</span> a conta em uso no momento.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddAccountRow}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors border border-indigo-200/60"
              >
                <Plus className="w-4 h-4" />
                + Vincular Outra Conta / IA
              </button>
            </div>

            {/* List of Account rows */}
            <div className="space-y-3">
              {linkedVersions.map((item, index) => {
                const selectedAcc = accounts.find((a) => a.id === item.accountId);

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      item.isActive
                        ? 'bg-indigo-50/40 border-indigo-300 ring-2 ring-indigo-200/60 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Account Selector + Active Toggle + Delete */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                        <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />
                        <select
                          value={item.accountId}
                          onChange={(e) => handleItemChange(item.id, 'accountId', e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20"
                        >
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              🤖 [{acc.aiProvider}] — {acc.email} (@{acc.githubUsername}) - Tokens: {acc.tokenPercentage}%
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.isActive ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[11px] flex items-center gap-1.5 shadow-2xs">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            CONTA ATIVA AGORA
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetRowActive(item.id)}
                            className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            Marcar como Ativa
                          </button>
                        )}

                        {linkedVersions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAccountRow(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Desvincular esta conta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Account Stats Preview pill */}
                    {selectedAcc && (
                      <div className="px-3 py-1.5 bg-slate-100/70 rounded-lg text-[11px] flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Cpu className="w-3 h-3 text-indigo-500" />
                          IA: {selectedAcc.aiProvider}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Github className="w-3 h-3" /> @{selectedAcc.githubUsername}
                        </span>
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          selectedAcc.tokenStatus === 'available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : selectedAcc.tokenStatus === 'low'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {selectedAcc.tokenPercentage}% Tokens
                        </span>
                      </div>
                    )}

                    {/* Branch & Version Tag Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                          Branch do Git
                        </label>
                        <div className="relative">
                          <GitBranch className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            placeholder="main"
                            value={item.branch}
                            onChange={(e) => handleItemChange(item.id, 'branch', e.target.value)}
                            className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                          Versão (Tag)
                        </label>
                        <div className="relative">
                          <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            placeholder="v1.0.0"
                            value={item.version}
                            onChange={(e) => handleItemChange(item.id, 'version', e.target.value)}
                            className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes / Changelog for this version */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                        O que foi feito nesta versão / Observações
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Criado layout base, configurado login, refatorado banco..."
                        value={item.notes}
                        onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {projectToEdit ? 'Salvar Alterações do Projeto' : 'Criar Projeto'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
