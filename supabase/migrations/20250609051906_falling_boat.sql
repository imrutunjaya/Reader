/*
  # Create chapters table for Knowledge Library

  1. New Tables
    - `chapters`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `subtitle` (text, optional)
      - `author` (text, required)
      - `content` (text, required)
      - `category` (text, required)
      - `tags` (text array)
      - `difficulty` (text, required)
      - `estimated_read_time` (integer, required)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `chapters` table
    - Add policy for public read access
    - Add policy for authenticated users to manage chapters
*/

CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  author text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  difficulty text NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  estimated_read_time integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Allow public read access to chapters
CREATE POLICY "Anyone can read chapters"
  ON chapters
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert chapters
CREATE POLICY "Authenticated users can insert chapters"
  ON chapters
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update chapters
CREATE POLICY "Authenticated users can update chapters"
  ON chapters
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete chapters
CREATE POLICY "Authenticated users can delete chapters"
  ON chapters
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();