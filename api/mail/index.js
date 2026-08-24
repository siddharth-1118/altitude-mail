import { getSupabase, getAuthUser, isAltitudeEmail } from '../lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user || !isAltitudeEmail(user.email)) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = getSupabase();
  if (!supabase) return res.status(500).json({ error: 'Database not configured' });

  // Fetch all mail data in parallel
  const [emails, meetings, tasks, followUps, decisions, newsletters, settings] = await Promise.all([
    supabase.from('mail_emails').select('*').order('created_at', { ascending: false }),
    supabase.from('mail_meetings').select('*').order('created_at', { ascending: false }),
    supabase.from('mail_tasks').select('*').order('created_at', { ascending: false }),
    supabase.from('mail_followups').select('*').order('created_at', { ascending: false }),
    supabase.from('mail_decisions').select('*').order('created_at', { ascending: false }),
    supabase.from('mail_newsletters').select('*').order('created_at', { ascending: false }),
    supabase.from('mail_settings').select('*').eq('user_id', user.id).single(),
  ]);

  return res.json({
    emails: emails.data || [],
    meetings: meetings.data || [],
    tasks: tasks.data || [],
    followUps: followUps.data || [],
    decisions: decisions.data || [],
    newsletters: newsletters.data || [],
    settings: settings.data || null,
  });
}
