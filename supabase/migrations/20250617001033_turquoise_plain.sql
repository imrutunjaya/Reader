/*
  # Fix chapters table schema and policies

  1. Changes
    - Add missing columns to existing chapters table if they don't exist
    - Update existing policies or create them if they don't exist
    - Ensure proper defaults and constraints

  2. Security
    - Maintain existing RLS policies
    - Ensure authenticated users can manage chapters
    - Keep public read access
*/

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'name'
  ) THEN
    ALTER TABLE chapters ADD COLUMN name text;
  END IF;

  -- Update name column to be NOT NULL with default from title
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'name'
  ) THEN
    UPDATE chapters SET name = COALESCE(name, title, 'Untitled') WHERE name IS NULL;
    ALTER TABLE chapters ALTER COLUMN name SET NOT NULL;
  END IF;

  -- Add subtitle column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'subtitle'
  ) THEN
    ALTER TABLE chapters ADD COLUMN subtitle text;
  END IF;

  -- Update author column to have default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'author'
  ) THEN
    ALTER TABLE chapters ALTER COLUMN author SET DEFAULT 'Anonymous';
    UPDATE chapters SET author = 'Anonymous' WHERE author IS NULL OR author = '';
    ALTER TABLE chapters ALTER COLUMN author SET NOT NULL;
  END IF;

  -- Update category column to have default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'category'
  ) THEN
    ALTER TABLE chapters ALTER COLUMN category SET DEFAULT 'General';
    UPDATE chapters SET category = 'General' WHERE category IS NULL OR category = '';
    ALTER TABLE chapters ALTER COLUMN category SET NOT NULL;
  END IF;

  -- Update tags column to have default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'tags'
  ) THEN
    ALTER TABLE chapters ALTER COLUMN tags SET DEFAULT '{}';
    UPDATE chapters SET tags = '{}' WHERE tags IS NULL;
  END IF;

  -- Update difficulty column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'difficulty'
  ) THEN
    ALTER TABLE chapters ALTER COLUMN difficulty SET DEFAULT 'Beginner';
    UPDATE chapters SET difficulty = 'Beginner' WHERE difficulty IS NULL OR difficulty = '';
    ALTER TABLE chapters ALTER COLUMN difficulty SET NOT NULL;
    
    -- Drop existing constraint if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_name = 'chapters' AND constraint_name LIKE '%difficulty%'
    ) THEN
      ALTER TABLE chapters DROP CONSTRAINT IF EXISTS chapters_difficulty_check;
    END IF;
    
    -- Add new constraint
    ALTER TABLE chapters ADD CONSTRAINT chapters_difficulty_check 
      CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced'));
  END IF;

  -- Update estimated_read_time column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'estimated_read_time'
  ) THEN
    ALTER TABLE chapters ALTER COLUMN estimated_read_time SET DEFAULT 5;
    UPDATE chapters SET estimated_read_time = 5 WHERE estimated_read_time IS NULL;
    ALTER TABLE chapters ALTER COLUMN estimated_read_time SET NOT NULL;
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE chapters ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Anyone can read chapters" ON chapters;
DROP POLICY IF EXISTS "Authenticated users can insert chapters" ON chapters;
DROP POLICY IF EXISTS "Authenticated users can update chapters" ON chapters;
DROP POLICY IF EXISTS "Authenticated users can delete chapters" ON chapters;

-- Create policies
CREATE POLICY "Anyone can read chapters"
  ON chapters
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert chapters"
  ON chapters
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update chapters"
  ON chapters
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete chapters"
  ON chapters
  FOR DELETE
  TO authenticated
  USING (true);

-- Create or replace the updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;

CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();