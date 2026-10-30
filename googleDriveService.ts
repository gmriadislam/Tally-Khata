import { MultiBusinessState } from '../types';
import { getStoredAccessToken, loginWithGoogle } from './firebaseAuth';

export interface DriveBackupFile {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
}

const LAST_SYNC_KEY = 'tally_last_drive_sync_time';

export function getLastDriveSyncTime(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY);
}

export function setLastDriveSyncTime(dateStr: string): void {
  localStorage.setItem(LAST_SYNC_KEY, dateStr);
}

async function getValidAccessToken(): Promise<string> {
  const token = getStoredAccessToken();
  if (token) return token;

  // Prompt sign in if not in memory
  const res = await loginWithGoogle();
  return res.accessToken;
}

/**
 * List existing TallyKhata backup files from Google Drive
 */
export async function listGoogleDriveBackups(): Promise<DriveBackupFile[]> {
  const token = await getValidAccessToken();

  const query = encodeURIComponent("name contains 'TallyKhata_Backup' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,createdTime,modifiedTime,size)&orderBy=modifiedTime desc&pageSize=20`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to list Drive files:', errorText);
    throw new Error('গুগল ড্রাইভ থেকে ব্যাকআপ তালিকা লোড করা যায়নি।');
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Backup full app state to Google Drive as a JSON file
 */
export async function backupStateToGoogleDrive(
  state: MultiBusinessState,
  customNote?: string
): Promise<{ fileId: string; fileName: string; modifiedTime: string }> {
  const token = await getValidAccessToken();

  const now = new Date();
  const dateFormatted = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const activeStoreName = state.businesses.find((b) => b.business.id === state.activeBusinessId)?.business.name || 'Store';
  const cleanStoreName = activeStoreName.replace(/[\/\\?%*:|"<>]/g, '_').slice(0, 20);
  const fileName = `TallyKhata_Backup_${cleanStoreName}_${dateFormatted}.json`;

  const backupPayload = {
    app: 'TallyKhata Digital',
    version: state.version,
    exportedAt: now.toISOString(),
    note: customNote || 'স্বয়ংক্রিয় গুগল ড্রাইভ ব্যাকআপ',
    businessesCount: state.businesses.length,
    activeBusinessId: state.activeBusinessId,
    state,
  };

  const fileContent = JSON.stringify(backupPayload, null, 2);
  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: `ট্যালি খাতা ব্যাকআপ - ${activeStoreName} (${state.businesses.length}টি ব্যবসা)`,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime';

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to upload to Google Drive:', errorText);
    throw new Error('গুগল ড্রাইভে ব্যাকআপ আপলোড করতে সমস্যা হয়েছে।');
  }

  const result = await response.json();
  const syncTime = now.toISOString();
  setLastDriveSyncTime(syncTime);

  return {
    fileId: result.id,
    fileName: result.name || fileName,
    modifiedTime: result.modifiedTime || syncTime,
  };
}

/**
 * Download and parse a backup file from Google Drive
 */
export async function restoreStateFromGoogleDrive(
  fileId: string
): Promise<{ state: MultiBusinessState; exportedAt: string; note?: string }> {
  const token = await getValidAccessToken();

  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const response = await fetch(downloadUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to download file from Drive:', errorText);
    throw new Error('গুগল ড্রাইভ ফাইল ডাউনলোড করা যায়নি।');
  }

  const json = await response.json();

  // Validate format
  let restoredState: MultiBusinessState;
  if (json.state && json.state.businesses) {
    restoredState = json.state;
  } else if (json.businesses) {
    restoredState = json as MultiBusinessState;
  } else {
    throw new Error('ফাইলটির ভেতরে সঠিক ট্যালি খাতা ডেটা পাওয়া যায়নি।');
  }

  return {
    state: restoredState,
    exportedAt: json.exportedAt || new Date().toISOString(),
    note: json.note,
  };
}

/**
 * Delete a backup file from Google Drive
 */
export async function deleteGoogleDriveBackup(fileId: string): Promise<void> {
  const token = await getValidAccessToken();
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    throw new Error('ফাইলটি মুছে ফেলা সম্ভব হয়নি।');
  }
}
