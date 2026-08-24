import { createClient, SupabaseClient } from '@supabase/supabase-js';

// The anon key is safe to expose client-side: Row Level Security (RLS)
// on the Supabase side protects the data. Never put the service_role key here.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
