import React, { useState } from 'react';
import { MigrationLog } from '../types';
import { formatDatePortuguese } from '../utils/storage';
import { ArrowRight, History, Search, Mail, GitBranch, FolderGit2, Info, Trash2 } from 'lucide-react';

interface MigrationLogsProps {
  logs: MigrationLog[];
  onDeleteLog?: (logId: string) => void;
}

export const MigrationLogs: React.FC<MigrationLogsProps> = ({ logs, onDeleteLog }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.projectName.toLowerCase().includes(term) ||
      log.fromAccountEmail.toLowerCase().includes(term) ||
      log.toAccountEmail.toLowerCase().includes(term) ||
      log.fromBranch.toLowerCase().includes(term) ||
      log.toBranch.toLowerCase().includes(term) ||
      log.reason.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header & Filter */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            Histórico de Migrações de Projetos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de todas as trocas de conta GitHub, branches e atualização de versões quando os tokens acabaram
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por projeto, conta ou branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Logs Table / List */}
      {filteredLogs.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-5 hover:bg-slate-50/50 transition-colors group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Project & Timestamp */}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <FolderGit2 className="w-4 h-4 text-indigo-600" />
                      {log.projectName}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {formatDatePortuguese(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 max-w-xl">
                    <span className="font-semibold text-slate-700">Motivo:</span> {log.reason}
                  </p>
                </div>

                {/* Migration Path Box & Delete */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                    
                    {/* Origin */}
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                        De (Anterior)
                      </div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1 truncate max-w-[150px]">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate" title={log.fromAccountEmail}>
                          {log.fromAccountEmail}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-500 flex items-center gap-1">
                        <GitBranch className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{log.fromBranch} ({log.fromVersion})</span>
                      </div>
                    </div>

                    {/* Arrow Indicator */}
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </div>

                    {/* Destination */}
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        Para (Atual)
                      </div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1 truncate max-w-[150px]">
                        <Mail className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate" title={log.toAccountEmail}>
                          {log.toAccountEmail}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-700 font-medium flex items-center gap-1">
                        <GitBranch className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span>{log.toBranch} ({log.toVersion})</span>
                      </div>
                    </div>

                  </div>

                  {onDeleteLog && (
                    <button
                      onClick={() => onDeleteLog(log.id)}
                      title="Excluir este registro de histórico"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center">
          <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">
            Nenhuma migração encontrada com os filtros atuais.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Quando você migrar um projeto para outra conta GitHub, o registro aparecerá aqui.
          </p>
        </div>
      )}
    </div>
  );
};
