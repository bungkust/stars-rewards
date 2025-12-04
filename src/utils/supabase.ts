import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vxatejctlhszmwxkzaaf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4YXRlamN0bGhzem13eGt6YWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTE2NzYsImV4cCI6MjA4MDA4NzY3Nn0.B6LMDrMkY7M0TublYVzAfuoMr-TKbl8lYrbhMcasISI';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Using fallback Supabase credentials. Please create .env.local file for production.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

