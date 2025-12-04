-- SIMPLE MIGRATION: Remove onboarding_step column
-- Run ONE STATEMENT AT A TIME in Supabase SQL Editor

-- STATEMENT 1: Remove the onboarding_step column
ALTER TABLE profiles DROP COLUMN onboarding_step;

-- STATEMENT 2: Add parent_name column if needed
ALTER TABLE profiles ADD COLUMN parent_name TEXT;

-- VERIFICATION: Check if column is removed
-- Run this after the above statements:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'profiles' AND column_name = 'onboarding_step';
