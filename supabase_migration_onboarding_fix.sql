-- Migration: Remove onboarding_step column (Simplified)
-- Run each statement separately in Supabase SQL Editor

-- STEP 1: Drop onboarding_step column
-- This will remove the complex onboarding step tracking
ALTER TABLE profiles DROP COLUMN IF EXISTS onboarding_step;

-- STEP 2: Add parent_name column (if not exists)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parent_name TEXT;

-- STEP 3: Verify migration
-- After running above, check if column is removed:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'profiles' AND column_name = 'onboarding_step';
