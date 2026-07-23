export type TokenStatus = 'available' | 'low' | 'exhausted';

export type AIProvider = string;

export const DEFAULT_AI_PROVIDERS = [
  'Google AI Studio / Gemini',
  'Cursor / Claude',
  'GitHub Copilot',
  'ChatGPT / OpenAI',
  'Claude / Anthropic',
  'DeepSeek AI',
  'Ollama (Local)',
  'Groq',
  'OpenRouter',
  'Perplexity AI',
  'Mistral AI',
  'vLLM / Endpoint Personalizado',
] as const;

export interface Account {
  id: string;
  email: string;
  githubUsername: string;
  aiProvider: AIProvider;
  tokenStatus: TokenStatus;
  tokenPercentage: number; // 0 to 100
  usedTokens?: number;
  maxTokens?: number;
  resetDate?: string; // ISO date string or human relative string
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category?: 'feature' | 'bug' | 'docs' | 'refactor';
  priority?: 'high' | 'medium' | 'low';
  versionTag?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ProjectAccountVersion {
  id: string;
  accountId: string;
  branch: string;
  version: string;
  assignedAt: string; // ISO date string
  status: 'active' | 'archived' | 'exhausted';
  notes?: string;
  changelog?: string;
}

export interface Project {
  id: string;
  name: string;
  repoUrl?: string;
  description?: string;
  currentAccountId: string;
  currentBranch: string;
  currentVersion: string;
  status: 'active' | 'paused' | 'completed';
  lastMigratedAt?: string;
  createdAt: string;
  updatedAt: string;
  accountVersions?: ProjectAccountVersion[];
  documentation?: string;
  tasks?: ProjectTask[];
}

export interface MigrationLog {
  id: string;
  projectId: string;
  projectName: string;
  fromAccountId: string;
  fromAccountEmail: string;
  fromGithubUsername: string;
  toAccountId: string;
  toAccountEmail: string;
  toGithubUsername: string;
  fromBranch: string;
  toBranch: string;
  fromVersion: string;
  toVersion: string;
  reason: string;
  timestamp: string;
  markPreviousExhausted?: boolean;
}

export interface GoogleUser {
  id?: string;
  name: string;
  email: string;
  picture?: string;
  accessToken?: string;
  lastBackupAt?: string;
}

export type ViewTab = 'dashboard' | 'accounts' | 'projects' | 'migrations' | 'assistant';
