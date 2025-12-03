import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase URL or Anon Key. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      // Critical: Prevent token refresh errors
      autoRefreshToken: true,
      persistSession: true,

      // Use localStorage (default) - more stable than sessionStorage for Capacitor
      storage: window.localStorage,
    }
  }
);

