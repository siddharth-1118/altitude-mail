import { getSupabase, getAuthUser, isAltitudeEmail } from '../lib/supabase.js';

const COLLECTION_MAP = {
  emails: { table: 'mail_emails', bodyKey: 'emails', parseRow: (e) => ({
    id: e.id, sender_name: e.sender?.name, sender_email: e.sender?.email, sender_initials: e.sender?.initials,
    recipient: e.recipient, subject: e.subject, snippet: e.snippet, body: e.body,
    timestamp: e.timestamp, is_read: e.isRead, is_starred: e.isStarred,
    category: e.category, folder: e.folder, priority_text: e.priorityBadge?.text,
    ai_summary_bullets: e.aiSummary?.bullets, ai_action_required: e.aiSummary?.actionRequired,
    ai_deadline: e.aiSummary?.deadline, confirm_url: e.confirmUrl,
  })},
  meetings: { table: 'mail_meetings', bodyKey: 'meetings' },
  tasks: { table: 'mail_tasks', bodyKey: 'tasks' },
  followups: { table: 'mail_followups', bodyKey: 'followUps' },
  decisions: { table: 'mail_decisions', bodyKey: 'decisions' },
  newsletters: { table: 'mail_newsletters', bodyKey: 'newsletters' },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await getAuthUser(req);
  if (!user || !isAltitudeEmail(user.email)) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = getSupabase();
  if (!supabase) return res.status(500).json({ error: 'Database not configured' });

  const collection = req.query.collection;
  const config = COLLECTION_MAP[collection];
  if (!config) return res.status(404).json({ error: 'Unknown collection: ' + collection });

  if (req.method === 'GET') {
    const { data, error } = await supabase.from(config.table).select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ [collection]: data || [] });
  }

  if (req.method === 'POST') {
    const items = req.body[config.bodyKey] || req.body.items;
    if (!Array.isArray(items)) return res.status(400).json({ error: config.bodyKey + ' array required' });
    const rows = config.parseRow ? items.map(config.parseRow) : items;
    const { error } = await supabase.from(config.table).upsert(rows, { onConflict: 'id' });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
    const { error } = await supabase.from(config.table).delete().in('id', ids);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
