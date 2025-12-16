import { createClient } from '@supabase/supabase-js';

// Cast import.meta to any to resolve TypeScript error "Property 'env' does not exist on type 'ImportMeta'"
const env = (import.meta as any).env || {};

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase URL or Anon Key. Leaderboard will not function correctly.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);