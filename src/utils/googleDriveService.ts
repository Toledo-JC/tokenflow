import { GoogleUser, Account, Project, MigrationLog } from '../types';

const DRIVE_FILE_NAME = 'backup_tokens_ia.json';
const GOOGLE_USER_SESSION_KEY = 'ai_tokens_google_user_session';

export interface FullAppData {
  accounts: Account[];
  projects: Project[];
  migrations: MigrationLog[];
  exportedAt?: string;
  app?: string;
  version?: string;
}

// Session persistence
export function saveGoogleSession(user: GoogleUser) {
  try {
    localStorage.setItem(GOOGLE_USER_SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save Google user session', e);
  }
}

export function loadGoogleSession(): GoogleUser | null {
  try {
    const raw = localStorage.getItem(GOOGLE_USER_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load Google user session', e);
  }
  return null;
}

export function clearGoogleSession() {
  localStorage.removeItem(GOOGLE_USER_SESSION_KEY);
}

// Fetch Google User Info using Access Token
export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUser> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error('Não foi possível obter dados do usuário Google');
  }
  const data = await res.json();
  return {
    id: data.sub,
    name: data.name || data.email,
    email: data.email,
    picture: data.picture,
    accessToken,
  };
}

// Search for existing backup file on Google Drive
async function findDriveBackupFile(accessToken: string): Promise<string | null> {
  const query = encodeURIComponent(`name = '${DRIVE_FILE_NAME}' and trashed = false`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Error finding drive file:', errText);
    return null;
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

// Upload / Update backup on Google Drive
export async function saveBackupToGoogleDrive(
  accessToken: string,
  appData: FullAppData
): Promise<{ success: boolean; fileId?: string; error?: string; timestamp: string }> {
  try {
    const fileId = await findDriveBackupFile(accessToken);
    const timestamp = new Date().toISOString();
    const payload = {
      app: 'Gestor de Contas e Tokens IA',
      version: '1.0',
      exportedAt: timestamp,
      accounts: appData.accounts,
      projects: appData.projects,
      migrations: appData.migrations,
    };

    const jsonString = JSON.stringify(payload, null, 2);

    if (fileId) {
      // Update existing file on Google Drive
      const updateRes = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: jsonString,
        }
      );

      if (!updateRes.ok) {
        throw new Error('Falha ao atualizar arquivo no Google Drive');
      }

      return { success: true, fileId, timestamp };
    } else {
      // Create new file with metadata using multipart upload
      const metadata = {
        name: DRIVE_FILE_NAME,
        mimeType: 'application/json',
        description: 'Backup de Contas e Projetos do Gestor de Tokens IA',
      };

      const boundary = 'foo_bar_baz';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        jsonString +
        closeDelimiter;

      const createRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        }
      );

      if (!createRes.ok) {
        throw new Error('Falha ao criar arquivo no Google Drive');
      }

      const resData = await createRes.json();
      return { success: true, fileId: resData.id, timestamp };
    }
  } catch (err: any) {
    console.error('saveBackupToGoogleDrive error:', err);
    return {
      success: false,
      error: err.message || 'Erro ao conectar ao Google Drive',
      timestamp: new Date().toISOString(),
    };
  }
}

// Read backup file from Google Drive
export async function loadBackupFromGoogleDrive(
  accessToken: string
): Promise<{ success: boolean; data?: FullAppData; error?: string }> {
  try {
    const fileId = await findDriveBackupFile(accessToken);
    if (!fileId) {
      return {
        success: false,
        error: `Nenhum arquivo '${DRIVE_FILE_NAME}' encontrado no seu Google Drive.`,
      };
    }

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error('Falha ao fazer download do backup do Google Drive');
    }

    const appData = await res.json();
    if (!appData.accounts || !appData.projects) {
      throw new Error('Arquivo de backup inválido ou corrompido');
    }

    return {
      success: true,
      data: appData,
    };
  } catch (err: any) {
    console.error('loadBackupFromGoogleDrive error:', err);
    return {
      success: false,
      error: err.message || 'Erro ao carregar do Google Drive',
    };
  }
}
