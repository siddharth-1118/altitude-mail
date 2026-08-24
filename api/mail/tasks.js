import { getSupabase, getAuthUser, isAltitudeEmail } from '../lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await getAuthUser(req);
  if (!user || !isAltitudeEmail(user.email)) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = getSupabase();
  if (!supabase) return res.status(500).json({ error: 'Database not configured' });

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('mail_tasks').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ tasks: data || [] });
  }

  if (req.method === 'POST') {
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) return res.status(400).json({ error: 'tasks array required' });
    const { error } = await supabase.from('mail_tasks').upsert(tasks, { onConflict: 'id' });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
