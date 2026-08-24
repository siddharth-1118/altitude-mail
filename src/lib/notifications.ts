// ---------------------------------------------------------------------------
// altitude Notification System
// All workspace events (Meet, Drive, etc.) are delivered as emails to the
// user's altitude Mail inbox. This is the single notification hub.
// ---------------------------------------------------------------------------

import { supabase } from './supabase';
import { mailApiUrl } from './mailApiBase';

interface WorkspaceNotification {
  /** Short title shown as email subject */
  subject: string;
  /** Plain-text body of the notification email */
  body: string;
  /** Category for the email (primary, etc.) */
  category?: 'primary' | 'social' | 'promotions' | 'updates';
  /** Is this notification starred? */
  starred?: boolean;
  /** Custom sender name (default: "altitude Workspace") */
  senderName?: string;
  /** Custom sender email (default: "notifications@altitude.app") */
  senderEmail?: string;
}

async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * Send a notification email to the user's altitude Mail inbox.
 * This calls the mail server's POST /api/mail/emails endpoint.
 */
export async function sendWorkspaceNotification(
  notification: WorkspaceNotification
): Promise<boolean> {
  try {
    const token = await getAccessToken();
    if (!token) return false;

    const now = new Date();
    const senderName = notification.senderName || 'altitude Workspace';
    const senderEmail = notification.senderEmail || 'notifications@altitude.app';
    const initials = senderName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const email = {
      id: `ws-notify-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sender: {
        name: senderName,
        email: senderEmail,
        initials,
        isStarredSender: true,
      },
      recipient: 'self',
      subject: notification.subject,
      snippet: notification.body.slice(0, 120) + (notification.body.length > 120 ? '...' : ''),
      body: notification.body,
      timestamp: now.toISOString(),
      formattedDate: now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      isRead: false,
      isStarred: notification.starred || false,
      category: notification.category || 'primary',
      hasBlueIndicator: true,
      folder: 'inbox',
    };

    const res = await fetch(mailApiUrl('/api/mail/emails'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ emails: [email] }),
    });

    return res.ok;
  } catch (err) {
    console.warn('[notifications] Failed to send workspace notification:', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Pre-built notification helpers for each workspace app
// ---------------------------------------------------------------------------

/** Meet: Meeting started */
export function notifyMeetingStarted(meetingTitle: string, roomCode: string) {
  return sendWorkspaceNotification({
    subject: `📹 Meeting started: ${meetingTitle}`,
    body: `A new meeting has been started in the workspace.\n\n` +
      `Meeting: ${meetingTitle}\n` +
      `Room Code: ${roomCode}\n` +
      `Time: ${new Date().toLocaleString()}\n\n` +
      `You can join this meeting from the Meet tab in your workspace.`,
    senderName: 'altitude Meet',
    senderEmail: 'meet@altitude.app',
    category: 'primary',
  });
}

/** Meet: Meeting ended */
export function notifyMeetingEnded(meetingTitle: string, duration: string) {
  return sendWorkspaceNotification({
    subject: `📹 Meeting ended: ${meetingTitle}`,
    body: `The meeting has ended.\n\n` +
      `Meeting: ${meetingTitle}\n` +
      `Duration: ${duration}\n` +
      `Ended at: ${new Date().toLocaleString()}\n\n` +
      `AI summaries and recordings will be available in the AI Memory and Recordings tabs.`,
    senderName: 'altitude Meet',
    senderEmail: 'meet@altitude.app',
    category: 'primary',
  });
}

/** Meet: Participant joined */
export function notifyParticipantJoined(meetingTitle: string, participantName: string) {
  return sendWorkspaceNotification({
    subject: `👤 ${participantName} joined: ${meetingTitle}`,
    body: `A participant has joined your meeting.\n\n` +
      `Meeting: ${meetingTitle}\n` +
      `Participant: ${participantName}\n` +
      `Time: ${new Date().toLocaleString()}`,
    senderName: 'altitude Meet',
    senderEmail: 'meet@altitude.app',
    category: 'updates',
  });
}

/** Meet: Recording saved */
export function notifyRecordingSaved(meetingTitle: string) {
  return sendWorkspaceNotification({
    subject: `🎬 Recording saved: ${meetingTitle}`,
    body: `A meeting recording has been saved.\n\n` +
      `Meeting: ${meetingTitle}\n` +
      `Time: ${new Date().toLocaleString()}\n\n` +
      `View it in the Recordings tab in your workspace.`,
    senderName: 'altitude Meet',
    senderEmail: 'meet@altitude.app',
    category: 'primary',
    starred: true,
  });
}

/** Drive: Connected */
export function notifyDriveConnected(googleEmail: string) {
  return sendWorkspaceNotification({
    subject: `☁️ Google Drive connected`,
    body: `Your Google Drive has been connected to altitude Drive.\n\n` +
      `Google Account: ${googleEmail}\n` +
      `Connected at: ${new Date().toLocaleString()}\n\n` +
      `You can now upload, download, and manage files from the Drive tab.`,
    senderName: 'altitude Drive',
    senderEmail: 'drive@altitude.app',
    category: 'primary',
    starred: true,
  });
}

/** Drive: File uploaded */
export function notifyDriveFileUploaded(fileName: string, fileSize: string) {
  return sendWorkspaceNotification({
    subject: `📁 File uploaded: ${fileName}`,
    body: `A file has been uploaded to your altitude Drive.\n\n` +
      `File: ${fileName}\n` +
      `Size: ${fileSize}\n` +
      `Time: ${new Date().toLocaleString()}\n\n` +
      `Access it from the Drive tab.`,
    senderName: 'altitude Drive',
    senderEmail: 'drive@altitude.app',
    category: 'updates',
  });
}

/** Drive: File deleted */
export function notifyDriveFileDeleted(fileName: string) {
  return sendWorkspaceNotification({
    subject: `🗑️ File deleted: ${fileName}`,
    body: `A file has been deleted from your altitude Drive.\n\n` +
      `File: ${fileName}\n` +
      `Time: ${new Date().toLocaleString()}\n\n` +
      `Deleted files can be recovered from Google Drive trash within 30 days.`,
    senderName: 'altitude Drive',
    senderEmail: 'drive@altitude.app',
    category: 'updates',
  });
}

/** Drive: Folder created */
export function notifyDriveFolderCreated(folderName: string) {
  return sendWorkspaceNotification({
    subject: `📂 Folder created: ${folderName}`,
    body: `A new folder has been created in your altitude Drive.\n\n` +
      `Folder: ${folderName}\n` +
      `Time: ${new Date().toLocaleString()}`,
    senderName: 'altitude Drive',
    senderEmail: 'drive@altitude.app',
    category: 'updates',
  });
}

/** Generic workspace notification */
export function notifyGeneric(
  title: string,
  message: string,
  senderName?: string,
  senderEmail?: string,
) {
  return sendWorkspaceNotification({
    subject: title,
    body: message,
    senderName,
    senderEmail,
    category: 'primary',
  });
}
