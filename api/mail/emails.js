import { getSupabase, getAuthUser, isAltitudeEmail } from '../lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await getAuthUser(req);
  if (!user || !isAltitudeEmail(user.email)) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = getSupabase();
  if (!supabase) return res.status(500).json({ error: 'Database not configured' });

  if (req.method === 'GET') {
    const { folder } = req.query;
    let query = supabase.from('mail_emails').select('*').order('created_at', { ascending: false });
    if (folder) query = query.eq('folder', folder);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ emails: data || [] });
  }

  if (req.method === 'POST') {
    const { emails } = req.body;
    if (!Array.isArray(emails)) return res.status(400).json({ error: 'emails array required' });
    const rows = emails.map(e => ({
      id: e.id, sender_name: e.sender?.name, sender_email: e.sender?.email, sender_initials: e.sender?.initials,
      recipient: e.recipient, subject: e.subject, snippet: e.snippet, body: e.body,
      timestamp: e.timestamp, is_read: e.isRead, is_starred: e.isStarred,
      category: e.category, folder: e.folder, priority_text: e.priorityBadge?.text,
      ai_summary_bullets: e.aiSummary?.bullets, ai_action_required: e.aiSummary?.actionRequired,
      ai_deadline: e.aiSummary?.deadline, confirm_url: e.confirmUrl,
    }));
    const { error } = await supabase.from('mail_emails').upsert(rows, { onConflict: 'id' });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
    const { error } = await supabase.from('mail_emails').delete().in('id', ids);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
