import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://vxatejctlhszmwxkzaaf.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4YXRlamN0bGhzem13eGt6YWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTE2NzYsImV4cCI6MjA4MDA4NzY3Nn0.B6LMDrMkY7M0TublYVzAfuoMr-TKbl8lYrbhMcasISI'),
  },
})
