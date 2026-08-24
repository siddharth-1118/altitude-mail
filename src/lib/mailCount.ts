// ---------------------------------------------------------------------------
// Unread mail count helper — polls the mail server for the count of unread
// inbox emails so the Sidebar can show a badge.
// ---------------------------------------------------------------------------

import { supabase } from './supabase';
import { mailApiUrl } from './mailApiBase';

let _cachedCount: number | null = null;
let _lastFetch = 0;
const CACHE_TTL_MS = 15_000; // 15 seconds

export async function fetchUnreadMailCount(): Promise<number> {
  const now = Date.now();
  if (_cachedCount !== null && now - _lastFetch < CACHE_TTL_MS) {
    return _cachedCount;
  }

  try {
    if (!supabase) return _cachedCount ?? 0;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return _cachedCount ?? 0;

    const res = await fetch(mailApiUrl('/api/mail'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return _cachedCount ?? 0;

    const json = await res.json();
    const emails: any[] = json.emails ?? [];
    const count = emails.filter(
      (e: any) => !e.isRead && e.folder === 'inbox'
    ).length;

    _cachedCount = count;
    _lastFetch = now;
    return count;
  } catch {
    return _cachedCount ?? 0;
  }
}

export function clearMailCountCache() {
  _cachedCount = null;
  _lastFetch = 0;
}
