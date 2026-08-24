import { getSupabase, getAuthUser, isAltitudeEmail } from '../lib/supabase.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user || !isAltitudeEmail(user.email)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabase();
  if (!supabase) return res.status(500).json({ error: 'Database not configured' });

  const { folder = 'inbox' } = req.query;

  const { data, error } = await supabase
    .from('mail_emails')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // Filter by folder
  const emails = (data || []).filter(e => {
    if (folder === 'inbox') return !e.is_deleted && !e.is_archived;
    if (folder === 'starred') return e.is_starred && !e.is_deleted;
    if (folder === 'sent') return e.is_sent;
    if (folder === 'drafts') return e.is_draft;
    if (folder === 'archive') return e.is_archived;
    if (folder === 'spam') return e.is_spam;
    return true;
  });

  return res.json({ emails });
}
