import { createClient } from '@supabase/Auth-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing from environment variables.');
  // remind me to  throw an error or handle this more cleanly in production
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');