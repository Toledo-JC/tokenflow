import React, { useState } from 'react';
import { GoogleUser, Account, Project, MigrationLog } from '../types';
import {
  saveBackupToGoogleDrive,
  loadBackupFromGoogleDrive,
  fetchGoogleUserInfo,
  clearGoogleSession,
  saveGoogleSession,
  FullAppData,
} from '../utils/googleDriveService';
import { exportDataAsJson } from '../utils/storage';
import {
  X,
  Cloud,
  CloudUpload,
  CloudDownload,
  Download,
  Upload,
  UserCheck,
  LogOut,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  FileJson,
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: GoogleUser | null;
  onGoogleLoginSuccess: (user: GoogleUser) => void;
  onGoogleLogout: () => void;
  accounts: Account[];
  projects: Project[];
  migrations: MigrationLog[];
  onRestoreData: (data: FullAppData) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  googleUser,
  onGoogleLoginSuccess,
  onGoogleLogout,
  accounts,
  projects,
  migrations,
  onRestoreData,
  showToast,
}) => {
  const [isSavingDrive, setIsSavingDrive] = useState(false);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(googleUser?.lastBackupAt || null);

  if (!isOpen) return null;

  // Google OAuth Login trigger using GIS client token flow
  const handleGoogleLogin = () => {
    setIsLoggingIn(true);
    try {
      /* global google */
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: '1000000000000-dummyid.apps.googleusercontent.com', // standard client token auth
          scope:
            'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.access_token) {
              try {
                const user = await fetchGoogleUserInfo(tokenResponse.access_token);
                saveGoogleSession(user);
                onGoogleLoginSuccess(user);
                showToast(`Conectado com sucesso como ${user.email}`, 'success');
              } catch (err: any) {
                showToast('Erro ao obter perfil do Google: ' + err.message, 'error');
              } finally {
                setIsLoggingIn(false);
              }
            } else {
              setIsLoggingIn(false);
            }
          },
          error_callback: (err: any) => {
            console.error('OAuth error:', err);
            setIsLoggingIn(false);
            showToast('Erro ao abrir popup do Google OAuth', 'error');
          },
        });

        tokenClient.requestAccessToken();
      } else {
        // Fallback or prompt for token if GIS script hasn't initialized
        const manualToken = prompt(
          'Insira o Token de Acesso do Google Drive (ou clique OK para simular login de teste):'
        );
        if (manualToken) {
          const mockUser: GoogleUser = {
            id: 'google-user-123',
            name: 'Usuário Google',
            email: 'usuario.google@gmail.com',
            accessToken: manualToken,
          };
          saveGoogleSession(mockUser);
          onGoogleLoginSuccess(mockUser);
          showToast('Login de teste com Google efetuado!', 'success');
        }
        setIsLoggingIn(false);
      }
    } catch (e) {
      console.error(e);
      setIsLoggingIn(false);
      showToast('Erro na inicialização da conta do Google', 'error');
    }
  };

  // Save data to Google Drive
  const handleSaveToDrive = async () => {
    if (!googleUser || !googleUser.accessToken) {
      showToast('Faça login com a Conta do Google primeiro!', 'error');
      return;
    }

    setIsSavingDrive(true);
    const result = await saveBackupToGoogleDrive(googleUser.accessToken, {
      accounts,
      projects,
      migrations,
    });

    setIsSavingDrive(false);

    if (result.success) {
      const formattedDate = new Date(result.timestamp).toLocaleString('pt-BR');
      setLastBackupTime(formattedDate);

      const updatedUser = { ...googleUser, lastBackupAt: formattedDate };
      saveGoogleSession(updatedUser);
      onGoogleLoginSuccess(updatedUser);

      showToast('🎉 Backup salvo com sucesso no seu Google Drive!', 'success');
    } else {
      showToast(`Erro ao salvar no Google Drive: ${result.error}`, 'error');
    }
  };

  // Load data from Google Drive
  const handleRestoreFromDrive = async () => {
    if (!googleUser || !googleUser.accessToken) {
      showToast('Faça login com a Conta do Google primeiro!', 'error');
      return;
    }

    if (
      !confirm(
        '⚠️ Atenção: Restaurar o backup do Google Drive irá substituir as contas, projetos e histórico atuais na sua tela. Deseja continuar?'
      )
    ) {
      return;
    }

    setIsLoadingDrive(true);
    const result = await loadBackupFromGoogleDrive(googleUser.accessToken);
    setIsLoadingDrive(false);

    if (result.success && result.data) {
      onRestoreData(result.data);
      showToast('✅ Dados restaurados do Google Drive com sucesso!', 'success');
    } else {
      showToast(`Erro ao carregar do Google Drive: ${result.error}`, 'error');
    }
  };

  // Local JSON File Upload restore
  const handleLocalJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.accounts) && Array.isArray(parsed.projects)) {
          if (
            confirm(
              `Deseja importar ${parsed.accounts.length} contas e ${parsed.projects.length} projetos do arquivo '${file.name}'?`
            )
          ) {
            onRestoreData({
              accounts: parsed.accounts,
              projects: parsed.projects,
              migrations: parsed.migrations || [],
            });
            showToast('✅ Dados importados do arquivo JSON local!', 'success');
          }
        } else {
          showToast('Arquivo JSON com formato inválido!', 'error');
        }
      } catch (err) {
        showToast('Erro ao ler arquivo JSON de backup', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fadeIn flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
              <Cloud className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Backup & Sincronização Google Drive
              </h2>
              <p className="text-xs text-slate-500">
                Salve suas contas, tokens e projetos com segurança no seu próprio Google Drive.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs overflow-y-auto">
          {/* Google Account Status Box */}
          <div className="p-4 rounded-2xl border bg-slate-50/80 border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              1. Autenticação do Google
            </h3>

            {googleUser ? (
              <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-emerald-200/80 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  {googleUser.picture ? (
                    <img
                      src={googleUser.picture}
                      alt={googleUser.name}
                      className="w-10 h-10 rounded-full border border-indigo-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                      {googleUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs truncate">
                      <span>{googleUser.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Conectado
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] truncate">{googleUser.email}</p>
                    {lastBackupTime && (
                      <p className="text-[10px] text-indigo-600 font-medium">
                        Último backup: {lastBackupTime}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    clearGoogleSession();
                    onGoogleLogout();
                    setLastBackupTime(null);
                    showToast('Desconectado da conta do Google.', 'info');
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Sair da Conta do Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-center space-y-3">
                <p className="text-slate-600 text-xs">
                  Conecte sua conta do Google para poder salvar o arquivo{' '}
                  <span className="font-mono font-bold text-slate-900">backup_tokens_ia.json</span> diretamente na sua nuvem.
                </p>

                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                      />
                    </svg>
                  )}
                  <span>Entrar com Conta do Google</span>
                </button>
              </div>
            )}
          </div>

          {/* Google Drive Actions */}
          <div className="p-4 rounded-2xl border bg-indigo-50/40 border-indigo-100 space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Cloud className="w-4 h-4 text-indigo-600" />
              2. Sincronização na Nuvem (Google Drive)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Save to Drive */}
              <button
                onClick={handleSaveToDrive}
                disabled={!googleUser || isSavingDrive}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                {isSavingDrive ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CloudUpload className="w-4 h-4" />
                )}
                <span>Salvar no Google Drive</span>
              </button>

              {/* Restore from Drive */}
              <button
                onClick={handleRestoreFromDrive}
                disabled={!googleUser || isLoadingDrive}
                className="p-3 bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 text-slate-800 border border-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoadingDrive ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                ) : (
                  <CloudDownload className="w-4 h-4 text-indigo-600" />
                )}
                <span>Restaurar do Google Drive</span>
              </button>
            </div>
          </div>

          {/* Local File Backup & Import Actions */}
          <div className="p-4 rounded-2xl border bg-slate-50/80 border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-600" />
              3. Backup e Importação de Arquivo Local (.JSON)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export JSON Download */}
              <button
                onClick={() => {
                  exportDataAsJson(accounts, projects, migrations);
                  showToast('Download do arquivo de backup JSON iniciado!', 'success');
                }}
                className="p-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Baixar Backup (.JSON)</span>
              </button>

              {/* Import Local JSON File */}
              <label className="p-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>Restaurar Arquivo Local</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleLocalJsonUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
