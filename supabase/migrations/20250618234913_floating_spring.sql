/*
  # Fix chapters table structure

  1. Table Updates
    - Ensure all required columns exist with proper defaults
    - Add missing columns: name, subtitle, updated_at
    - Set proper constraints and defaults for existing columns
    
  2. Security
    - Enable RLS on chapters table
    - Add policies for public read access
    - Add policies for authenticated user CRUD operations
    
  3. Triggers
    - Add updated_at trigger for automatic timestamp updates
*/

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add name column if it doesn't exist (this will be the main title field)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'name'
  ) THEN
    ALTER TABLE chapters ADD COLUMN name text NOT NULL DEFAULT 'Untitled';
  END IF;

  -- Update name column to be NOT NULL if it exists but is nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'name' AND is_nullable = 'YES'
  ) THEN
    UPDATE chapters SET name = COALESCE(name, 'Untitled') WHERE name IS NULL;
    ALTER TABLE chapters ALTER COLUMN name SET NOT NULL;
    ALTER TABLE chapters ALTER COLUMN name SET DEFAULT 'Untitled';
  END IF;

  -- Add subtitle column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'subtitle'
  ) THEN
    ALTER TABLE chapters ADD COLUMN subtitle text;
  END IF;

  -- Update author column to have default and be NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'author'
  ) THEN
    UPDATE chapters SET author = COALESCE(NULLIF(author, ''), 'Anonymous') WHERE author IS NULL OR author = '';
    ALTER TABLE chapters ALTER COLUMN author SET DEFAULT 'Anonymous';
    ALTER TABLE chapters ALTER COLUMN author SET NOT NULL;
  END IF;

  -- Update category column to have default and be NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'category'
  ) THEN
    UPDATE chapters SET category = COALESCE(NULLIF(category, ''), 'General') WHERE category IS NULL OR category = '';
    ALTER TABLE chapters ALTER COLUMN category SET DEFAULT 'General';
    ALTER TABLE chapters ALTER COLUMN category SET NOT NULL;
  END IF;

  -- Update tags column to have default (empty array)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'tags'
  ) THEN
    UPDATE chapters SET tags = COALESCE(tags, '{}') WHERE tags IS NULL;
    ALTER TABLE chapters ALTER COLUMN tags SET DEFAULT '{}';
  END IF;

  -- Update difficulty column with proper constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'difficulty'
  ) THEN
    -- Update any null or empty values
    UPDATE chapters SET difficulty = 'Beginner' WHERE difficulty IS NULL OR difficulty = '';
    
    -- Set default and NOT NULL
    ALTER TABLE chapters ALTER COLUMN difficulty SET DEFAULT 'Beginner';
    ALTER TABLE chapters ALTER COLUMN difficulty SET NOT NULL;
    
    -- Drop existing constraint if it exists
    ALTER TABLE chapters DROP CONSTRAINT IF EXISTS chapters_difficulty_check;
    
    -- Add new constraint
    ALTER TABLE chapters ADD CONSTRAINT chapters_difficulty_check 
      CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced'));
  END IF;

  -- Update estimated_read_time column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'estimated_read_time'
  ) THEN
    UPDATE chapters SET estimated_read_time = COALESCE(estimated_read_time, 5) WHERE estimated_read_time IS NULL;
    ALTER TABLE chapters ALTER COLUMN estimated_read_time SET DEFAULT 5;
    ALTER TABLE chapters ALTER COLUMN estimated_read_time SET NOT NULL;
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE chapters ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;

  -- Ensure content column has a default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'content'
  ) THEN
    UPDATE chapters SET content = COALESCE(content, '') WHERE content IS NULL;
    ALTER TABLE chapters ALTER COLUMN content SET DEFAULT '';
    ALTER TABLE chapters ALTER COLUMN content SET NOT NULL;
  END IF;

  -- Ensure order column has a default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'order'
  ) THEN
    UPDATE chapters SET "order" = COALESCE("order", 1) WHERE "order" IS NULL;
    ALTER TABLE chapters ALTER COLUMN "order" SET DEFAULT 1;
    ALTER TABLE chapters ALTER COLUMN "order" SET NOT NULL;
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