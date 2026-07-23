import React, { useState } from 'react';
import { Project, Account, ProjectTask, ProjectAccountVersion } from '../types';
import { 
  X, 
  CheckSquare, 
  FileText, 
  History, 
  Plus, 
  Trash2, 
  Check, 
  Tag, 
  GitBranch, 
  Cpu, 
  Mail, 
  Github, 
  Sparkles, 
  Edit3, 
  ListTodo, 
  BookOpen, 
  Layers,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Circle,
  Upload,
  Download,
  FileCode,
  Info
} from 'lucide-react';

interface ProjectManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  accounts: Account[];
  onUpdateProjectTasks: (projectId: string, tasks: ProjectTask[]) => void;
  onUpdateProjectDocs: (projectId: string, documentation: string) => void;
  onUpdateProjectVersionChangelog: (projectId: string, versionId: string, changelog: string) => void;
  onSwitchActiveVersion: (projectId: string, accountId: string, branch: string, version: string) => void;
}

const SAMPLE_XML_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<tarefas>
  <tarefa>
    <id>task-001</id>
    <titulo>Implementar autenticação Google Drive para backup</titulo>
    <categoria>feature</categoria>
    <prioridade>alta</prioridade>
    <versao>v1.1.0</versao>
    <status>concluido</status>
    <criadoEm>2026-07-20T10:00:00.000Z</criadoEm>
    <concluidoEm>2026-07-23T10:50:00.000Z</concluidoEm>
  </tarefa>
  <tarefa>
    <id>task-002</id>
    <titulo>Corrigir seleção de contas de IA por versão do projeto</titulo>
    <categoria>bug</categoria>
    <prioridade>alta</prioridade>
    <versao>v1.0.1</versao>
    <status>concluido</status>
    <concluidoEm>2026-07-22T15:30:00.000Z</concluidoEm>
  </tarefa>
  <tarefa>
    <titulo>Escrever documentação dos endpoints do sistema</titulo>
    <categoria>docs</categoria>
    <prioridade>baixa</prioridade>
    <versao>v1.2.0</versao>
    <status>pendente</status>
  </tarefa>
</tarefas>`;

export const ProjectManagementModal: React.FC<ProjectManagementModalProps> = ({
  isOpen,
  onClose,
  project,
  accounts,
  onUpdateProjectTasks,
  onUpdateProjectDocs,
  onUpdateProjectVersionChangelog,
  onSwitchActiveVersion,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'changelog' | 'docs'>('tasks');

  // Task form & filter states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'feature' | 'bug' | 'docs' | 'refactor'>('feature');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [newTaskVersion, setNewTaskVersion] = useState('');
  
  // Advanced Filters
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<'all' | 'feature' | 'bug' | 'docs' | 'refactor'>('all');

  const [showXmlTemplateModal, setShowXmlTemplateModal] = useState(false);
  const [importStatusMsg, setImportStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Docs state
  const [docContent, setDocContent] = useState('');
  const [isEditingDocs, setIsEditingDocs] = useState(false);

  // Changelog edit state
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [changelogText, setChangelogText] = useState('');

  React.useEffect(() => {
    if (project) {
      setDocContent(project.documentation || '');
      setNewTaskVersion(project.currentVersion || 'v1.0.0');
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const tasks = project.tasks || [];
  const accountVersions = project.accountVersions || [];

  // Helper XML escaper
  const encodeXml = (str: string) => {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  // --- XML Import, Export & Template Handlers ---
  const handleDownloadXmlTemplate = () => {
    const blob = new Blob([SAMPLE_XML_TEMPLATE], { type: 'text/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `modelo_tarefas_${project.name.toLowerCase().replace(/\s+/g, '_')}.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportXmlTasks = () => {
    const tasksToExport = filteredTasks;
    if (tasksToExport.length === 0) {
      alert('Nenhuma tarefa encontrada com os filtros selecionados para exportar.');
      return;
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<tarefas projeto="${encodeXml(project.name)}">\n`;

    tasksToExport.forEach((t) => {
      xml += `  <tarefa>\n`;
      xml += `    <id>${encodeXml(t.id)}</id>\n`;
      xml += `    <titulo>${encodeXml(t.title)}</titulo>\n`;
      xml += `    <categoria>${t.category || 'feature'}</categoria>\n`;
      xml += `    <prioridade>${t.priority || 'medium'}</prioridade>\n`;
      xml += `    <versao>${encodeXml(t.versionTag || 'v1.0.0')}</versao>\n`;
      xml += `    <status>${t.completed ? 'concluido' : 'pendente'}</status>\n`;
      xml += `    <criadoEm>${t.createdAt}</criadoEm>\n`;
      if (t.completedAt) {
        xml += `    <concluidoEm>${t.completedAt}</concluidoEm>\n`;
      }
      xml += `  </tarefa>\n`;
    });

    xml += `</tarefas>`;

    const blob = new Blob([xml], { type: 'text/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tarefas_${project.name.toLowerCase().replace(/\s+/g, '_')}_export.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportXmlFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const xmlText = event.target?.result as string;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        // Check parsing errors
        const parserError = xmlDoc.getElementsByTagName('parsererror');
        if (parserError.length > 0) {
          setImportStatusMsg({ text: 'Erro ao interpretar sintaxe do arquivo XML.', type: 'error' });
          return;
        }

        // Support both <tarefa> and <task> tags
        let taskNodes = Array.from(xmlDoc.getElementsByTagName('tarefa'));
        if (taskNodes.length === 0) {
          taskNodes = Array.from(xmlDoc.getElementsByTagName('task'));
        }

        if (taskNodes.length === 0) {
          setImportStatusMsg({ text: 'Nenhuma tag <tarefa> ou <task> encontrada no XML.', type: 'error' });
          return;
        }

        const currentTasks = [...tasks];
        let createdCount = 0;
        let updatedCount = 0;

        taskNodes.forEach((node, idx) => {
          const getVal = (tagName: string, altTagName?: string) => {
            const el = node.getElementsByTagName(tagName)[0] || (altTagName ? node.getElementsByTagName(altTagName)[0] : null);
            return el?.textContent?.trim() || '';
          };

          const importedId = getVal('id');
          const title = getVal('titulo', 'title');
          if (!title) return; // ignore untitled items

          const rawCat = getVal('categoria', 'category').toLowerCase();
          let category: 'feature' | 'bug' | 'docs' | 'refactor' = 'feature';
          if (['bug', 'correcao', 'erro'].includes(rawCat)) category = 'bug';
          else if (['docs', 'documentacao', 'texto'].includes(rawCat)) category = 'docs';
          else if (['refactor', 'refatoracao', 'melhoria'].includes(rawCat)) category = 'refactor';

          const rawPrio = getVal('prioridade', 'priority').toLowerCase();
          let priority: 'high' | 'medium' | 'low' = 'medium';
          if (['alta', 'high', 'urgente', '3'].includes(rawPrio)) priority = 'high';
          else if (['baixa', 'low', '1'].includes(rawPrio)) priority = 'low';
          else if (['media', 'média', 'medium', '2'].includes(rawPrio)) priority = 'medium';

          const versionTag = getVal('versao', 'version') || project.currentVersion || 'v1.0.0';

          const rawStatus = getVal('status', 'completed').toLowerCase();
          const isCompleted = ['concluido', 'concluído', 'done', 'completed', 'true', '1'].includes(rawStatus);

          const rawCompletedAt = getVal('concluidoEm', 'completedAt');
          const rawCreatedAt = getVal('criadoEm', 'createdAt');

          // Check if existing task matches by ID or exact Title (case-insensitive)
          const existingIndex = currentTasks.findIndex((t) => {
            if (importedId && t.id === importedId) return true;
            return t.title.trim().toLowerCase() === title.trim().toLowerCase();
          });

          if (existingIndex >= 0) {
            // Upsert: Update existing task
            const existing = currentTasks[existingIndex];
            const nextCompletedAt = isCompleted
              ? (rawCompletedAt || existing.completedAt || new Date().toISOString())
              : undefined;

            currentTasks[existingIndex] = {
              ...existing,
              title,
              category,
              priority,
              versionTag,
              completed: isCompleted,
              completedAt: nextCompletedAt,
            };
            updatedCount++;
          } else {
            // Upsert: Insert new task
            const newTask: ProjectTask = {
              id: importedId || `task-xml-${Date.now()}-${idx}`,
              title,
              category,
              priority,
              versionTag,
              completed: isCompleted,
              createdAt: rawCreatedAt || new Date().toISOString(),
              completedAt: isCompleted ? (rawCompletedAt || new Date().toISOString()) : undefined,
            };
            currentTasks.push(newTask);
            createdCount++;
          }
        });

        if (createdCount === 0 && updatedCount === 0) {
          setImportStatusMsg({ text: 'Nenhuma tarefa processada do arquivo XML.', type: 'error' });
          return;
        }

        onUpdateProjectTasks(project.id, currentTasks);
        setImportStatusMsg({
          text: `🎉 Sucesso! ${createdCount} nova(s) tarefa(s) criada(s) e ${updatedCount} tarefa(s) existente(s) atualizada(s).`,
          type: 'success',
        });
      } catch (err: any) {
        setImportStatusMsg({ text: 'Falha ao processar o arquivo XML: ' + err.message, type: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- Task Handlers ---
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: ProjectTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      priority: newTaskPriority,
      versionTag: newTaskVersion.trim() || project.currentVersion,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    onUpdateProjectTasks(project.id, [...tasks, newTask]);
    setNewTaskTitle('');
  };

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    onUpdateProjectTasks(project.id, updated);
  };

  const handleChangeTaskPriority = (taskId: string, newPriority: 'high' | 'medium' | 'low') => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, priority: newPriority };
      }
      return t;
    });
    onUpdateProjectTasks(project.id, updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    onUpdateProjectTasks(project.id, updated);
  };

  // --- Changelog Handlers ---
  const handleSaveChangelog = (versionId: string) => {
    onUpdateProjectVersionChangelog(project.id, versionId, changelogText);
    setEditingVersionId(null);
  };

  // --- Docs Handlers ---
  const handleSaveDocs = () => {
    onUpdateProjectDocs(project.id, docContent);
    setIsEditingDocs(false);
  };

  // Task filtering and stats
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  const getPriorityWeight = (p?: 'high' | 'medium' | 'low') => {
    if (p === 'high') return 3;
    if (p === 'medium') return 2;
    if (p === 'low') return 1;
    return 2;
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'pending' && t.completed) return false;
    if (taskFilter === 'completed' && !t.completed) return false;
    if (taskPriorityFilter !== 'all' && (t.priority || 'medium') !== taskPriorityFilter) return false;
    if (taskCategoryFilter !== 'all' && (t.category || 'feature') !== taskCategoryFilter) return false;
    return true;
  });

  // Sorting: Pending tasks first, then completed tasks. Within each group, highest priority first.
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const weightA = getPriorityWeight(a.priority);
    const weightB = getPriorityWeight(b.priority);
    if (weightA !== weightB) {
      return weightB - weightA;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col animate-fadeIn">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-indigo-600" />
              Gerenciar Projeto: {project.name}
            </h2>
            <p className="text-xs text-slate-500">
              Gerencie o roadmap de tarefas, o histórico do que foi feito em cada versão e a documentação.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-6 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-1 -mb-px">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-3 font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'tasks'
                  ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Tarefas & Checklist ({completedTasksCount}/{tasks.length})
            </button>

            <button
              onClick={() => setActiveTab('changelog')}
              className={`px-4 py-3 font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'changelog'
                  ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              Histórico / O que foi feito ({accountVersions.length})
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`px-4 py-3 font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'docs'
                  ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Documentação do Projeto
            </button>
          </div>

          <span className="hidden sm:inline-flex text-[11px] font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
            Versão Ativa: <span className="font-bold text-indigo-600 ml-1">{project.currentVersion}</span>
          </span>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* TAB 1: TAREFAS & CHECKLIST */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              
              {/* Progress Summary Card */}
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <h3 className="font-bold text-indigo-950 text-sm flex items-center gap-2">
                    Progresso das Tarefas do Projeto
                  </h3>
                  <p className="text-slate-600 text-xs">
                    {completedTasksCount} de {tasks.length} tarefas concluídas ({progressPercent}%)
                  </p>
                </div>

                <div className="w-full sm:w-48 bg-indigo-200/60 rounded-full h-3 overflow-hidden border border-indigo-200">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  Adicionar Nova Tarefa ao Roadmap
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Implementar tela de checkout com PIX, Refatorar API..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="sm:col-span-4 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  />

                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="sm:col-span-3 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-semibold text-slate-700"
                  >
                    <option value="feature">✨ Funcionalidade (Feature)</option>
                    <option value="bug">🐛 Correção de Bug</option>
                    <option value="refactor">♻️ Refatoração</option>
                    <option value="docs">📝 Documentação</option>
                  </select>

                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="sm:col-span-3 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-800"
                  >
                    <option value="high">🔴 Alta Prioridade</option>
                    <option value="medium">🟡 Média Prioridade</option>
                    <option value="low">🔵 Baixa Prioridade</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Versão"
                    value={newTaskVersion}
                    onChange={(e) => setNewTaskVersion(e.target.value)}
                    className="sm:col-span-1 px-2 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 text-center"
                  />

                  <button
                    type="submit"
                    className="sm:col-span-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer flex items-center justify-center shadow-2xs"
                    title="Adicionar tarefa"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Filter Bar & XML Actions */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {/* Status Filter Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setTaskFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        taskFilter === 'all' ? 'bg-slate-800 text-white shadow-2xs' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      Todas ({tasks.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskFilter('pending')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        taskFilter === 'pending' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      Pendentes ({tasks.filter((t) => !t.completed).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskFilter('completed')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        taskFilter === 'completed' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      Concluídas ({completedTasksCount})
                    </button>
                  </div>

                  {/* Priority and Category Dropdown Filters */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Priority Filter */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold text-slate-500">Prioridade:</span>
                      <select
                        value={taskPriorityFilter}
                        onChange={(e) => setTaskPriorityFilter(e.target.value as any)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="all">Todas</option>
                        <option value="high">🔴 Alta</option>
                        <option value="medium">🟡 Média</option>
                        <option value="low">🔵 Baixa</option>
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold text-slate-500">Tipo:</span>
                      <select
                        value={taskCategoryFilter}
                        onChange={(e) => setTaskCategoryFilter(e.target.value as any)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="all">Todos</option>
                        <option value="feature">✨ Feature</option>
                        <option value="bug">🐛 Bug</option>
                        <option value="docs">📝 Docs</option>
                        <option value="refactor">♻️ Refactor</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* XML Import/Export Controls Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 flex-wrap gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Exibindo <strong className="text-slate-900 font-bold">{sortedTasks.length}</strong> de <strong className="text-slate-900 font-bold">{tasks.length}</strong> tarefas
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportXmlTasks}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors border border-emerald-200/80"
                      title="Exportar tarefas filtradas para arquivo XML"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Exportar XML ({filteredTasks.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowXmlTemplateModal(true)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors border border-indigo-200/60"
                      title="Ver estrutura e baixar o modelo XML de tarefas"
                    >
                      <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Modelo XML</span>
                    </button>

                    <label className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Importar XML</span>
                      <input
                        type="file"
                        accept=".xml"
                        onChange={handleImportXmlFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Status Message for XML Import */}
              {importStatusMsg && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs animate-fadeIn ${
                    importStatusMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                      : 'bg-rose-50 border-rose-200 text-rose-900 font-bold'
                  }`}
                >
                  <span>{importStatusMsg.text}</span>
                  <button
                    onClick={() => setImportStatusMsg(null)}
                    className="text-slate-400 hover:text-slate-700 font-bold ml-2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Tasks Checklist List (Sorted: Pending first by priority, then completed) */}
              <div className="space-y-2 pt-1">
                {sortedTasks.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
                    <p className="font-medium">Nenhuma tarefa encontrada com os filtros selecionados.</p>
                  </div>
                ) : (
                  sortedTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        task.completed
                          ? 'bg-slate-50/80 border-slate-200/80 opacity-75'
                          : task.priority === 'high'
                          ? 'bg-white border-rose-200/80 shadow-2xs border-l-4 border-l-rose-500'
                          : task.priority === 'low'
                          ? 'bg-white border-slate-200 hover:border-slate-300'
                          : 'bg-white border-slate-200 hover:border-slate-300 border-l-4 border-l-amber-400'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id)}
                          className="cursor-pointer shrink-0"
                          title={task.completed ? "Marcar como pendente" : "Marcar como concluída"}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-600" />
                          )}
                        </button>

                        <div className="space-y-1 min-w-0 flex-1">
                          <p className={`font-semibold text-xs text-slate-900 ${task.completed ? 'line-through text-slate-500' : ''}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] flex-wrap">
                            <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold border border-indigo-100">
                              {task.versionTag || 'v1.0.0'}
                            </span>
                            
                            <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                              task.category === 'feature' ? 'bg-purple-100 text-purple-800' :
                              task.category === 'bug' ? 'bg-rose-100 text-rose-800' :
                              task.category === 'refactor' ? 'bg-amber-100 text-amber-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {task.category || 'feature'}
                            </span>

                            {/* Priority Selector Badge */}
                            <select
                              value={task.priority || 'medium'}
                              onChange={(e) => handleChangeTaskPriority(task.id, e.target.value as any)}
                              className={`px-1.5 py-0.5 rounded font-bold text-[10px] cursor-pointer border transition-colors ${
                                task.priority === 'high'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : task.priority === 'low'
                                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}
                              title="Alterar prioridade"
                            >
                              <option value="high">🔴 Alta Prioridade</option>
                              <option value="medium">🟡 Média Prioridade</option>
                              <option value="low">🔵 Baixa Prioridade</option>
                            </select>

                            {/* Completion Date & Time Badge */}
                            {task.completed && (
                              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold flex items-center gap-1 border border-emerald-200/80 shadow-2xs">
                                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                Concluído em: {task.completedAt ? new Date(task.completedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Horário não registrado'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Excluir tarefa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 2: HISTÓRICO / CHANGELOG DE CADA VERSÃO */}
          {activeTab === 'changelog' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-slate-600 text-xs">
                  Abaixo você pode visualizar e registrar <span className="font-bold text-slate-900">o que foi desenvolvido em cada conta e versão</span> do projeto.
                </p>
              </div>

              <div className="space-y-3">
                {accountVersions.map((ver) => {
                  const verAcc = accounts.find((a) => a.id === ver.accountId);
                  const isActive =
                    ver.accountId === project.currentAccountId &&
                    ver.branch === project.currentBranch &&
                    ver.version === project.currentVersion;

                  const isEditing = editingVersionId === ver.id;

                  return (
                    <div
                      key={ver.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        isActive
                          ? 'bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-200/80 shadow-2xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {/* Version Header */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1">
                            <Tag className="w-4 h-4 text-indigo-600" />
                            {ver.version}
                          </span>
                          <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                            {ver.branch}
                          </span>
                          <span className="text-slate-500 text-xs flex items-center gap-1 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {verAcc?.email} (@{verAcc?.githubUsername})
                          </span>
                        </div>

                        {isActive ? (
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            VERSÃO ATIVA NO MOMENTO
                          </span>
                        ) : (
                          <button
                            onClick={() => onSwitchActiveVersion(project.id, ver.accountId, ver.branch, ver.version)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
                          >
                            Ativar Esta Versão
                          </button>
                        )}
                      </div>

                      {/* Changelog display or editor */}
                      {isEditing ? (
                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          <label className="block font-bold text-slate-800 text-xs">
                            Editar Notas do que foi feito nesta versão:
                          </label>
                          <textarea
                            rows={3}
                            value={changelogText}
                            onChange={(e) => setChangelogText(e.target.value)}
                            placeholder="Descreva as alterações, funcionalidades implementadas, APIs integradas..."
                            className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-xs"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingVersionId(null)}
                              className="px-3 py-1 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSaveChangelog(ver.id)}
                              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                            >
                              Salvar Notas
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-slate-200/80 flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              O que foi feito nesta versão:
                            </span>
                            <p className="text-slate-700 font-medium whitespace-pre-wrap">
                              {ver.changelog || ver.notes || 'Nenhuma nota informada para esta versão ainda.'}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              setEditingVersionId(ver.id);
                              setChangelogText(ver.changelog || ver.notes || '');
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Editar resumo desta versão"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTAÇÃO DO PROJETO */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Documentação & Requisitos do Software
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    Guarde especificações técnicas, regras de negócio, prompts da IA e instruções.
                  </p>
                </div>

                {!isEditingDocs ? (
                  <button
                    onClick={() => setIsEditingDocs(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Editar Documentação
                  </button>
                ) : (
                  <button
                    onClick={handleSaveDocs}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Salvar Documentação
                  </button>
                )}
              </div>

              {isEditingDocs ? (
                <div className="space-y-3">
                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="text-slate-500 font-semibold">Inserir Modelo:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDocContent(
                          (prev) =>
                            prev +
                            `\n\n## 🛠️ Arquitetura & Tecnologias\n- Frontend: React + TypeScript + Tailwind CSS\n- Backend: Node.js / Express\n- Banco de Dados: Firestore / PostgreSQL\n`
                        )
                      }
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
                    >
                      + Arquitetura
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDocContent(
                          (prev) =>
                            prev +
                            `\n\n## 🚀 Instruções de Instalação e Deploy\n1. Clone o repositório\n2. Configure as variáveis de ambiente\n3. Execute npm install && npm run dev\n`
                        )
                      }
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
                    >
                      + Guia Deploy
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDocContent(
                          (prev) =>
                            prev +
                            `\n\n## 🤖 Contexto e Prompts para IA\nQuando gerar código para este projeto, siga o padrão de componentes modulares em /src/components.\n`
                        )
                      }
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
                    >
                      + Prompts de IA
                    </button>
                  </div>

                  <textarea
                    rows={14}
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    placeholder="Escreva a documentação do projeto aqui..."
                    className="w-full p-4 bg-slate-900 text-slate-100 border border-slate-800 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>
              ) : (
                <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 min-h-[220px]">
                  {docContent ? (
                    <div className="whitespace-pre-wrap font-sans text-slate-800 text-xs leading-relaxed">
                      {docContent}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <BookOpen className="w-10 h-10 mx-auto opacity-30 text-slate-600" />
                      <p className="font-semibold text-slate-600">
                        Nenhuma documentação cadastrada para este projeto ainda.
                      </p>
                      <button
                        onClick={() => setIsEditingDocs(true)}
                        className="text-indigo-600 hover:underline font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        Clique aqui para adicionar especificações e guias <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* XML Template & Instruction Modal */}
      {showXmlTemplateModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Modelo de Arquivo XML para Importar Tarefas
                </h3>
              </div>
              <button
                onClick={() => setShowXmlTemplateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1 text-slate-700">
                <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  Instruções de Estrutura XML:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 pl-1">
                  <li>Tag pai: <code className="font-mono text-indigo-700 font-bold">&lt;tarefas&gt;</code> ou <code className="font-mono text-indigo-700 font-bold">&lt;tasks&gt;</code></li>
                  <li>Tag de item: <code className="font-mono text-indigo-700 font-bold">&lt;tarefa&gt;</code> ou <code className="font-mono text-indigo-700 font-bold">&lt;task&gt;</code></li>
                  <li>Categorias suportadas: <code className="font-mono bg-white px-1 rounded">feature</code>, <code className="font-mono bg-white px-1 rounded">bug</code>, <code className="font-mono bg-white px-1 rounded">refactor</code>, <code className="font-mono bg-white px-1 rounded">docs</code></li>
                  <li>Status suportados: <code className="font-mono text-emerald-700 font-bold">concluido</code> (ou <code className="font-mono">completed</code>) e <code className="font-mono text-amber-700 font-bold">pendente</code></li>
                </ul>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Exemplo de Código XML
                  </label>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SAMPLE_XML_TEMPLATE);
                      alert('Modelo XML copiado para a área de transferência!');
                    }}
                    className="text-indigo-600 hover:underline font-bold text-[11px] cursor-pointer"
                  >
                    Copiar XML
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                  {SAMPLE_XML_TEMPLATE}
                </pre>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={handleDownloadXmlTemplate}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 text-xs shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Arquivo .XML de Exemplo</span>
              </button>

              <button
                onClick={() => setShowXmlTemplateModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl cursor-pointer text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
