import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cast import.meta to any to resolve TypeScript error
const env = (import.meta as any).env || {};

// Credentials provided by user
const FALLBACK_URL = "https://owkzxyzjwgbhjcceqlpv.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93a3p4eXpqd2diaGpjY2VxbHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDg0NTksImV4cCI6MjA4MTQ4NDQ1OX0.M2w7-wQLLf8d2Tc2yTvAb8ftJqRhM2bX6yeqd5kZf0Y";

const supabaseUrl = env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;

let client: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("Failed to initialize Supabase client:", e);
    // Fallback to mock if initialization fails
    client = createMockClient();
  }
} else {
  console.warn('Missing Supabase Environment Variables. Leaderboard will not function.');
  client = createMockClient();
}

function createMockClient(): SupabaseClient {
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        order: (column: string, options?: any) => ({
          limit: (count: number) => Promise.resolve({ data: [], error: null })
        })
      }),
      insert: (values: any) => Promise.resolve({ data: null, error: null })
    })
  } as unknown as SupabaseClient;
}

export const supabase = client;