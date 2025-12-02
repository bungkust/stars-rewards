-- Migration to add soft delete functionality
-- Run this after updating the main schema

-- Add deleted_at columns to existing tables
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE children ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Create partial indexes for better performance on soft delete queries
CREATE INDEX IF NOT EXISTS profiles_deleted_at_idx ON profiles(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS children_deleted_at_idx ON children(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS tasks_deleted_at_idx ON tasks(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS rewards_deleted_at_idx ON rewards(deleted_at) WHERE deleted_at IS NOT NULL;

-- Update RLS policies to respect soft delete (if not already updated)
-- Note: These should be run after the main schema is updated

-- Update children policies
DROP POLICY IF EXISTS "Parents can view own children." ON children;
CREATE POLICY "Parents can view own children." ON children
  FOR SELECT USING (auth.uid() = parent_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Parents can update own children." ON children;
CREATE POLICY "Parents can update own children." ON children
  FOR UPDATE USING (auth.uid() = parent_id AND deleted_at IS NULL);

-- Add soft delete policy for children
CREATE POLICY "Parents can soft delete own children." ON children
  FOR UPDATE USING (auth.uid() = parent_id);

-- Update tasks policies
DROP POLICY IF EXISTS "Parents can view own tasks." ON tasks;
CREATE POLICY "Parents can view own tasks." ON tasks
  FOR SELECT USING (auth.uid() = parent_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Parents can update own tasks." ON tasks;
CREATE POLICY "Parents can update own tasks." ON tasks
  FOR UPDATE USING (auth.uid() = parent_id AND deleted_at IS NULL);

-- Add soft delete policy for tasks
CREATE POLICY "Parents can soft delete own tasks." ON tasks
  FOR UPDATE USING (auth.uid() = parent_id);

-- Update rewards policies
DROP POLICY IF EXISTS "Parents can view own rewards." ON rewards;
CREATE POLICY "Parents can view own rewards." ON rewards
  FOR SELECT USING (auth.uid() = parent_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Parents can update own rewards." ON rewards;
CREATE POLICY "Parents can update own rewards." ON rewards
  FOR UPDATE USING (auth.uid() = parent_id AND deleted_at IS NULL);

-- Add soft delete policy for rewards
CREATE POLICY "Parents can soft delete own rewards." ON rewards
  FOR UPDATE USING (auth.uid() = parent_id);

-- Update profiles policy (though profiles are less likely to be soft deleted)
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id AND deleted_at IS NULL);

-- Add soft delete policy for profiles
CREATE POLICY "Users can soft delete own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);
