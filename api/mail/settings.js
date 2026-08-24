import { getSupabase, getAuthUser, isAltitudeEmail } from '../lib/supabase.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await getAuthUser(req);
  if (!user || !isAltitudeEmail(user.email)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabase();
  if (!supabase) return res.status(500).json({ error: 'Database not configured' });

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('mail_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message });
    }

    // Return default settings if none exist
    const settings = data || {
      enable_ai_summaries: true,
      enable_ai_priority: true,
      enable_smart_search: true,
      enable_inbox_cleaner: true,
      enable_meeting_detection: true,
    };

    return res.json({ settings });
  }

  if (req.method === 'PUT') {
    const settings = req.body;
    const { error } = await supabase.from('mail_settings').upsert({
      user_id: user.id,
      enable_ai_summaries: settings.enableAiSummaries,
      enable_ai_priority: settings.enableAiPriority,
      enable_smart_search: settings.enableSmartSearch,
      enable_inbox_cleaner: settings.enableInboxCleaner,
      enable_meeting_detection: settings.enableMeetingDetection,
    }, { onConflict: 'user_id' });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
