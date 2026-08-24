import type {
  Email,
  MeetingItem,
  TaskItem,
  FollowUpItem,
  DecisionItem,
  NewsletterItem,
  UserSettings,
} from '../types/mail';
import { supabase } from './supabase';
import { mailApiUrl } from './mailApiBase';

// ---------------------------------------------------------------------------
// altitude Mail data layer.
// The mail app connects to the workspace server through REST APIs only — no
// direct database access. The server validates the Supabase access token from
// the Authorization header and stores mail data in its own JSON store.
// ---------------------------------------------------------------------------

export const DEFAULT_MAIL_SETTINGS: UserSettings = {
  enableAiSummaries: true,
  enableAiPriority: true,
  enableSmartSearch: false,
  enableInboxCleaner: true,
  enableMeetingDetection: true,
};

async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(mailApiUrl(path), {
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
// Emails
// ---------------------------------------------------------------------------

export async function fetchEmails(): Promise<Email[]> {
  const data = await fetchAllMailData();
  return data.emails;
}

export async function upsertEmails(emails: Email[]): Promise<void> {
  if (emails.length === 0) return;
  await request<{ ok: boolean }>('/api/mail/emails', {
    method: 'POST',
    body: JSON.stringify({ emails }),
  });
}

export async function deleteEmails(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await request<{ ok: boolean }>('/api/mail/emails', {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  });
}

// ---------------------------------------------------------------------------
// Action Center: meetings / tasks / follow-ups / decisions
// ---------------------------------------------------------------------------

function upsertCollection<T>(path: string, bodyKey: string, items: T[]) {
  if (items.length === 0) return Promise.resolve();
  return request<{ ok: boolean }>(path, {
    method: 'POST',
    body: JSON.stringify({ [bodyKey]: items }),
  });
}

export const upsertMailMeetings = (items: MeetingItem[]) =>
  upsertCollection('/api/mail/meetings', 'meetings', items);

export const upsertMailTasks = (items: TaskItem[]) =>
  upsertCollection('/api/mail/tasks', 'tasks', items);

export const upsertMailFollowUps = (items: FollowUpItem[]) =>
  upsertCollection('/api/mail/followups', 'followUps', items);

export const upsertMailDecisions = (items: DecisionItem[]) =>
  upsertCollection('/api/mail/decisions', 'decisions', items);

// ---------------------------------------------------------------------------
// Newsletters (inbox cleaner)
// ---------------------------------------------------------------------------

export const upsertMailNewsletters = (items: NewsletterItem[]) =>
  upsertCollection('/api/mail/newsletters', 'newsletters', items);

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function fetchMailSettings(): Promise<UserSettings> {
  const settings = await request<Partial<UserSettings> | null>('/api/mail/settings');
  return { ...DEFAULT_MAIL_SETTINGS, ...(settings ?? {}) };
}

export async function upsertMailSettings(settings: UserSettings): Promise<void> {
  await request<{ ok: boolean }>('/api/mail/settings', {
    method: 'POST',
    body: JSON.stringify({ settings }),
  });
}

// Convenience: load everything the mail app needs in one shot.
export async function fetchAllMailData(): Promise<{
  emails: Email[];
  meetings: MeetingItem[];
  tasks: TaskItem[];
  followUps: FollowUpItem[];
  decisions: DecisionItem[];
  newsletters: NewsletterItem[];
  settings: UserSettings;
}> {
  const data = await request<{
    emails: Email[];
    meetings: MeetingItem[];
    tasks: TaskItem[];
    followUps: FollowUpItem[];
    decisions: DecisionItem[];
    newsletters: NewsletterItem[];
    settings: UserSettings | null;
  }>('/api/mail');
  return {
    emails: data.emails ?? [],
    meetings: data.meetings ?? [],
    tasks: data.tasks ?? [],
    followUps: data.followUps ?? [],
    decisions: data.decisions ?? [],
    newsletters: data.newsletters ?? [],
    settings: { ...DEFAULT_MAIL_SETTINGS, ...(data.settings ?? {}) },
  };
}
