import React from 'react';
import { Account, Project } from '../types';
import { formatRelativeResetTime } from '../utils/storage';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  Copy, 
  Terminal, 
  Check, 
  Zap, 
  Clock, 
  Download, 
  GitBranch, 
  RotateCw 
} from 'lucide-react';

interface QuickTokenAssistantProps {
  accounts: Account[];
  projects: Project[];
  onOpenMigrationWizard: () => void;
}

export const QuickTokenAssistant: React.FC<QuickTokenAssistantProps> = ({
  accounts,
  projects,
  onOpenMigrationWizard,
}) => {
  const [copiedCmd, setCopiedCmd] = React.useState<number | null>(null);

  // Find best account (highest available token percentage)
  const sortedAvailable = [...accounts]
    .filter((a) => a.tokenStatus !== 'exhausted')
    .sort((a, b) => b.tokenPercentage - a.tokenPercentage);

  const bestAccount = sortedAvailable[0];

  // Find exhausted accounts with countdowns
  const exhausted = accounts.filter((a) => a.tokenStatus === 'exhausted');

  const handleCopyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(index);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const gitSteps = [
    {
      title: '1. Fazer checkout ou ZIP na conta atual',
      code: 'git checkout -b feature/v2-migracao\ngit add . && git commit -m "salvando progresso antes da migração"',
      desc: 'Certifique-se de salvar todas as alterações pendentes do seu código.',
    },
    {
      title: '2. Alterar a URL do repositório remoto (ou Criar Novo Repositório)',
      code: bestAccount
        ? `git remote set-url origin https://github.com/${bestAccount.githubUsername}/novo-repositorio.git`
        : 'git remote set-url origin https://github.com/SEU_NOVO_USUARIO/novo-repositorio.git',
      desc: 'Redirecione a origem Git para o repositório da sua nova conta com tokens.',
    },
    {
      title: '3. Enviar alterações para o novo repositório GitHub',
      code: 'git push -u origin feature/v2-migracao',
      desc: 'Envie a branch com a nova versão do software e altere a conta no seu ambiente IA.',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner Recommendation */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Recomendação Inteligente de Rotação
            </div>

            <h2 className="text-xl font-bold tracking-tight">
              {bestAccount ? (
                <>
                  Melhor Conta Ativa Agora:{' '}
                  <span className="text-emerald-300 underline underline-offset-4 decoration-emerald-400">
                    {bestAccount.email}
                  </span>
                </>
              ) : (
                'Todas as contas cadastradas estão com tokens zerados!'
              )}
            </h2>

            <p className="text-xs text-indigo-100 leading-relaxed">
              {bestAccount ? (
                <>
                  Esta conta está com <strong className="text-emerald-300">{bestAccount.tokenPercentage}% de saldo de tokens</strong> na plataforma <strong>{bestAccount.aiProvider}</strong> (GitHub: <span className="font-mono">@{bestAccount.githubUsername}</span>). É a escolha recomendada para continuar o desenvolvimento.
                </>
              ) : (
                'Aguarde a renovação dos ciclos de cota ou cadastre uma nova conta de e-mail/GitHub reserva.'
              )}
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={onOpenMigrationWizard}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              Iniciar Migração de Projeto
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Account Readiness & Reset Timers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Readiness ranking */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Ranking de Disponibilidade das Contas
          </h3>

          <div className="space-y-2">
            {accounts.map((acc, i) => (
              <div
                key={acc.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-slate-400 w-4 text-center">#{i + 1}</span>
                  <div>
                    <div className="font-semibold text-slate-800 truncate">{acc.email}</div>
                    <div className="text-[11px] text-slate-500 font-mono">@{acc.githubUsername}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-slate-900">{acc.tokenPercentage}% Tokens</div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    acc.tokenStatus === 'available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : acc.tokenStatus === 'low'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {acc.tokenStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending reset timers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Contas Bloqueadas Aguardando Renovação
          </h3>

          {exhausted.length > 0 ? (
            <div className="space-y-3">
              {exhausted.map((acc) => (
                <div
                  key={acc.id}
                  className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-rose-900">
                    <span>{acc.email}</span>
                    <span className="bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded text-[10px]">
                      {formatRelativeResetTime(acc.resetDate)}
                    </span>
                  </div>
                  <div className="text-rose-700 text-[11px]">
                    Provedor: {acc.aiProvider} | GitHub: <span className="font-mono">@{acc.githubUsername}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
              Nenhuma conta bloqueada ou zerada no momento. Todas estão operacionais!
            </div>
          )}
        </div>

      </div>

      {/* Terminal / Workflow Helper Commands */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-lg border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm">Guia Rápido de Comandos Git para Migração</h3>
          </div>
          <span className="text-xs text-slate-400">Copie e execute no seu terminal</span>
        </div>

        <div className="space-y-4 text-xs">
          {gitSteps.map((step, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="font-semibold text-indigo-300">{step.title}</div>
              <div className="relative group">
                <pre className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 overflow-x-auto border border-slate-800">
                  {step.code}
                </pre>
                <button
                  onClick={() => handleCopyCommand(step.code, idx)}
                  className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Copiar comando"
                >
                  {copiedCmd === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
