import { Account, Project, MigrationLog } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_PROJECTS, INITIAL_MIGRATION_LOGS } from '../data/initialData';

const STORAGE_KEYS = {
  ACCOUNTS: 'ai_tokens_accounts_v1',
  PROJECTS: 'ai_tokens_projects_v1',
  MIGRATIONS: 'ai_tokens_migrations_v1',
};

export function loadAccounts(): Account[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load accounts from storage', e);
  }
  saveAccounts(INITIAL_ACCOUNTS);
  return INITIAL_ACCOUNTS;
}

export function saveAccounts(accounts: Account[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts to storage', e);
  }
}

export function loadProjects(): Project[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load projects from storage', e);
  }
  saveProjects(INITIAL_PROJECTS);
  return INITIAL_PROJECTS;
}

export function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to storage', e);
  }
}

export function loadMigrationLogs(): MigrationLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MIGRATIONS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load migration logs from storage', e);
  }
  saveMigrationLogs(INITIAL_MIGRATION_LOGS);
  return INITIAL_MIGRATION_LOGS;
}

export function saveMigrationLogs(logs: MigrationLog[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MIGRATIONS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save migration logs to storage', e);
  }
}

export function resetToDefaults() {
  localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
  localStorage.removeItem(STORAGE_KEYS.PROJECTS);
  localStorage.removeItem(STORAGE_KEYS.MIGRATIONS);
  return {
    accounts: INITIAL_ACCOUNTS,
    projects: INITIAL_PROJECTS,
    migrations: INITIAL_MIGRATION_LOGS,
  };
}

export function exportDataAsJson(accounts: Account[], projects: Project[], migrations: MigrationLog[]) {
  const exportPayload = {
    app: 'Gestor de Contas e Tokens IA',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    accounts,
    projects,
    migrations,
  };
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportPayload, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `backup_tokens_ia_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function formatRelativeResetTime(isoDateStr?: string): string {
  if (!isoDateStr) return 'Não definida';
  const target = new Date(isoDateStr).getTime();
  const now = Date.now();
  const diffMs = target - now;

  if (diffMs <= 0) return 'Pronto / Pode renovar agora';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `Em ~${days}d ${remHours}h`;
  }

  if (hours > 0) {
    return `Em ~${hours}h ${minutes}min`;
  }

  return `Em ~${minutes} min`;
}

export function formatDatePortuguese(isoDateStr?: string): string {
  if (!isoDateStr) return '-';
  try {
    const d = new Date(isoDateStr);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDateStr;
  }
}
