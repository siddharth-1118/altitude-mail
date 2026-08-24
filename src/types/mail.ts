// ---------------------------------------------------------------------------
// altitude Mail — workspace mail types (from the altitude repo)
// Persisted per-user on the workspace server via src/lib/mailApi.ts
// ---------------------------------------------------------------------------

export type MailNavTab =
  | 'inbox'
  | 'action-center'
  | 'cleaner'
  | 'analytics'
  | 'starred'
  | 'sent'
  | 'drafts'
  | 'archive'
  | 'spam'
  | 'settings'
  | 'help';

export type EmailCategory = 'primary' | 'promotions' | 'social' | 'updates';

export type EmailFolder = 'inbox' | 'starred' | 'sent' | 'drafts' | 'archive' | 'spam';

export interface EmailAttachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'image' | 'zip';
  url?: string;
}

export interface Email {
  id: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
    initials: string;
    isStarredSender?: boolean;
  };
  recipient: string;
  subject: string;
  snippet: string;
  body: string;
  timestamp: string;
  formattedDate: string;
  isRead: boolean;
  isStarred: boolean;
  category: EmailCategory;
  priorityBadge?: {
    text: string;
    isHigh?: boolean;
  };
  hasBlueIndicator?: boolean;
  aiSummary?: {
    bullets: string[];
    actionRequired?: string;
    deadline?: string;
  };
  attachments?: EmailAttachment[];
  folder: EmailFolder;
  /** Present on "Confirm your altitude account" messages — the in-mail confirm link. */
  confirmUrl?: string;
}

export interface MeetingItem {
  id: string;
  title: string;
  timeframe: string;
  dateStr: string;
  sender: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface TaskItem {
  id: string;
  title: string;
  from: string;
  isHighPriority: boolean;
  status: 'pending' | 'completed';
}

export interface FollowUpItem {
  id: string;
  title: string;
  waitingFor: string;
  daysWaiting: number;
  status: 'pending' | 'sent';
}

export interface DecisionItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'reviewed';
}

export interface NewsletterItem {
  id: string;
  name: string;
  email: string;
  initials: string;
  bgColor: string;
  activity: string;
  selected: boolean;
  unsubscribed: boolean;
}

export interface UserSettings {
  enableAiSummaries: boolean;
  enableAiPriority: boolean;
  enableSmartSearch: boolean;
  enableInboxCleaner: boolean;
  enableMeetingDetection: boolean;
}

export type ToneType = 'Professional' | 'Friendly' | 'Formal' | 'Concise' | 'Detailed';
