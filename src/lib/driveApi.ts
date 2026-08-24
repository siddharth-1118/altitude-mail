// ---------------------------------------------------------------------------
// Altitude Drive — Client-side API for Google Drive operations
// All calls go through the mail server which proxies Google Drive API.
// ---------------------------------------------------------------------------

import { supabase } from './supabase';
import { driveApiUrl } from './driveApiBase';

async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(driveApiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // non-JSON error body
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  createdTime?: string;
  iconLink?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  parents?: string[];
}

export interface DriveFolder {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
}

export interface DriveFileList {
  files: DriveFile[];
  nextPageToken: string | null;
  currentFolderId: string;
  rootFolderId: string;
}

export interface DriveStorage {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** Check if Google Drive is connected for the current user */
export async function getDriveStatus(): Promise<{ connected: boolean; hasRefreshToken: boolean }> {
  return request('/api/drive/status');
}

/** Get the Google OAuth2 authorization URL */
export async function getDriveAuthUrl(): Promise<{ url: string }> {
  return request('/api/drive/auth-url');
}

/** Disconnect Google Drive for the current user */
export async function disconnectDrive(): Promise<{ ok: boolean }> {
  return request('/api/drive/disconnect', { method: 'POST' });
}

/** List files in a folder (or root of altitude Drive) */
export async function listDriveFiles(
  folderId?: string,
  pageToken?: string
): Promise<DriveFileList> {
  const params = new URLSearchParams();
  if (folderId) params.set('folderId', folderId);
  if (pageToken) params.set('pageToken', pageToken);
  const qs = params.toString();
  return request(`/api/drive/files${qs ? `?${qs}` : ''}`);
}

/** Upload a file to Google Drive */
export async function uploadDriveFile(params: {
  fileName: string;
  mimeType?: string;
  fileContent?: string; // base64
  folderId?: string;
}): Promise<{ file: DriveFile }> {
  return request('/api/drive/upload', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/** Create a new folder */
export async function createDriveFolder(
  folderName: string,
  parentFolderId?: string
): Promise<{ folder: DriveFolder }> {
  return request('/api/drive/folders', {
    method: 'POST',
    body: JSON.stringify({ folderName, parentFolderId }),
  });
}

/** Get a download URL for a file */
export function getDriveDownloadUrl(fileId: string): string {
  return driveApiUrl(`/api/drive/download/${fileId}`);
}

/** Delete a file from Google Drive */
export async function deleteDriveFile(fileId: string): Promise<{ ok: boolean }> {
  return request(`/api/drive/files/${fileId}`, { method: 'DELETE' });
}

/** Rename a file */
export async function renameDriveFile(
  fileId: string,
  name: string
): Promise<{ file: DriveFile }> {
  return request(`/api/drive/files/${fileId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

/** Get storage quota */
export async function getDriveStorage(): Promise<{ storage: DriveStorage }> {
  return request('/api/drive/storage');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Determine file category from mime type */
export function getFileCategory(mimeType: string): 'folder' | 'image' | 'video' | 'audio' | 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'code' | 'archive' | 'other' {
  if (mimeType === 'application/vnd.google-apps.folder') return 'folder';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('text')) return 'document';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('7z')) return 'archive';
  if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('html') || mimeType.includes('css') || mimeType.includes('typescript')) return 'code';
  return 'other';
}

/** Format bytes to human-readable */
export function formatBytes(bytes: number | string | undefined): string {
  if (!bytes || bytes === '0') return '0 B';
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num)) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let size = num;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Format date to relative time */
export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}
