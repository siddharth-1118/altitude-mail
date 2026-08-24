import { supabase } from './supabase';
import { Meeting, AIMemoryItem, Recording } from '../types';

// ---------------------------------------------------------------------------
// Row shapes as stored in Supabase (snake_case) and the app's domain types
// (camelCase). Mappers translate between the two.
// ---------------------------------------------------------------------------

interface MeetingRow {
  id: string;
  title: string;
  time: string | null;
  duration: string | null;
  description: string | null;
  code: string;
  status: Meeting['status'];
  has_cyan_border: boolean | null;
  participants: Meeting['participants'] | null;
}

interface AIMemoryRow {
  id: string;
  meeting_title: string;
  date: string | null;
  duration: string | null;
  summary: string | null;
  key_decisions: string[] | null;
  action_items: AIMemoryItem['actionItems'] | null;
  sentiment: string | null;
}

interface RecordingRow {
  id: string;
  title: string;
  date: string | null;
  duration: string | null;
  size: string | null;
  views: number | null;
  thumbnail_url: string | null;
  highlights: Recording['highlights'] | null;
}

const toMeeting = (row: MeetingRow): Meeting => ({
  id: row.id,
  title: row.title,
  time: row.time ?? '',
  duration: row.duration ?? '',
  description: row.description ?? '',
  code: row.code,
  hasCyanBorder: row.has_cyan_border ?? false,
  status: row.status,
  participants: row.participants ?? [],
});

const toMeetingRow = (m: Meeting): MeetingRow => ({
  id: m.id,
  title: m.title,
  time: m.time,
  duration: m.duration,
  description: m.description,
  code: m.code,
  status: m.status,
  has_cyan_border: m.hasCyanBorder ?? false,
  participants: m.participants ?? [],
});

const toAIMemory = (row: AIMemoryRow): AIMemoryItem => ({
  id: row.id,
  meetingTitle: row.meeting_title,
  date: row.date ?? '',
  duration: row.duration ?? '',
  summary: row.summary ?? '',
  keyDecisions: row.key_decisions ?? [],
  actionItems: row.action_items ?? [],
  sentiment: row.sentiment ?? '',
});

const toAIMemoryRow = (item: AIMemoryItem): AIMemoryRow => ({
  id: item.id,
  meeting_title: item.meetingTitle,
  date: item.date,
  duration: item.duration,
  summary: item.summary,
  key_decisions: item.keyDecisions,
  action_items: item.actionItems,
  sentiment: item.sentiment,
});

const toRecording = (row: RecordingRow): Recording => ({
  id: row.id,
  title: row.title,
  date: row.date ?? '',
  duration: row.duration ?? '',
  size: row.size ?? '',
  views: row.views ?? 0,
  thumbnailUrl: row.thumbnail_url ?? '',
  highlights: row.highlights ?? [],
});

const requireClient = () => {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
    );
  }
  return supabase;
};

// ---------------------------------------------------------------------------
// Meetings
// ---------------------------------------------------------------------------

export async function fetchMeetings(): Promise<Meeting[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('meetings')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toMeeting);
}

export async function upsertMeeting(meeting: Meeting): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from('meetings')
    .upsert(toMeetingRow(meeting), { onConflict: 'id' });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// AI Memory
// ---------------------------------------------------------------------------

export async function fetchAIMemory(): Promise<AIMemoryItem[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('ai_memory')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toAIMemory);
}

export async function upsertAIMemoryItems(items: AIMemoryItem[]): Promise<void> {
  if (items.length === 0) return;
  const client = requireClient();
  const { error } = await client
    .from('ai_memory')
    .upsert(items.map(toAIMemoryRow), { onConflict: 'id' });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Recordings
// ---------------------------------------------------------------------------

export async function fetchRecordings(): Promise<Recording[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('recordings')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toRecording);
}
