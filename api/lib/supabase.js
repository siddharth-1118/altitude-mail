import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

let _client = null;

export function getSupabase() {
  if (!_client && supabaseUrl && supabaseAnonKey) {
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

export async function getAuthUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data.user) return { id: data.user.id, email: data.user.email || '' };
  }
  return null;
}

export function isAltitudeEmail(email) {
  return /^[\w.-]+@altitude\.com$/i.test(email.trim().toLowerCase());
}
